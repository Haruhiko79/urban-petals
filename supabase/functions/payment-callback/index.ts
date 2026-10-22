// Serves the page PayMongo redirects the customer to after a GCash payment.
// It shows a short confirmation and then hands the customer back to the app
// through the com.urbanpetals.app://payment/callback deep link.
const esc = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

Deno.serve((req) => {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') === 'failed' ? 'failed' : 'success';
  const orderCode = /[A-Za-z0-9-]{1,64}/.exec(url.searchParams.get('order') ?? '')?.[0] ?? '';
  const scheme = 'com.urbanpetals.app://payment/callback';
  const deepLink = orderCode ? `${scheme}?status=${status}&order=${encodeURIComponent(orderCode)}` : `${scheme}?status=${status}`;
  const heading = status === 'success'
    ? 'Payment received'
    : 'Payment was not completed';
  const detail = status === 'success'
    ? 'Thanks for your order! The Urban Petals app should already show it as paid. Return to the app now.'
    : 'No payment was taken. You can retry the GCash payment from the order screen in the app.';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Urban Petals — ${esc(heading)}</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #e7e0d1; color: #24331f;
         font-family: Georgia, 'Times New Roman', serif; text-align: center; padding: 24px; }
  .card { max-width: 420px; background: #f3eee3; border: 1px solid #d5cbb8; border-radius: 18px; padding: 32px 28px; }
  h1 { font-size: 1.6rem; margin: 0 0 12px; color: #2e5f2e; }
  p { line-height: 1.55; margin: 0 0 18px; }
  button { border: 0; border-radius: 999px; background: #2e5f2e; color: #fff; padding: 12px 22px;
           font-size: 1rem; font-weight: 700; cursor: pointer; }
  small { display: block; margin-top: 14px; color: #6e8b62; }
</style>
</head>
<body>
  <main class="card">
    <h1>${esc(heading)}</h1>
    <p>${esc(detail)}</p>
    ${orderCode ? `<small>Order ${esc(orderCode)}</small>` : ''}
    <button onclick="location.href='${deepLink}'">Return to Urban Petals</button>
    <small>If nothing happens, open the Urban Petals app manually.</small>
  </main>
  <script>
    setTimeout(function () { window.location.href = '${deepLink}'; }, 1500);
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
});
