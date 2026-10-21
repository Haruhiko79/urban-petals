const orders = [
  { id:'#UP#B21', initials:'NC', cls:'nc', user:'Natali Craig',   total:'₱ 3,050',  address:'Quezon City',    date:'March 4, 2026',     status:'in-transit' },
  { id:'#UP#B22', initials:'KM', cls:'km', user:'Kate Morrison',  total:'₱ 2,780',  address:'Tarlac City',    date:'March 1, 2026',     status:'delivered'  },
  { id:'#UP#B35', initials:'DC', cls:'dc', user:'Drew Cairo',     total:'₱ 175',    address:'Antipolo City',  date:'1 hour ago',        status:'pending'    },
  { id:'#UP#B04', initials:'OD', cls:'od', user:'Orlando Digg',   total:'₱ 2,750',  address:'Baguio City',    date:'1 hour ago',        status:'approved'   },
  { id:'#UP#B05', initials:'AL', cls:'al', user:'Andi Lane',      total:'₱ 50,000', address:'Marikina City',  date:'February 2, 2026',  status:'rejected'   },
  { id:'#UP#B21', initials:'NC', cls:'nc', user:'Natali Craig',   total:'₱ 2,750',  address:'Quezon City',    date:'March 5, 2026',     status:'in-transit' },
  { id:'#UP#B22', initials:'KM', cls:'km', user:'Kate Morrison1', total:'₱ 2,750',  address:'Cebu City',      date:'February 10, 2026', status:'delivered'  },
  { id:'#UP#B63', initials:'DC', cls:'dc', user:'Drew Cairo',     total:'₱ 2,750',  address:'Tacloban City',  date:'1 hour ago',        status:'pending'    },
  { id:'#UP#B04', initials:'OD', cls:'od', user:'Orlando Digg',   total:'₱ 150',    address:'Baguio City',    date:'Yesterday',         status:'approved'   },
  { id:'#UP#B05', initials:'AL', cls:'al', user:'Andi Lane',      total:'₱ 20,000', address:'Quezon City',    date:'Feb 2, 2026',       status:'cancelled'  },
];

const statusLabel = {
  'in-transit':'In Transit','delivered':'Delivered','pending':'Pending',
  'approved':'Approved','rejected':'Rejected','cancelled':'Cancelled',
};

function render(data) {
  const tbody = document.getElementById('ordersBody');
  tbody.innerHTML = '';
  data.forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="order-id">${o.id}</span></td>
      <td>
        <div class="user-cell">
          <div class="avatar ${o.cls}">${o.initials}</div>
          <span class="user-name">${o.user}</span>
        </div>
      </td>
      <td class="total-cell">${o.total}</td>
      <td>${o.address}</td>
      <td><div class="date-cell"><span class="date-icon">📅</span>${o.date}</div></td>
      <td><span class="badge ${o.status}">${statusLabel[o.status]}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

render(orders);

document.getElementById('searchInput').addEventListener('input', function(){
  const q = this.value.toLowerCase();
  render(orders.filter(o =>
    o.id.toLowerCase().includes(q) ||
    o.user.toLowerCase().includes(q) ||
    o.address.toLowerCase().includes(q) ||
    o.status.toLowerCase().includes(q)
  ));
});