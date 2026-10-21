const api = {
  fetchAccounts() {
    return apiRequest('/admin/accounts');
  },
  createAccount(payload) {
    return apiRequest('/admin/accounts', { method: 'POST', body: payload });
  },
  updateAccount(id, patch) {
    return apiRequest(`/admin/accounts/${id}`, { method: 'PATCH', body: patch });
  },
  deleteAccount(id) {
    return apiRequest(`/admin/accounts/${id}`, { method: 'DELETE' });
  },
  logout() {
    return apiRequest('/auth/logout', { method: 'POST' });
  },
};

const avatarColors = [
  'linear-gradient(135deg,#4caf78,#2e7d5a)',
  'linear-gradient(135deg,#5c9de8,#2656a8)',
  'linear-gradient(135deg,#e87c5c,#a83c26)',
  'linear-gradient(135deg,#9c6ce8,#5c2ca8)',
  'linear-gradient(135deg,#e8c45c,#a87c1c)',
  'linear-gradient(135deg,#5ce8c4,#1ca87c)',
];

let accounts = [];

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  return avatarColors[hash % avatarColors.length];
}

function timeAgo(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function formatDateTime(date) {
  return date.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function roleClass(role) {
  return role.toLowerCase().replace(/\s+/g, '-');
}

function getInitials(name) {
  return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
}

function getFiltered() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  if (!query) return accounts;
  return accounts.filter(account =>
    account.name.toLowerCase().includes(query)
    || account.email.toLowerCase().includes(query)
    || account.role.toLowerCase().includes(query)
    || account.status.toLowerCase().includes(query)
  );
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

function normalizeAccount(account) {
  return {
    ...account,
    lastLogin: new Date(account.lastLogin),
  };
}

function renderTable(data) {
  const tbody = document.getElementById('accountsBody');
  tbody.innerHTML = '';

  data.forEach(account => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="acct-cell">
          <div class="acct-avatar" style="background:${avatarColor(account.name)}">${getInitials(account.name)}</div>
          <div>
            <div class="acct-name">${account.name}</div>
            <div class="acct-email">${account.email}</div>
          </div>
        </div>
      </td>
      <td><span class="role-badge ${roleClass(account.role)}">${account.role}</span></td>
      <td>
        <div class="login-time">${formatDateTime(account.lastLogin)}</div>
        <div class="login-ago">${timeAgo(account.lastLogin)}</div>
      </td>
      <td><span class="ip-cell">${account.loginIp}</span></td>
      <td>
        <span class="session-count">
          ${account.sessions > 0 ? '<span class="session-dot"></span>' : ''}
          ${account.sessions}
        </span>
      </td>
      <td><span class="status-badge ${account.status}">${account.status.charAt(0).toUpperCase() + account.status.slice(1)}</span></td>
      <td>
        <div class="action-btns">
          ${account.status !== 'suspended' ? `<button class="action-btn suspend" data-id="${account.id}">Suspend</button>` : ''}
          ${account.status === 'suspended' ? `<button class="action-btn restore" data-id="${account.id}">Restore</button>` : ''}
          <button class="action-btn remove" data-id="${account.id}">Remove</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });

  updateStats(data);
}

function updateStats(data) {
  document.getElementById('statTotal').textContent = data.length;
  document.getElementById('statActive').textContent = data.filter(account => account.status !== 'suspended' && (Date.now() - account.lastLogin.getTime()) < 86400000).length;
  document.getElementById('statSuspended').textContent = data.filter(account => account.status === 'suspended').length;
  document.getElementById('statLogins').textContent = data.filter(account => (Date.now() - account.lastLogin.getTime()) < 7 * 86400000).length;
  document.getElementById('onlineCount').textContent = data.filter(account => account.status === 'online').length;
}

async function loadAccounts() {
  const badge = document.getElementById('apiStatus');
  badge.textContent = 'LIVE';
  badge.className = 'api-status live';

  accounts = (await api.fetchAccounts()).map(normalizeAccount);
  renderTable(getFiltered());
}

document.getElementById('accountsBody').addEventListener('click', async event => {
  const button = event.target.closest('.action-btn');
  if (!button) return;

  const id = Number(button.dataset.id);
  const account = accounts.find(item => item.id === id);
  if (!account) return;

  try {
    if (button.classList.contains('suspend')) {
      await api.updateAccount(id, { status: 'suspended', sessions: 0 });
      showToast(`${account.name} has been suspended.`);
    } else if (button.classList.contains('restore')) {
      await api.updateAccount(id, { status: 'offline' });
      showToast(`${account.name} has been restored.`);
    } else if (button.classList.contains('remove')) {
      if (!confirm(`Remove ${account.name}? This cannot be undone.`)) return;
      await api.deleteAccount(id);
      showToast(`${account.name} has been removed.`);
    }

    await loadAccounts();
  } catch (error) {
    showToast(`Action failed: ${error.message}`);
  }
});

document.getElementById('searchInput').addEventListener('input', () => renderTable(getFiltered()));

const overlay = document.getElementById('modalOverlay');
document.getElementById('addAccountBtn').addEventListener('click', () => overlay.classList.add('open'));
document.getElementById('cancelModal').addEventListener('click', () => overlay.classList.remove('open'));
overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('open'); });

document.getElementById('confirmAdd').addEventListener('click', async () => {
  const name = document.getElementById('newName').value.trim();
  const email = document.getElementById('newEmail').value.trim();
  const role = document.getElementById('newRole').value;

  if (!name || !email || !role) {
    showToast('Please fill in all fields.');
    return;
  }

  try {
    const created = await api.createAccount({ name, email, role });
    document.getElementById('newName').value = '';
    document.getElementById('newEmail').value = '';
    document.getElementById('newRole').value = '';
    overlay.classList.remove('open');
    await loadAccounts();
    showToast(`${name} added successfully.`);
    alert(`Temporary password for ${created.name}: ${created.tempPassword}\nEmployee ID: ${created.employeeId}`);
  } catch (error) {
    showToast(`Failed to add account: ${error.message}`);
  }
});

const logoutOverlay = document.getElementById('logoutOverlay');
document.getElementById('logoutBtn').addEventListener('click', () => logoutOverlay.classList.add('open'));
document.getElementById('cancelLogout').addEventListener('click', () => logoutOverlay.classList.remove('open'));
logoutOverlay.addEventListener('click', event => { if (event.target === logoutOverlay) logoutOverlay.classList.remove('open'); });

document.getElementById('confirmLogout').addEventListener('click', async () => {
  logoutOverlay.classList.remove('open');
  await adminLogout();
});

setInterval(async () => {
  try {
    await loadAccounts();
  } catch (error) {
    console.warn('Auto-refresh failed:', error.message);
  }
}, 30000);

loadAccounts().catch(error => showToast(`Failed to load accounts: ${error.message}`));
