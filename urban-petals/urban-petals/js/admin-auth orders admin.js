// ── Shared admin auth for Urban Petals admin pages ──
// Path back to the Main Page signin
const SIGNIN_PATH = encodeURI('../../Main Page/Signin.html');

// Auth guard — redirect to signin if not logged in as employee
(function() {
  try {
    const user = JSON.parse(localStorage.getItem('urbanPetalsUser'));
    if (!user || user.role !== 'employee') {
      window.location.replace(SIGNIN_PATH);
    }
  } catch (e) {
    window.location.replace(SIGNIN_PATH);
  }
})();

// Get current user
function getAdminUser() {
  try { return JSON.parse(localStorage.getItem('urbanPetalsUser')); } catch { return null; }
}

// Logout — clears session and goes back to signin
function adminLogout() {
  localStorage.removeItem('urbanPetalsUser');
  window.location.href = SIGNIN_PATH;
}

// Wire up all power/logout buttons on the page
document.addEventListener('DOMContentLoaded', () => {
  // Show employee name in topbar if element exists
  const user = getAdminUser();
  const nameEl = document.getElementById('adminName');
  if (nameEl && user) nameEl.textContent = user.name || user.email;

  // Power button (dashboard, orders, products pages)
  document.querySelectorAll('.power-btn').forEach(btn => {
    // Only wire if it doesn't already have a specific id (accounts.html handles its own)
    if (!btn.id || btn.id !== 'logoutBtn') {
      btn.addEventListener('click', () => {
        if (confirm('Log out of the admin panel?')) adminLogout();
      });
    }
  });
});
