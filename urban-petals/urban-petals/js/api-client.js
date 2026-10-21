window.UP_API_BASE = 'api';

async function apiRequest(path, options) {
  const settings = options || {};
  const method = settings.method || 'GET';
  const headers = Object.assign({}, settings.headers || {});
  const request = {
    method,
    headers,
    credentials: 'same-origin',
  };

  if (settings.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    request.body = JSON.stringify(settings.body);
  }

  const response = await fetch(`${window.UP_API_BASE}${path}`, request);
  let payload = null;

  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const message = payload && payload.error ? payload.error : `HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

function formatPeso(value) {
  return `PHP ${Number(value || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
