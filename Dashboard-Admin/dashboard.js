/**
 * Urban Petals – Dashboard Data Layer
 * ─────────────────────────────────────────────────────────────────
 * HOW TO CONNECT YOUR BACKEND
 * ─────────────────────────────────────────────────────────────────
 * 1. Set API_BASE to your server's base URL, e.g.:
 *      const API_BASE = 'https://your-api.com/api/v1';
 *
 * 2. Your backend must expose this endpoint:
 *      GET /dashboard/stats
 *
 *    Expected JSON response shape:
 *      {
 *        "delivered":  <number>,
 *        "transit":    <number>,
 *        "new":        <number>,
 *        "cancelled":  <number>
 *      }
 *
 *    Optional: include an auth token by setting AUTH_TOKEN below,
 *    or replace the fetchStats() function entirely with your own
 *    fetching logic (GraphQL, WebSocket, etc.).
 *
 * 3. The dashboard will poll this endpoint every POLL_INTERVAL ms
 *    and animate the numbers whenever they change.
 *
 * 4. For real-time updates (WebSocket / SSE), replace the
 *    startPolling() call at the bottom with your own subscription.
 * ─────────────────────────────────────────────────────────────────
 */

// ── Configuration ────────────────────────────────────────────────
const API_BASE      = '';           // e.g. 'https://yourapi.com/api/v1'
const STATS_PATH    = '/dashboard/stats';
const AUTH_TOKEN    = '';           // e.g. 'Bearer eyJhbGc...'
const POLL_INTERVAL = 15000;        // ms between auto-refreshes (15s)
const USE_MOCK      = true;         // set false when your backend is ready

// ── Mock data (remove or ignore once backend is live) ─────────────
const MOCK_BASE = { delivered: 2, transit: 2, new: 4, cancelled: 2 };
let _mockState  = { ...MOCK_BASE };

function getMockStats() {
  // Randomly drift numbers to simulate live activity
  const keys = ['delivered', 'transit', 'new', 'cancelled'];
  keys.forEach(k => {
    const delta = Math.random() < 0.3 ? (Math.random() < 0.5 ? 1 : -1) : 0;
    _mockState[k] = Math.max(0, _mockState[k] + delta);
  });
  return Promise.resolve({ ..._mockState });
}

// ── Real fetch from backend ───────────────────────────────────────
async function fetchStats() {
  const headers = { 'Content-Type': 'application/json' };
  if (AUTH_TOKEN) headers['Authorization'] = AUTH_TOKEN;

  const res = await fetch(`${API_BASE}${STATS_PATH}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
  // Expected: { delivered, transit, new, cancelled }
}

// ── DOM refs ─────────────────────────────────────────────────────
const els = {
  delivered:  document.getElementById('num-delivered'),
  transit:    document.getElementById('num-transit'),
  new:        document.getElementById('num-new'),
  cancelled:  document.getElementById('num-cancelled'),
};
const cards = {
  delivered:  document.getElementById('card-delivered'),
  transit:    document.getElementById('card-transit'),
  new:        document.getElementById('card-new'),
  cancelled:  document.getElementById('card-cancelled'),
};
const statusDot   = document.getElementById('statusDot');
const statusText  = document.getElementById('statusText');
const lastUpdated = document.getElementById('lastUpdated');
const notifDot    = document.getElementById('notifDot');

// Previous values for change detection
let prev = { delivered: null, transit: null, new: null, cancelled: null };

// ── Helpers ───────────────────────────────────────────────────────
function setStatus(state, msg) {
  statusDot.className = `status-dot ${state}`;
  statusText.textContent = msg;
}

function animateNumber(el, newVal) {
  el.classList.remove('loading');
  el.classList.remove('bump');
  // Force reflow to restart animation
  void el.offsetWidth;
  el.textContent = newVal;
  el.classList.add('bump');
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function setFetching(isFetching) {
  Object.values(cards).forEach(c => {
    isFetching ? c.classList.add('fetching') : c.classList.remove('fetching');
  });
}

// ── Core update function ──────────────────────────────────────────
async function updateDashboard() {
  setStatus('loading', 'Refreshing…');
  setFetching(true);

  try {
    const data = USE_MOCK ? await getMockStats() : await fetchStats();

    // Map response keys → card keys
    const mapped = {
      delivered: data.delivered ?? 0,
      transit:   data.transit   ?? 0,
      new:       data.new       ?? 0,
      cancelled: data.cancelled ?? 0,
    };

    let anyChanged = false;

    Object.keys(mapped).forEach(key => {
      const newVal = mapped[key];
      if (newVal !== prev[key]) {
        animateNumber(els[key], newVal);
        prev[key] = newVal;
        anyChanged = true;
      }
    });

    // Show notification dot if new orders increased
    if (mapped.new > (prev.new ?? 0)) {
      notifDot.style.display = 'block';
    }

    setStatus('live', USE_MOCK ? 'Live (mock data)' : 'Live');
    lastUpdated.textContent = `Updated ${formatTime(new Date())}`;

  } catch (err) {
    console.error('[Dashboard] Fetch error:', err);
    setStatus('error', `Error: ${err.message}`);
  } finally {
    setFetching(false);
  }
}

// ── Clear notification dot on bell click ─────────────────────────
document.getElementById('bellBtn').addEventListener('click', () => {
  notifDot.style.display = 'none';
});

// ── Polling ───────────────────────────────────────────────────────
function startPolling() {
  updateDashboard();                              // immediate first load
  return setInterval(updateDashboard, POLL_INTERVAL);
}

// ── Boot ─────────────────────────────────────────────────────────
let pollingHandle = startPolling();

// Optional: pause polling when tab is hidden, resume when visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(pollingHandle);
    setStatus('loading', 'Paused (tab hidden)');
  } else {
    pollingHandle = startPolling();
  }
});

/**
 * ─────────────────────────────────────────────────────────────────
 * WEBSOCKET EXAMPLE (uncomment & adapt when backend supports it)
 * ─────────────────────────────────────────────────────────────────
 *
 * const ws = new WebSocket('wss://your-api.com/ws/dashboard');
 *
 * ws.onopen = () => setStatus('live', 'Live (WebSocket)');
 *
 * ws.onmessage = (event) => {
 *   const data = JSON.parse(event.data);
 *   // data should match: { delivered, transit, new, cancelled }
 *   Object.keys(data).forEach(key => {
 *     if (els[key] && data[key] !== prev[key]) {
 *       animateNumber(els[key], data[key]);
 *       prev[key] = data[key];
 *     }
 *   });
 *   lastUpdated.textContent = `Updated ${formatTime(new Date())}`;
 * };
 *
 * ws.onerror = () => setStatus('error', 'WebSocket error');
 * ws.onclose = () => setStatus('error', 'Disconnected – reconnecting…');
 *
 * ─────────────────────────────────────────────────────────────────
 */