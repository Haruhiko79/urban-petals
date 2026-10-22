import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Creates a PayMongo GCash source for an existing order and returns the
// checkout URL the customer should be sent to (opens the GCash app).
// Secrets: PAYMONGO_SECRET_KEY (only this component ever sees it).
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const paymongoSecret = Deno.env.get('PAYMONGO_SECRET_KEY');
// The customer finishes on the GitHub Pages landing page (PayMongo rejects
// custom schemes; Supabase Edge Functions cannot serve HTML), which routes
// the app back via com.urbanpetals.app://payment/callback.
const CALLBACK_BASE = 'https://haruhiko79.github.io/urban-petals/payment-callback.html';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

async function paymongo(path: string, method: string, body?: unknown): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`https://api.paymongo.com${path}`, {
    method,
    headers: { Authorization: `Basic ${btoa(`${paymongoSecret}:`)}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { ok: res.ok, status: res.status, data: await res.json() };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!supabaseUrl || !anonKey || !serviceKey || !paymongoSecret) {
    return json({ error: 'Payment gateway is not configured. Set PAYMONGO_SECRET_KEY with `supabase secrets set`.' }, 503);
  }

  try {
    const { data: { user }, error: userError } = await createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    }).auth.getUser();
    if (userError || !user) return json({ error: 'Please sign in first.' }, 401);

    const { orderCode } = await req.json().catch(() => ({ orderCode: undefined }));
    if (typeof orderCode !== 'string' || !orderCode.startsWith('UP-')) return json({ error: 'Invalid order.' }, 400);

    const userDb = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: order, error: orderError } = await userDb
      .from('orders')
      .select('id, total_amount, status, payment_status, payment_method, paymongo_source_id')
      .eq('order_code', orderCode)
      .eq('user_id', user.id)
      .maybeSingle();
    if (orderError) return json({ error: orderError.message }, 500);
    if (!order) return json({ error: 'Order not found.' }, 404);
    if (order.payment_status === 'paid') return json({ checkoutUrl: null, sourceId: order.paymongo_source_id, status: 'paid' });
    if (order.payment_method !== 'GCash') return json({ error: 'This order is not a GCash order.' }, 400);

    if (order.paymongo_source_id) {
      const existing = await paymongo(`/v1/sources/${order.paymongo_source_id}`, 'GET');
      if (existing.ok && existing.data?.data?.attributes?.status === 'pending') {
        const url = existing.data.data.attributes.redirect?.checkout_url;
        if (url) return json({ checkoutUrl: url, sourceId: order.paymongo_source_id, status: order.payment_status });
      }
      if (existing.ok && ['chargeable', 'paid'].includes(existing.data?.data?.attributes?.status)) {
        return json({ checkoutUrl: null, sourceId: order.paymongo_source_id, status: 'paid' });
      }
    }

    const amount = Math.round(Number(order.total_amount) * 100);
    if (!Number.isFinite(amount) || amount < 100) return json({ error: 'Order total is below the GCash minimum (₱1.00).' }, 400);

    const created = await paymongo('/v1/sources', 'POST', {
      data: {
        attributes: {
          amount,
          currency: 'PHP',
          type: 'gcash',
          redirect: {
            success: `${CALLBACK_BASE}?status=success&order=${encodeURIComponent(orderCode)}`,
            failed: `${CALLBACK_BASE}?status=failed&order=${encodeURIComponent(orderCode)}`,
          },
        },
      },
    });
    if (!created.ok) {
      const detail = created.data?.errors?.[0]?.detail ?? created.data?.errors?.[0]?.code ?? 'PayMongo rejected the request.';
      return json({ error: `PayMongo error: ${detail}` }, created.status);
    }
    const source = created.data.data;
    const checkoutUrl = source.attributes.redirect?.checkout_url;
    if (!checkoutUrl) return json({ error: 'PayMongo did not return a GCash checkout URL.' }, 502);

    const service = createClient(supabaseUrl, serviceKey);
    const { error: updateError } = await service
      .from('orders')
      .update({ paymongo_source_id: source.id, payment_status: 'gcash-pending' })
      .eq('order_code', orderCode)
      .eq('user_id', user.id);
    if (updateError) return json({ error: updateError.message }, 500);

    return json({ checkoutUrl, sourceId: source.id, status: 'gcash-pending' });
  } catch (error) {
    console.error('create-gcash-payment failed:', error);
    return json({ error: 'Could not start the GCash payment. Please try again.' }, 500);
  }
});
