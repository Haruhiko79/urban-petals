const SIGNIN_PATH = 'Signin.html';
const ADMIN_ROLES = ['staff', 'admin', 'super_admin', 'employee'];

(function () {
  try {
    const user = JSON.parse(localStorage.getItem('urbanPetalsUser'));
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      window.location.replace(SIGNIN_PATH);
    }
  } catch (error) {
    window.location.replace(SIGNIN_PATH);
  }
})();

function getAdminUser() {
  try { return JSON.parse(localStorage.getItem('urbanPetalsUser')); } catch { return null; }
}

async function adminLogout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch (error) {
    console.warn('Logout request failed:', error.message);
  }
  localStorage.removeItem('urbanPetalsUser');
  window.location.href = SIGNIN_PATH;
}

document.addEventListener('DOMContentLoaded', () => {
  const user = getAdminUser();
  const nameEl = document.getElementById('adminName');
  if (nameEl && user) nameEl.textContent = user.name || user.email;

  document.querySelectorAll('.power-btn').forEach(btn => {
    if (!btn.id || btn.id !== 'logoutBtn') {
      btn.addEventListener('click', async () => {
        if (confirm('Log out of the admin panel?')) await adminLogout();
      });
    }
  });
});
