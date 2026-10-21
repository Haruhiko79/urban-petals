// Shared cart state
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

// Auth state
function getUser() {
  try { return JSON.parse(localStorage.getItem('urbanPetalsUser')); } catch { return null; }
}
function saveUser(user) {
  localStorage.setItem('urbanPetalsUser', JSON.stringify(user));
}
function signOut() {
  localStorage.removeItem('urbanPetalsUser');
  window.location.href = 'Homepage.html';
}
function updateNavAuth() {
  const user = getUser();
  const authArea = document.getElementById('navAuthArea');
  const mobileAuth = document.getElementById('mobileAuthArea');
  if (!authArea) return;
  if (user) {
    authArea.innerHTML = `<span class="nav-username">Hi, ${user.name.split(' ')[0]}!</span><button class="btn-signout" onclick="signOut()">Sign Out</button>`;
    if (mobileAuth) mobileAuth.innerHTML = `<span class="nav-username">Hi, ${user.name.split(' ')[0]}!</span><button class="btn-signout" onclick="signOut()">Sign Out</button>`;
  } else {
    authArea.innerHTML = `<a href="signin.html" class="btn-signin">Sign In</a><a href="register.html" class="btn-register">Register</a>`;
    if (mobileAuth) mobileAuth.innerHTML = `<a href="signin.html" class="btn-signin">Sign In</a><a href="register.html" class="btn-register">Register</a>`;
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
    itemsEl.innerHTML = `<p class="cart-empty">Your cart is empty.<br><a href="index.html">Continue shopping →</a></p>`;
    footerEl.style.display = 'none';
    return;
  }
  itemsEl.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60x60/8fbc6a/fff?text=🌿'"/>
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <span>₱${item.price.toLocaleString()}</span>
      </div>
      <div class="cart-item-qty">
        <button onclick="changeQty(${i}, -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${i}, 1)">+</button>
      </div>
      <button class="cart-item-remove" onclick="removeItem(${i})">✕</button>
    </div>
  `).join('');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cartTotal').textContent = `₱${total.toLocaleString()}`;
  footerEl.style.display = 'block';
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
  if (existing) { existing.qty++; } else { cart.push({ name, price, img, qty: 1 }); }
  saveCart(cart);
  showToast(`${name} added to cart!`);
}
function checkout() {
  showToast('Proceeding to checkout... (demo)');
  closeCartModal();
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  updateNavAuth();
});