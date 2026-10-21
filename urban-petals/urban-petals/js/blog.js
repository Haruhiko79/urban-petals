// ── Nav helpers ──
function toggleMobileMenu() { document.getElementById('mobileMenu').classList.toggle('open'); }
function closeMobileMenu() { document.getElementById('mobileMenu').classList.remove('open'); }
function openCartModal() { document.getElementById('cartBackdrop').classList.add('open'); }
function closeCartModal() { document.getElementById('cartBackdrop').classList.remove('open'); }
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Category filter ──
let activeFilter = 'all';
function setFilter(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

// ── Search filter ──
function filterPosts(query) { applyFilters(query); }

function applyFilters(query) {
  query = (query || document.getElementById('blogSearch').value).toLowerCase();
  const cards = document.querySelectorAll('.posts-grid .post-card');
  let visible = 0;
  cards.forEach(card => {
    const cat = card.dataset.cat;
    const text = card.innerText.toLowerCase();
    const catMatch = activeFilter === 'all' || cat === activeFilter;
    const textMatch = !query || text.includes(query);
    const show = catMatch && textMatch;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  document.getElementById('noResults').style.display = visible === 0 ? 'block' : 'none';
  // Show/hide featured based on filter
  document.getElementById('featuredSection').style.display = (activeFilter === 'all' && !query) ? '' : 'none';
}

// ── Newsletter ──
function subscribeNewsletter() {
  const email = document.getElementById('nlEmail').value.trim();
  if (!email || !email.includes('@')) { showToast('Please enter a valid email address.'); return; }
  showToast('You\'re subscribed! 🌿 Welcome to the garden.');
  document.getElementById('nlEmail').value = '';
}

// ── Active nav ──
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.href === location.href) a.classList.add('active');
});