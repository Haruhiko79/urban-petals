// nav.js handles: toggleMobileMenu, closeMobileMenu, openCartModal, closeCartModal, showToast, signOut, updateNavAuth


 const PRODUCTS = [
    { id: 1, name: "SunFlower", price: 200, priceRange: "₱350-800", category: "SunFlower", rating: 5, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE6WZSsX_ECcU_QDQGknng3Ray79YGGYDVxvR8XKay6CDSEzniELYQ7xTyHFylXQvN8Vg9CbYa3OhOyiZ-0yp_kGvN8RukOxrwZi2KLUHYJw&s=10", description: "A beautiful sunflower" },
    { id: 2, name: "Roses", price: 280, priceRange: "₱280-500", category: "Roses", rating: 4, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrOiG_CkbYfVzbVhn6CgQBbWAQJUUCxFLoK3dVuMvtByEeqvdTeVnm5JMZm-hGsELQejm61UKkE23xxxXm77S4f4ssoaWZTJhkp5uUKCE&s=10", description: "Classic red roses" },
    { id: 3, name: "Orchids", price: 280, priceRange: "₱150-300", category: "Orchids", rating: 4, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeQwBNasvdy9N0TGOck7e0yOLjWUO1Lf79T0BYLu0y3S2eAHOVyasSbfQEqZGzk4LhhLsxj26FBQdz6_izfWC5kGW2PbhG5HGvklMcPE8&s=10", description: "Elegant orchids" },
    { id: 4, name: "Diasies", price: 750, priceRange: "₱550-750", category: "Daisies", rating: 4, image: "https://gardenerspath.com/wp-content/uploads/2025/04/How-to-Grow-and-Care-for-Shasta-Daisies-Hero.jpg", description: "Colorful daisies" },
    { id: 5, name: "Tulips", price: 850, priceRange: "₱250-500", category: "Tulips", rating: 5, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToPl1sPSiYYeRdtmBCI6E22YsgwyAgir7GQxnZERFXAwG0E6z36AquX0k2dJLsG8JtOnjZ1Q3f4CyJNows1T4O__MwnEw6ibAt2n6uQXI&s=10", description: "Stunning tulips" },
    { id: 6, name: "Geranium", price: 1000, priceRange: "₱400-900", category: "Geranium", rating: 4, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSikKxFUpb1fZP3eD1OJ64irsEe2CMi6FwPp9mydhh4f0yyTcjtpInXMCAlf6UdCl5yGLEIdL7GihGvAkMsMXV2smiJ4Iz70-MPoXoJUQ&s=10", description: "Vibrant geraniums" }
];


  const categoryRatings = { "Sunflower": 5, "Roses": 4, "Orchids": 4, "Daisies": 4, "Tulips": 5, "Geranium": 4 };
  const UNIQUE_CATEGORIES = [...new Set(PRODUCTS.map(p => p.category))];


  let cartCount = 0;
  let activeCategories = new Set();
  let currentSort = "price-asc";
  let searchQuery = "";
  let filteredProducts = [...PRODUCTS];


  const productGrid = document.getElementById("productGrid");
  const cartCountBadge = document.getElementById("cartCount");
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


  function updateCartUI() {
    cartCountBadge.textContent = cartCount;
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



