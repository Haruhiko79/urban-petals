let products = [
  { no: 1, date: '03/05/26', code: '#A001', name: 'Ceramic Pots',   category: 'Pots',            qty: 23,  price: '₱150' },
  { no: 2, date: '03/05/26', code: '#A002', name: 'Shovel',         category: 'Gardening Tools', qty: 12,  price: '₱500' },
  { no: 3, date: '03/05/26', code: '#A003', name: 'Shear',          category: 'Gardening Tools', qty: 10,  price: '₱800' },
  { no: 4, date: '03/05/26', code: '#A004', name: 'Plastic Pots',   category: 'Pots',            qty: 87,  price: '₱100' },
  { no: 5, date: '03/05/26', code: '#A005', name: 'Daisy',          category: 'Flowers',         qty: 86,  price: '₱250' },
  { no: 6, date: '03/05/26', code: '#A006', name: 'Succulents',     category: 'Plants',          qty: 33,  price: '₱180' },
  { no: 7, date: '03/05/26', code: '#A007', name: 'Tulips',         category: 'Flowers',         qty: 126, price: '₱70'  },
];

let nextNo = 8;

function renderTable(data) {
  const tbody = document.getElementById('productsBody');
  tbody.innerHTML = '';
  data.forEach((p, idx) => {
    const tr = document.createElement('tr');
    tr.dataset.idx = products.indexOf(p);
    tr.innerHTML = `
      <td><input type="checkbox" class="row-check" /></td>
      <td>${p.no}</td>
      <td>${p.date}</td>
      <td>${p.code}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.qty}</td>
      <td>${p.price}</td>
      <td><button class="edit-btn" data-idx="${products.indexOf(p)}">✏️</button></td>
    `;
    tbody.appendChild(tr);
  });
}

renderTable(products);

// Select All
document.getElementById('selectAll').addEventListener('change', function () {
  document.querySelectorAll('.row-check').forEach(c => c.checked = this.checked);
});

// Search
document.getElementById('searchInput').addEventListener('input', function () {
  const q = this.value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
  );
  renderTable(filtered);
});

// Delete selected
document.getElementById('deleteBtn').addEventListener('click', function () {
  const checked = [...document.querySelectorAll('.row-check:checked')];
  const idxs = checked.map(c => +c.closest('tr').dataset.idx).sort((a,b)=>b-a);
  idxs.forEach(i => products.splice(i, 1));
  products.forEach((p, i) => p.no = i + 1);
  renderTable(products);
});

// Modal
const overlay = document.getElementById('modalOverlay');
document.getElementById('addItemBtn').addEventListener('click', () => overlay.classList.add('open'));
document.getElementById('cancelModal').addEventListener('click', () => overlay.classList.remove('open'));

document.getElementById('confirmAdd').addEventListener('click', () => {
  const code = document.getElementById('newCode').value.trim();
  const name = document.getElementById('newName').value.trim();
  const cat  = document.getElementById('newCategory').value.trim();
  const qty  = parseInt(document.getElementById('newQty').value) || 0;
  const price = document.getElementById('newPrice').value.trim();

  if (!name) return;

  const today = new Date();
  const d = `${String(today.getMonth()+1).padStart(2,'0')}/${String(today.getDate()).padStart(2,'0')}/${String(today.getFullYear()).slice(-2)}`;

  products.push({ no: nextNo++, date: d, code: code || `#A${String(products.length+1).padStart(3,'0')}`, name, category: cat, qty, price });
  renderTable(products);

  ['newCode','newName','newCategory','newQty','newPrice'].forEach(id => document.getElementById(id).value = '');
  overlay.classList.remove('open');
});

// Edit button (inline rename)
document.getElementById('productsBody').addEventListener('click', function(e) {
  if (!e.target.classList.contains('edit-btn')) return;
  const idx = +e.target.dataset.idx;
  const p = products[idx];
  const newName = prompt('Edit name:', p.name);
  if (newName !== null && newName.trim()) {
    p.name = newName.trim();
    renderTable(products);
  }
});

// Close modal on overlay click
overlay.addEventListener('click', function(e) {
  if (e.target === overlay) overlay.classList.remove('open');
});