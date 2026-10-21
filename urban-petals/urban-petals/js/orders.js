const statusLabel = {
  'in-transit': 'In Transit',
  delivered: 'Delivered',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

let orders = [];

function render(data) {
  const tbody = document.getElementById('ordersBody');
  tbody.innerHTML = '';

  data.forEach(order => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="order-id">${order.id}</span></td>
      <td>
        <div class="user-cell">
          <div class="avatar ${order.cls}">${order.initials}</div>
          <span class="user-name">${order.user}</span>
        </div>
      </td>
      <td class="total-cell">${formatPeso(order.total)}</td>
      <td>${order.address}</td>
      <td>
        <div class="payment-meta">
          <strong>${order.paymentMethod}</strong>
          <span>${order.paymentReference}</span>
        </div>
      </td>
      <td><div class="date-cell"><span class="date-icon">&#128197;</span>${order.date}</div></td>
      <td><span class="badge ${order.status}">${statusLabel[order.status] || order.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function filterOrders(query) {
  const term = query.toLowerCase();
  return orders.filter(order =>
    order.id.toLowerCase().includes(term)
    || order.user.toLowerCase().includes(term)
    || order.address.toLowerCase().includes(term)
    || order.paymentMethod.toLowerCase().includes(term)
    || order.paymentReference.toLowerCase().includes(term)
    || order.status.toLowerCase().includes(term)
  );
}

async function loadOrders() {
  orders = await apiRequest('/orders');
  render(orders);
}

document.getElementById('searchInput').addEventListener('input', function onSearch() {
  render(filterOrders(this.value));
});

loadOrders().catch(error => {
  console.error('Failed to load orders:', error);
  alert(`Failed to load orders: ${error.message}`);
});
