// ── Shared nav.js for Urban Petals ──
// Cart
const CART_KEY = 'urbanPetalsCart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = total);
}

// Auth
function getUser() {
  try { return JSON.parse(localStorage.getItem('urbanPetalsUser')); } catch { return null; }
}
function saveUser(user) {
  localStorage.setItem('urbanPetalsUser', JSON.stringify(user));
}
function signOut() {
  localStorage.removeItem('urbanPetalsUser');
  showToast('Signed out successfully');
  window.location.href = 'Homepage.html';
}
function updateNavAuth() {
  const user = getUser();
  const authArea = document.getElementById('navAuthArea');
  const mobileAuth = document.getElementById('mobileAuthArea');
  if (!authArea) return;
  // Employees belong in the admin panel — treat as signed out on customer pages
  if (user && user.role !== 'employee') {
    authArea.innerHTML = `<span class="nav-username">Hi, ${user.name.split(' ')[0]}!</span><button class="btn-signout" onclick="signOut()">Sign Out</button>`;
    if (mobileAuth) mobileAuth.innerHTML = `<span class="nav-username">Hi, ${user.name.split(' ')[0]}!</span><button class="btn-signout" onclick="signOut()">Sign Out</button>`;
  } else {
    authArea.innerHTML = `<a href="Signin.html" class="btn-signin">Sign In</a><a href="Register.html" class="btn-register">Register</a>`;
    if (mobileAuth) mobileAuth.innerHTML = `<a href="Signin.html" class="btn-signin">Sign In</a><a href="Register.html" class="btn-register">Register</a>`;
  }
}

// Toast
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// Mobile menu
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

// Cart modal
function openCartModal() {
  renderCartModal();
  document.getElementById('cartBackdrop').classList.add('open');
}
function closeCartModal() {
  document.getElementById('cartBackdrop').classList.remove('open');
}
function renderCartModal() {
  const cart = getCart();
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  if (!itemsEl) return;
  if (!cart.length) {
    itemsEl.innerHTML = `<div class="cart-empty"><p>Your cart is empty.<br><a href="Homepage.html">Browse our products</a></p></div>`;
    if (footerEl) footerEl.style.display = 'none';
    return;
  }
  itemsEl.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img src="${item.img || ''}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60x60/8fbc6a/fff?text=🌿'" style="width:54px;height:54px;object-fit:cover;border-radius:8px;"/>
      <div class="cart-item-info" style="flex:1;">
        <strong style="display:block;font-size:0.92rem;">${item.name}</strong>
        <span style="font-size:0.85rem;color:#5a7a5a;">₱${item.price.toLocaleString()}</span>
      </div>
      <div class="cart-item-qty" style="display:flex;align-items:center;gap:8px;">
        <button onclick="changeQty(${i}, -1)" style="width:26px;height:26px;border-radius:6px;border:1.5px solid #d0e8c8;background:none;cursor:pointer;font-size:1rem;color:#2e5f2e;">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${i}, 1)" style="width:26px;height:26px;border-radius:6px;border:1.5px solid #d0e8c8;background:none;cursor:pointer;font-size:1rem;color:#2e5f2e;">+</button>
      </div>
      <button onclick="removeItem(${i})" style="background:none;border:none;cursor:pointer;color:#5a7a5a;font-size:1rem;margin-left:8px;">✕</button>
    </div>
  `).join('');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = `₱${total.toLocaleString()}`;
  if (footerEl) footerEl.style.display = 'block';
}
function changeQty(idx, delta) {
  const cart = getCart();
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  saveCart(cart);
  renderCartModal();
}
function removeItem(idx) {
  const cart = getCart();
  cart.splice(idx, 1);
  saveCart(cart);
  renderCartModal();
}
function addToCart(name, price, img) {
  const cart = getCart();
  const existing = cart.find(i => i.name === name);
  if (existing) { existing.qty++; } else { cart.push({ name, price, img: img || '', qty: 1 }); }
  saveCart(cart);
  showToast(`${name} added to cart!`);
}
function checkout() {
  closeCartModal();
  window.location.href = 'check out new.html';
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  updateNavAuth();
  // Mark active nav link
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.href === location.href) a.classList.add('active');
  });
});
