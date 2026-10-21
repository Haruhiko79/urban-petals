const STATS_PATH = '/dashboard/stats';
const POLL_INTERVAL = 15000;

const els = {
  delivered: document.getElementById('num-delivered'),
  transit: document.getElementById('num-transit'),
  new: document.getElementById('num-new'),
  cancelled: document.getElementById('num-cancelled'),
};

const cards = {
  delivered: document.getElementById('card-delivered'),
  transit: document.getElementById('card-transit'),
  new: document.getElementById('card-new'),
  cancelled: document.getElementById('card-cancelled'),
};

const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const lastUpdated = document.getElementById('lastUpdated');
const notifDot = document.getElementById('notifDot');

let prev = { delivered: null, transit: null, new: null, cancelled: null };

function setStatus(state, msg) {
  statusDot.className = `status-dot ${state}`;
  statusText.textContent = msg;
}

function animateNumber(el, newVal) {
  el.classList.remove('loading');
  el.classList.remove('bump');
  void el.offsetWidth;
  el.textContent = newVal;
  el.classList.add('bump');
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function setFetching(isFetching) {
  Object.values(cards).forEach(card => {
    isFetching ? card.classList.add('fetching') : card.classList.remove('fetching');
  });
}

async function updateDashboard() {
  setStatus('loading', 'Refreshing...');
  setFetching(true);

  try {
    const data = await apiRequest(STATS_PATH);
    const mapped = {
      delivered: data.delivered || 0,
      transit: data.transit || 0,
      new: data.new || 0,
      cancelled: data.cancelled || 0,
    };

    const previousNew = prev.new;

    Object.keys(mapped).forEach(key => {
      if (mapped[key] !== prev[key]) {
        animateNumber(els[key], mapped[key]);
        prev[key] = mapped[key];
      }
    });

    if (previousNew !== null && mapped.new > previousNew) {
      notifDot.style.display = 'block';
    }

    setStatus('live', 'Live');
    lastUpdated.textContent = `Updated ${formatTime(new Date())}`;
  } catch (error) {
    console.error('[Dashboard] Fetch error:', error);
    setStatus('error', `Error: ${error.message}`);
  } finally {
    setFetching(false);
  }
}

document.getElementById('bellBtn').addEventListener('click', () => {
  notifDot.style.display = 'none';
});

function startPolling() {
  updateDashboard();
  return setInterval(updateDashboard, POLL_INTERVAL);
}

let pollingHandle = startPolling();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(pollingHandle);
    setStatus('loading', 'Paused (tab hidden)');
  } else {
    pollingHandle = startPolling();
  }
});
