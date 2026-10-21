// checkout.js — Urban Petals checkout & receipt
// NOTE: CART_KEY and getCart() are provided by nav.js (loaded before this file)

// ── Auto-detect which page we're on and init ──
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('orderSummary')) {
    loadCheckout();
  } else if (document.getElementById('receiptItems')) {
    loadReceipt();
  }
});

// ── Checkout page: show cart items ──
function loadCheckout() {
  var cart      = getCart();  // from nav.js
  var container = document.getElementById('orderSummary');
  var totalEl   = document.getElementById('total');
  var total     = 0;

  if (!cart.length) {
    container.innerHTML = '<p style="color:#5a7a5a;text-align:center;padding:1rem 0;">Your cart is empty. <a href="Homepage.html" style="color:#2e5f2e;font-weight:600;">Browse products →</a></p>';
    totalEl.textContent = '₱0';
    return;
  }

  container.innerHTML = '';
  cart.forEach(function (item) {
    var subtotal = item.price * item.qty;
    total += subtotal;
    container.innerHTML +=
      '<div class="summary-item">' +
        '<span>' + item.name + ' <span style="color:#5a7a5a;">x' + item.qty + '</span></span>' +
        '<span style="font-weight:600;">₱' + subtotal.toLocaleString() + '</span>' +
      '</div>';
  });

  totalEl.textContent = '₱' + total.toLocaleString();
}

// ── Place order button ──
function placeOrder() {
  var nameEl    = document.getElementById('name');
  var addressEl = document.getElementById('address');
  var contactEl = document.getElementById('contact');

  if (!nameEl || !addressEl || !contactEl) return;

  var name    = nameEl.value.trim();
  var address = addressEl.value.trim();
  var contact = contactEl.value.trim();

  if (!name)    { alert('Please enter your full name.');        return; }
  if (!address) { alert('Please enter your delivery address.'); return; }
  if (!contact) { alert('Please enter your contact number.');   return; }

  var cart = getCart();  // from nav.js
  if (!cart.length) { alert('Your cart is empty.'); return; }

  // Save order for receipt page
  localStorage.setItem('receiptData', JSON.stringify({
    customer: { name: name, address: address, contact: contact },
    items: cart
  }));

  // Clear the shared cart
  localStorage.removeItem('urbanPetalsCart');

  window.location.href = 'receipt.html';
}

// ── Receipt page: show confirmed order ──
function loadReceipt() {
  var raw       = localStorage.getItem('receiptData');
  var container = document.getElementById('receiptItems');
  var custEl    = document.getElementById('receiptCustomer');
  var totalEl   = document.getElementById('receiptTotal');

  if (!raw) {
    if (container) container.innerHTML = '<p style="color:#5a7a5a;text-align:center;">No order data found.</p>';
    return;
  }

  var data     = JSON.parse(raw);
  var items    = data.items    || [];
  var customer = data.customer || {};

  // Customer info
  if (custEl && customer.name) {
    custEl.innerHTML =
      '<div class="receipt-customer-info">' +
        '<p><strong>Name:</strong> '    + customer.name    + '</p>' +
        '<p><strong>Address:</strong> ' + customer.address + '</p>' +
        '<p><strong>Contact:</strong> ' + customer.contact + '</p>' +
      '</div>';
  }

  // Items + total
  var total = 0;
  if (container) {
    container.innerHTML = '';
    items.forEach(function (item) {
      var subtotal = item.price * item.qty;
      total += subtotal;
      container.innerHTML +=
        '<div class="receipt-item">' +
          '<span>' + item.name + ' <span style="color:#5a7a5a;">x' + item.qty + '</span></span>' +
          '<span style="font-weight:600;">₱' + subtotal.toLocaleString() + '</span>' +
        '</div>';
    });
  }

  if (totalEl) totalEl.textContent = '₱' + total.toLocaleString();
}
