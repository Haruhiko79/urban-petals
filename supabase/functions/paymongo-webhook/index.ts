import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// PayMongo webhook receiver. Deployed with --no-verify-jwt (PayMongo calls it
// without a Supabase JWT). Every request is authenticated instead with the
// PayMongo-Signature HMAC header against PAYMONGO_WEBHOOK_SECRET.
// Events: payment.paid → order paid; payment.failed → order payment failed.
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const webhookSecret = Deno.env.get('PAYMONGO_WEBHOOK_SECRET');

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok');

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('PayMongo-Signature') ?? '';

    if (webhookSecret) {
      const parts = new Map(signature.split(',').map(s => s.split('=')).filter(p => p.length === 2));
      const timestamp = parts.get('t');
      const hashes = [...signature.matchAll(/(?:,|^)v1=([a-f0-9]+)/gi)].map(m => m[1]);
      if (!timestamp || hashes.length === 0) return new Response('bad signature', { status: 401 });

      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(webhookSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const expected = toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`)));
      if (!hashes.some(h => h === expected)) return new Response('invalid signature', { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const type: string = event?.data?.attributes?.type ?? '';
    const payment = event?.data?.attributes?.data;
    const sourceId: string | undefined = payment?.attributes?.source?.id;
    const paymentId: string | undefined = payment?.id;

    if (!serviceKey) return new Response('not configured', { status: 503 });
    const service = createClient(supabaseUrl!, serviceKey);

    if (sourceId && ['payment.paid', 'payment.failed'].includes(type)) {
      const { data: order } = await service
        .from('orders')
        .select('id, payment_status')
        .eq('paymongo_source_id', sourceId)
        .maybeSingle();
      if (order) {
        const status = type === 'payment.paid' ? 'paid' : 'failed';
        if (order.payment_status !== status) {
          await service
            .from('orders')
            .update({ payment_status: status, ...(paymentId ? { paymongo_payment_id: paymentId } : {}) })
            .eq('id', order.id);
        }
      } else {
        console.warn('paymongo-webhook: no order for source', sourceId, type);
      }
    }

    return new Response('ok');
  } catch (error) {
    console.error('paymongo-webhook error:', error);
    return new Response('ok');
  }
});
