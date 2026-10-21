// nav.js handles: toggleMobileMenu, closeMobileMenu, openCartModal, closeCartModal, showToast, signOut, updateNavAuth

  // ========== GARDEN TOOLS PRODUCTS ==========
  const PRODUCTS = [
    { id: 1, name: "Watering Can", price: 200, priceRange: "₱100-300", category: "Watering Cans", rating: 5, image: "https://i5.walmartimages.com/asr/d52679e9-d9f9-472d-a646-fe1bef8054c8.3eb5b3d1d84272db66dae65f9e8489b6.jpeg", description: "Premium watering can with ergonomic handle and precision spout." },
    { id: 2, name: "Shears", price: 280, priceRange: "₱280", category: "Shears", rating: 4, image: "https://ikrorwxhqlrrli5q.ldycdn.com/cloud/lpBpqKlmlmSRnjrnqjopip/gt2074.jpg", description: "Professional-grade pruning shears with stainless steel blades." },
    { id: 3, name: "Hand Trowel", price: 300, priceRange: "₱300", category: "Hand Trowels", rating: 5, image: "https://m.media-amazon.com/images/I/613nbx+ByoL._AC_SL1500_.jpg", description: "Durable hand trowel perfect for digging and planting." },
    { id: 4, name: "Shovel", price: 750, priceRange: "₱750", category: "Shovels", rating: 4, image: "https://tse3.mm.bing.net/th/id/OIP.rxbu9BWALeMZolXKtf_h-gHaGG?rs=1&pid=ImgDetMain&o=7&rm=3", description: "Heavy-duty shovel with reinforced handle." },
    { id: 5, name: "Rakes", price: 850, priceRange: "₱850", category: "Rakes", rating: 5, image: "https://tse1.mm.bing.net/th/id/OIP.G68v1b-wmIoBlENwV-EH4gHaE8?w=1500&h=1000&rs=1&pid=ImgDetMain&o=7&rm=3", description: "Professional garden rake with wide head." },
    { id: 6, name: "Garden Fork", price: 1000, priceRange: "₱1000", category: "Garden Fork", rating: 4, image: "https://tse3.mm.bing.net/th/id/OIP.Wl8SM-yoZI7vJVMcsc0T-gHaHa?w=600&h=600&rs=1&pid=ImgDetMain&o=7&rm=3", description: "Sturdy garden fork ideal for turning soil." }
  ];

  const categoryRatings = { "Shovels": 4, "Rakes": 5, "Hand Trowels": 5, "Shears": 4, "Watering Cans": 5, "Garden Fork": 4 };
  const UNIQUE_CATEGORIES = [...new Set(PRODUCTS.map(p => p.category))];

  let activeCategories = new Set();
  let currentSort = "price-asc";
  let searchQuery = "";
  let filteredProducts = [...PRODUCTS];

  const productGrid = document.getElementById("productGrid");
  const categoriesContainer = document.getElementById("categoriesContainer");
  const sortPriceAsc = document.getElementById("sortPriceAsc");
  const sortPriceDesc = document.getElementById("sortPriceDesc");
  const sortRatingBtn = document.getElementById("sortRating");
  const clearAllFiltersBtn = document.getElementById("clearAllFiltersBtn");
  const backBtn = document.getElementById("backBtn");
  const searchInput = document.getElementById("searchInput");

  function showCartToast(productName) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '28px';
    toast.style.right = '28px';
    toast.style.backgroundColor = '#2e5f2e';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '50px';
    toast.style.fontWeight = '500';
    toast.style.fontSize = '0.9rem';
    toast.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
    toast.style.zIndex = '9999';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${productName} added to cart!`;
    toast.classList.add('cart-toast');
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('cart-toast');
      toast.classList.add('cart-toast-out');
      setTimeout(() => toast.remove(), 200);
    }, 1800);
  }

  function addToCartLocal(product) {
      addToCart(product.name, product.price, product.image);
  }

  function showProductDetails(product) {
    alert(`🛠️ ${product.name}\n💰 Price: ${product.priceRange}\n⭐ Rating: ${product.rating}/5\n\n${product.description}`);
  }

  function renderCategories() {
    categoriesContainer.innerHTML = "";
    UNIQUE_CATEGORIES.forEach(cat => {
      const rating = categoryRatings[cat] || 4;
      const fullStars = Math.floor(rating);
      const emptyStars = 5 - fullStars;
      let starsHtml = "";
      for (let i = 0; i < fullStars; i++) starsHtml += '<span class="star-filled">★</span>';
      for (let i = 0; i < emptyStars; i++) starsHtml += '<span class="star-empty">★</span>';

      const isChecked = activeCategories.has(cat);
      const categoryDiv = document.createElement('label');
      categoryDiv.className = 'category-item';
      categoryDiv.innerHTML = `
        <input type="checkbox" value="${cat}" class="category-checkbox" ${isChecked ? 'checked' : ''}>
        <span class="category-label">${cat}</span>
        <div class="category-rating">${starsHtml}</div>
      `;
      const checkbox = categoryDiv.querySelector('.category-checkbox');
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) activeCategories.add(cat);
        else activeCategories.delete(cat);
        applyFiltersAndSort();
      });
      categoriesContainer.appendChild(categoryDiv);
    });
  }

  function applyFiltersAndSort() {
    let temp = [...PRODUCTS];

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      temp = temp.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
    }

    if (activeCategories.size > 0) {
      temp = temp.filter(p => activeCategories.has(p.category));
    }

    if (currentSort === "price-asc") temp.sort((a, b) => a.price - b.price);
    else if (currentSort === "price-desc") temp.sort((a, b) => b.price - a.price);
    else if (currentSort === "rating") temp.sort((a, b) => b.rating - a.rating);

    filteredProducts = temp;
    renderProductGrid();
  }

  function renderProductGrid() {
    if (filteredProducts.length === 0) {
      productGrid.innerHTML = `<div class="empty-state"><i class="fas fa-tools"></i><p>No tools found — try adjusting filters 🔧</p></div>`;
      return;
    }

    productGrid.innerHTML = filteredProducts.map(product => `
      <li class="product-card">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-price">${product.priceRange}</div>
          <div class="card-footer">
            <a href="#" class="read-more-link" data-id="${product.id}">
              Read More <i class="fas fa-arrow-right"></i>
            </a>
            <button class="cart-add-btn" data-id="${product.id}">
              <i class="fas fa-shopping-cart"></i>
            </button>
          </div>
        </div>
      </li>
    `).join('');

    document.querySelectorAll('.read-more-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(link.dataset.id);
        const product = PRODUCTS.find(p => p.id === id);
        if (product) showProductDetails(product);
      });
    });

    document.querySelectorAll('.cart-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        const product = PRODUCTS.find(p => p.id === id);
        if (product) addToCartLocal(product);
      });
    });
  }

  function resetAllFilters() {
    activeCategories.clear();
    searchQuery = "";
    searchInput.value = "";
    document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
    applyFiltersAndSort();
  }

  function setSortAndRender(sortType, activeBtn) {
    currentSort = sortType;
    [sortPriceAsc, sortPriceDesc, sortRatingBtn].forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
    applyFiltersAndSort();
  }

  sortPriceAsc.addEventListener('click', () => setSortAndRender('price-asc', sortPriceAsc));
  sortPriceDesc.addEventListener('click', () => setSortAndRender('price-desc', sortPriceDesc));
  sortRatingBtn.addEventListener('click', () => setSortAndRender('rating', sortRatingBtn));
  clearAllFiltersBtn.addEventListener('click', resetAllFilters);
  backBtn.addEventListener('click', () => window.history.back());
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    applyFiltersAndSort();
  });

  function init() {
    renderCategories();
    sortPriceAsc.classList.add('active');
    currentSort = 'price-asc';
    applyFiltersAndSort();
    updateCartUI();
  }

  init();


