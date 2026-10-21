const CHECKOUT_CART_KEY = 'urbanPetalsCart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CHECKOUT_CART_KEY)) || []; } catch { return []; }
}

function getSignedInUser() {
  try { return JSON.parse(localStorage.getItem('urbanPetalsUser')); } catch { return null; }
}

function getSelectedPaymentMethod() {
  const selectedPayment = document.querySelector('input[name="payment"]:checked');
  return selectedPayment ? selectedPayment.value : 'Cash on Delivery';
}

function handlePaymentMethodChange() {
  const method = getSelectedPaymentMethod();
  const paymentExtra = document.getElementById('paymentExtra');
  const title = document.getElementById('paymentExtraTitle');
  const copy = document.getElementById('paymentExtraCopy');
  const label = document.getElementById('paymentDetailLabel');
  const value = document.getElementById('paymentDetailValue');
  const reference = document.getElementById('paymentReference');
  const previousMethod = paymentExtra ? paymentExtra.dataset.activeMethod || 'Cash on Delivery' : 'Cash on Delivery';
  if (!paymentExtra || !title || !copy || !label || !value || !reference) return;

  if (method === 'Cash on Delivery') {
    paymentExtra.classList.remove('open');
    reference.value = '';
    paymentExtra.dataset.activeMethod = method;
    return;
  }

  paymentExtra.classList.add('open');

  if (previousMethod !== method) {
    reference.value = '';
  }

  if (method === 'Bank Transfer') {
    title.textContent = 'Bank Transfer';
    copy.textContent = 'Transfer the total amount to the Urban Petals bank account, then enter your transfer reference below.';
    label.textContent = 'Account Number';
    value.textContent = '0034 1188 2745 19';
    reference.placeholder = 'Enter bank transfer reference number';
  } else {
    title.textContent = 'E-Wallet Payment';
    copy.textContent = 'Send the payment through GCash or Maya, then enter the wallet reference below before proceeding.';
    label.textContent = 'Wallet Number';
    value.textContent = '0917 555 0147';
    reference.placeholder = 'Enter GCash/Maya reference number';
  }

  paymentExtra.dataset.activeMethod = method;
}

function loadCheckout() {
  const cart = getCart();
  const container = document.getElementById('orderSummary');
  let total = 0;

  if (!container) return;
  container.innerHTML = '';

  cart.forEach(item => {
    total += item.price * item.qty;
    container.innerHTML += `
      <div class="summary-item">
        <span>${item.name} x${item.qty}</span>
        <span>${formatPeso(item.price * item.qty)}</span>
      </div>
    `;
  });

  document.getElementById('total').textContent = formatPeso(total);
  handlePaymentMethodChange();
}

async function placeOrder() {
  const name = document.getElementById('name').value.trim();
  const address = document.getElementById('address') ? document.getElementById('address').value.trim() : '';
  const contact = document.getElementById('contact') ? document.getElementById('contact').value.trim() : '';
  const paymentMethod = getSelectedPaymentMethod();
  const paymentReferenceInput = document.getElementById('paymentReference');
  const paymentReference = paymentReferenceInput ? paymentReferenceInput.value.trim() : '';
  const cart = getCart();
  const user = getSignedInUser();

  if (!name || !address || !contact) {
    alert('Please complete your name, address, and contact number.');
    return;
  }
  if (!cart.length) {
    alert('Your cart is empty.');
    return;
  }
  if (paymentMethod !== 'Cash on Delivery' && !paymentReference) {
    alert('Please enter your payment reference number before placing the order.');
    return;
  }

  try {
    const receiptData = await apiRequest('/orders', {
      method: 'POST',
      body: {
        customer: {
          name,
          address,
          contact,
          email: user ? user.email : '',
        },
        items: cart,
        payment: paymentMethod,
        payment_reference: paymentReference,
      },
    });
    localStorage.setItem('receiptData', JSON.stringify(receiptData));
    localStorage.removeItem(CHECKOUT_CART_KEY);
    window.location.href = 'receipt new.html';
  } catch (error) {
    alert(`Failed to place order: ${error.message}`);
  }
}

function loadReceipt() {
  const order = JSON.parse(localStorage.getItem('receiptData') || '{"items":[],"payment":"N/A","customer":{}}');
  const container = document.getElementById('receiptItems');
  const paymentDisplay = document.getElementById('displayPayment');
  const paymentReferenceDisplay = document.getElementById('displayPaymentReference');
  const customerDisplay = document.getElementById('receiptCustomer');
  let total = 0;

  if (!container) return;
  container.innerHTML = '';

  order.items.forEach(item => {
    total += item.price * item.qty;
    container.innerHTML += `
      <div class="receipt-item">
        <span>${item.name} x${item.qty}</span>
        <span>${formatPeso(item.price * item.qty)}</span>
      </div>
    `;
  });

  if (customerDisplay && order.customer) {
    customerDisplay.innerHTML = `
      <p><strong>Name:</strong> ${order.customer.name || '-'}</p>
      <p><strong>Address:</strong> ${order.customer.address || '-'}</p>
      <p><strong>Contact:</strong> ${order.customer.contact || '-'}</p>
    `;
  }

  document.getElementById('receiptTotal').textContent = formatPeso(order.total || total);
  if (paymentDisplay) paymentDisplay.textContent = order.payment || 'N/A';
  if (paymentReferenceDisplay) paymentReferenceDisplay.textContent = order.paymentReference || '-';
}
