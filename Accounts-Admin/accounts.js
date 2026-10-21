/**
 * Urban Petals – Accounts Page
 * ─────────────────────────────────────────────────────────
 * BACKEND INTEGRATION:
 *   1. Set USE_MOCK = false
 *   2. Set API_BASE to your server (e.g. 'https://api.urbanpetals.com')
 *
 *   Expected endpoints:
 *     GET    /admin/accounts        → account[]
 *     POST   /admin/accounts        → account
 *     PATCH  /admin/accounts/:id    → account
 *     DELETE /admin/accounts/:id    → { success: true }
 *     POST   /auth/logout           → { redirect: '/login' }
 *
 *   Account shape:
 *   { id, name, email, role, lastLogin, loginIp, sessions, status }
 *
 *   role values  : 'Super Admin' | 'Admin' | 'Staff'
 *   status values: 'online' | 'offline' | 'suspended'
 * ─────────────────────────────────────────────────────────
 */
const USE_MOCK = true;
const API_BASE = '';

/* ══════════════════════════════════════════
   API LAYER
   All data operations go through this object.
   Toggle USE_MOCK above to switch data source.
══════════════════════════════════════════ */
const api = {
  async fetchAccounts() {
    if (USE_MOCK) return mockAccounts.map(a => ({ ...a }));
    const r = await fetch(`${API_BASE}/admin/accounts`, { credentials: 'include' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    return data.map(a => ({ ...a, lastLogin: new Date(a.lastLogin) }));
  },

  async createAccount(payload) {
    if (USE_MOCK) {
      const acc = {
        id: nextId++, ...payload,
        lastLogin: new Date(), loginIp: '—', sessions: 0, status: 'offline'
      };
      mockAccounts.unshift(acc);
      return { ...acc };
    }
    const r = await fetch(`${API_BASE}/admin/accounts`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    return { ...data, lastLogin: new Date(data.lastLogin) };
  },

  async updateAccount(id, patch) {
    if (USE_MOCK) {
      const idx = mockAccounts.findIndex(a => a.id === id);
      if (idx === -1) throw new Error('Account not found');
      Object.assign(mockAccounts[idx], patch);
      return { ...mockAccounts[idx] };
    }
    const r = await fetch(`${API_BASE}/admin/accounts/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    return { ...data, lastLogin: new Date(data.lastLogin) };
  },

  async deleteAccount(id) {
    if (USE_MOCK) {
      const idx = mockAccounts.findIndex(a => a.id === id);
      if (idx === -1) throw new Error('Account not found');
      mockAccounts.splice(idx, 1);
      return { success: true };
    }
    const r = await fetch(`${API_BASE}/admin/accounts/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  },

  async logout() {
    if (USE_MOCK) {
      showToast('Logging out…');
      setTimeout(() => {
        // Replace with: window.location.href = '/login';
        alert('Redirecting to login page.\n(Set USE_MOCK = false and implement /auth/logout)');
      }, 600);
      return;
    }
    const r = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    const data = await r.json();
    window.location.href = data.redirect || '/login';
  }
};

/* ══════════════════════════════════════════
   MOCK DATA  (removed when USE_MOCK = false)
══════════════════════════════════════════ */
let mockAccounts = [
  { id:1, name:'Maria Santos',   email:'m.santos@urbanpetals.com',  role:'Super Admin', lastLogin:new Date(Date.now()-4*60000),     loginIp:'192.168.1.10', sessions:2, status:'online'    },
  { id:2, name:'Jose Reyes',     email:'j.reyes@urbanpetals.com',   role:'Admin',       lastLogin:new Date(Date.now()-18*60000),    loginIp:'192.168.1.22', sessions:1, status:'online'    },
  { id:3, name:'Ana Dela Cruz',  email:'a.delacruz@urbanpetals.com',role:'Staff',       lastLogin:new Date(Date.now()-2*3600000),   loginIp:'203.177.88.14',sessions:0, status:'offline'   },
  { id:4, name:'Carlos Mendoza', email:'c.mendoza@urbanpetals.com', role:'Admin',       lastLogin:new Date(Date.now()-1*3600000),   loginIp:'180.232.45.67',sessions:1, status:'online'    },
  { id:5, name:'Liza Bautista',  email:'l.bautista@urbanpetals.com',role:'Staff',       lastLogin:new Date(Date.now()-5*3600000),   loginIp:'112.198.32.90',sessions:0, status:'offline'   },
  { id:6, name:'Ramon Torres',   email:'r.torres@urbanpetals.com',  role:'Staff',       lastLogin:new Date(Date.now()-2*86400000),  loginIp:'120.28.10.55', sessions:0, status:'suspended' },
  { id:7, name:'Celine Aquino',  email:'c.aquino@urbanpetals.com',  role:'Admin',       lastLogin:new Date(Date.now()-30*60000),    loginIp:'202.90.11.34', sessions:1, status:'online'    },
  { id:8, name:'Dennis Garcia',  email:'d.garcia@urbanpetals.com',  role:'Staff',       lastLogin:new Date(Date.now()-7*86400000),  loginIp:'210.1.44.22',  sessions:0, status:'offline'   },
];
let nextId = 9;

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
const avatarColors = [
  'linear-gradient(135deg,#4caf78,#2e7d5a)',
  'linear-gradient(135deg,#5c9de8,#2656a8)',
  'linear-gradient(135deg,#e87c5c,#a83c26)',
  'linear-gradient(135deg,#9c6ce8,#5c2ca8)',
  'linear-gradient(135deg,#e8c45c,#a87c1c)',
  'linear-gradient(135deg,#5ce8c4,#1ca87c)',
];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return avatarColors[h % avatarColors.length];
}
function timeAgo(date) {
  const diff  = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
function formatDateTime(date) {
  return date.toLocaleString('en-PH', {
    month:'short', day:'numeric', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  });
}
function roleClass(role) {
  return role.toLowerCase().replace(' ', '-');
}
function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function getFiltered() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  if (!q) return accounts;
  return accounts.filter(a =>
    a.name.toLowerCase().includes(q)   ||
    a.email.toLowerCase().includes(q)  ||
    a.role.toLowerCase().includes(q)   ||
    a.status.toLowerCase().includes(q)
  );
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ══════════════════════════════════════════
   RENDER
══════════════════════════════════════════ */
let accounts = [];

function renderTable(data) {
  const tbody = document.getElementById('accountsBody');
  tbody.innerHTML = '';
  data.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="acct-cell">
          <div class="acct-avatar" style="background:${avatarColor(a.name)}">${getInitials(a.name)}</div>
          <div>
            <div class="acct-name">${a.name}</div>
            <div class="acct-email">${a.email}</div>
          </div>
        </div>
      </td>
      <td><span class="role-badge ${roleClass(a.role)}">${a.role}</span></td>
      <td>
        <div class="login-time">${formatDateTime(a.lastLogin)}</div>
        <div class="login-ago">${timeAgo(a.lastLogin)}</div>
      </td>
      <td><span class="ip-cell">${a.loginIp}</span></td>
      <td>
        <span class="session-count">
          ${a.sessions > 0 ? '<span class="session-dot"></span>' : ''}
          ${a.sessions}
        </span>
      </td>
      <td><span class="status-badge ${a.status}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
      <td>
        <div class="action-btns">
          ${a.status !== 'suspended' ? `<button class="action-btn suspend" data-id="${a.id}">Suspend</button>` : ''}
          ${a.status === 'suspended' ? `<button class="action-btn restore" data-id="${a.id}">Restore</button>` : ''}
          <button class="action-btn remove" data-id="${a.id}">Remove</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
  updateStats(data);
}

function updateStats(data) {
  document.getElementById('statTotal').textContent     = data.length;
  document.getElementById('statActive').textContent    = data.filter(a => a.status !== 'suspended' && (Date.now() - a.lastLogin.getTime()) < 86400000).length;
  document.getElementById('statSuspended').textContent = data.filter(a => a.status === 'suspended').length;
  document.getElementById('statLogins').textContent    = data.filter(a => (Date.now() - a.lastLogin.getTime()) < 7 * 86400000).length;
  document.getElementById('onlineCount').textContent   = data.filter(a => a.status === 'online').length;
}

/* ══════════════════════════════════════════
   LOAD DATA
══════════════════════════════════════════ */
async function loadAccounts() {
  try {
    accounts = await api.fetchAccounts();
    const badge = document.getElementById('apiStatus');
    badge.textContent  = USE_MOCK ? 'MOCK' : 'LIVE';
    badge.className    = USE_MOCK ? 'api-status' : 'api-status live';
    renderTable(getFiltered());
  } catch (err) {
    showToast('Failed to load accounts: ' + err.message);
  }
}

/* ══════════════════════════════════════════
   TABLE ACTIONS (event delegation)
══════════════════════════════════════════ */
document.getElementById('accountsBody').addEventListener('click', async e => {
  const btn = e.target.closest('.action-btn');
  if (!btn) return;
  const id  = +btn.dataset.id;
  const acc = accounts.find(a => a.id === id);
  if (!acc) return;

  try {
    if (btn.classList.contains('suspend')) {
      await api.updateAccount(id, { status: 'suspended', sessions: 0 });
      showToast(`${acc.name} has been suspended.`);
    } else if (btn.classList.contains('restore')) {
      await api.updateAccount(id, { status: 'offline' });
      showToast(`${acc.name} has been restored.`);
    } else if (btn.classList.contains('remove')) {
      if (!confirm(`Remove ${acc.name}? This cannot be undone.`)) return;
      await api.deleteAccount(id);
      showToast(`${acc.name} has been removed.`);
    }
    accounts = await api.fetchAccounts();
    renderTable(getFiltered());
  } catch (err) {
    showToast('Action failed: ' + err.message);
  }
});

/* ══════════════════════════════════════════
   SEARCH
══════════════════════════════════════════ */
document.getElementById('searchInput').addEventListener('input', () => renderTable(getFiltered()));

/* ══════════════════════════════════════════
   ADD ACCOUNT MODAL
══════════════════════════════════════════ */
const overlay = document.getElementById('modalOverlay');
document.getElementById('addAccountBtn').addEventListener('click', () => overlay.classList.add('open'));
document.getElementById('cancelModal').addEventListener('click',   () => overlay.classList.remove('open'));
overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });

document.getElementById('confirmAdd').addEventListener('click', async () => {
  const name  = document.getElementById('newName').value.trim();
  const email = document.getElementById('newEmail').value.trim();
  const role  = document.getElementById('newRole').value;
  if (!name || !email || !role) { showToast('Please fill in all fields.'); return; }

  try {
    await api.createAccount({ name, email, role });
    ['newName', 'newEmail'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('newRole').value = '';
    overlay.classList.remove('open');
    accounts = await api.fetchAccounts();
    renderTable(getFiltered());
    showToast(`${name} added successfully.`);
  } catch (err) {
    showToast('Failed to add account: ' + err.message);
  }
});

/* ══════════════════════════════════════════
   LOGOUT
══════════════════════════════════════════ */
const logoutOverlay = document.getElementById('logoutOverlay');
document.getElementById('logoutBtn').addEventListener('click',    () => logoutOverlay.classList.add('open'));
document.getElementById('cancelLogout').addEventListener('click', () => logoutOverlay.classList.remove('open'));
logoutOverlay.addEventListener('click', e => { if (e.target === logoutOverlay) logoutOverlay.classList.remove('open'); });

document.getElementById('confirmLogout').addEventListener('click', async () => {
  logoutOverlay.classList.remove('open');
  await api.logout();
});

/* ══════════════════════════════════════════
   AUTO-REFRESH every 30 seconds
══════════════════════════════════════════ */
setInterval(async () => {
  try {
    accounts = await api.fetchAccounts();
    renderTable(getFiltered());
  } catch (err) {
    console.warn('Auto-refresh failed:', err.message);
  }
}, 30000);

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
loadAccounts();