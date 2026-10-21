import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// App-facing payment status check (JWT required, called by the storefront).
// Body: { orderCode } → { status: 'paid' | 'gcash-pending' | 'failed' | 'unpaid', paymentStatus }
// If PayMongo reports the source as chargeable (customer completed payment) the
// order is flipped to paid here even if the webhook has not arrived yet.
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
const paymongoSecret = Deno.env.get('PAYMONGO_SECRET_KEY');

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

async function paymongo(path: string, method = 'GET'): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`https://api.paymongo.com${path}`, {
    method,
    headers: { Authorization: `Basic ${btoa(`${paymongoSecret}:`)}`, 'Content-Type': 'application/json' },
  });
  return { ok: res.ok, status: res.status, data: await res.json() };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!supabaseUrl || !anonKey || !paymongoSecret) return json({ error: 'Payment gateway is not configured.' }, 503);

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const { data: { user }, error: userError } = await createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    }).auth.getUser();
    if (userError || !user) return json({ error: 'Please sign in first.' }, 401);

    const body = await req.json().catch(() => ({}));
    const { orderCode } = body;
    if (typeof orderCode !== 'string' || !orderCode.startsWith('UP-')) return json({ error: 'Invalid order.' }, 400);

    const userDb = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: order, error: orderError } = await userDb
      .from('orders')
      .select('payment_status, paymongo_source_id')
      .eq('order_code', orderCode)
      .eq('user_id', user.id)
      .maybeSingle();
    if (orderError) return json({ error: orderError.message }, 500);
    if (!order) return json({ error: 'Order not found.' }, 404);
    if (order.payment_status === 'paid') return json({ status: 'paid', paymentStatus: order.payment_status });

    if (!order.paymongo_source_id) return json({ status: order.payment_status, paymentStatus: order.payment_status });

    const source = await paymongo(`/v1/sources/${order.paymongo_source_id}`);
    if (!source.ok) return json({ status: order.payment_status, paymentStatus: order.payment_status });
    const state = source.data?.data?.attributes?.status as string | undefined;

    if (state === 'chargeable') {
      // Try to capture the canonical payment id (may not exist for a second or two).
      let paymentId: string | null = null;
      const payments = await paymongo('/v1/payments');
      if (payments.ok) {
        const match = (payments.data?.data ?? []).find((p: any) => p?.attributes?.source?.id === order.paymongo_source_id);
        if (match) paymentId = match.id;
      }
      const service = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      await service
        .from('orders')
        .update({ payment_status: 'paid', ...(paymentId ? { paymongo_payment_id: paymentId } : {}) })
        .eq('paymongo_source_id', order.paymongo_source_id)
        .eq('user_id', user.id);
      return json({ status: 'paid', paymentStatus: 'paid' });
    }

    if (state === 'failed' || state === 'expired') {
      return json({ status: 'failed', paymentStatus: order.payment_status });
    }

    return json({ status: order.payment_status, paymentStatus: order.payment_status });
  } catch (error) {
    console.error('check-payment failed:', error);
    return json({ error: 'Could not check the payment. Please try again.' }, 500);
  }
});
