let products = [];

function productPriceNumber(rawValue) {
  if (typeof rawValue === 'number') return rawValue;
  return Number(String(rawValue || '0').replace(/[^0-9.]/g, '')) || 0;
}

function renderTable(data) {
  const tbody = document.getElementById('productsBody');
  tbody.innerHTML = '';

  data.forEach(product => {
    const tr = document.createElement('tr');
    tr.dataset.id = product.id;
    tr.innerHTML = `
      <td><input type="checkbox" class="row-check" /></td>
      <td>${product.no}</td>
      <td>${product.date}</td>
      <td>${product.code}</td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.qty}</td>
      <td>${formatPeso(product.price)}</td>
      <td><button class="edit-btn" data-id="${product.id}">&#9998;</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function filterProducts(query) {
  const term = query.toLowerCase();
  return products.filter(product =>
    product.name.toLowerCase().includes(term)
    || product.code.toLowerCase().includes(term)
    || product.category.toLowerCase().includes(term)
  );
}

async function loadProducts() {
  products = await apiRequest('/products');
  renderTable(products);
}

document.getElementById('selectAll').addEventListener('change', function onSelectAll() {
  document.querySelectorAll('.row-check').forEach(checkbox => { checkbox.checked = this.checked; });
});

document.getElementById('searchInput').addEventListener('input', function onSearch() {
  renderTable(filterProducts(this.value));
});

document.getElementById('deleteBtn').addEventListener('click', async () => {
  const rows = [...document.querySelectorAll('.row-check:checked')].map(checkbox => checkbox.closest('tr'));
  if (!rows.length) return;
  if (!confirm(`Delete ${rows.length} selected product(s)?`)) return;

  try {
    await Promise.all(rows.map(row => apiRequest(`/products/${row.dataset.id}`, { method: 'DELETE' })));
    await loadProducts();
  } catch (error) {
    alert(`Delete failed: ${error.message}`);
  }
});

const overlay = document.getElementById('modalOverlay');
document.getElementById('addItemBtn').addEventListener('click', () => overlay.classList.add('open'));
document.getElementById('cancelModal').addEventListener('click', () => overlay.classList.remove('open'));
overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('open'); });

document.getElementById('confirmAdd').addEventListener('click', async () => {
  const payload = {
    code: document.getElementById('newCode').value.trim(),
    name: document.getElementById('newName').value.trim(),
    category: document.getElementById('newCategory').value.trim(),
    qty: Number(document.getElementById('newQty').value) || 0,
    price: productPriceNumber(document.getElementById('newPrice').value),
  };

  if (!payload.name || !payload.category) {
    alert('Please enter the product name and category.');
    return;
  }

  try {
    await apiRequest('/products', { method: 'POST', body: payload });
    ['newCode', 'newName', 'newCategory', 'newQty', 'newPrice'].forEach(id => { document.getElementById(id).value = ''; });
    overlay.classList.remove('open');
    await loadProducts();
  } catch (error) {
    alert(`Add item failed: ${error.message}`);
  }
});

document.getElementById('productsBody').addEventListener('click', async event => {
  if (!event.target.classList.contains('edit-btn')) return;

  const id = Number(event.target.dataset.id);
  const product = products.find(item => item.id === id);
  if (!product) return;

  const newName = prompt('Edit product name:', product.name);
  if (newName === null || !newName.trim()) return;

  try {
    await apiRequest(`/products/${id}`, {
      method: 'PATCH',
      body: { name: newName.trim() },
    });
    await loadProducts();
  } catch (error) {
    alert(`Edit failed: ${error.message}`);
  }
});

loadProducts().catch(error => {
  console.error('Failed to load products:', error);
  alert(`Failed to load products: ${error.message}`);
});
