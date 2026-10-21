// nav.js handles: toggleMobileMenu, closeMobileMenu, openCartModal, closeCartModal, showToast, signOut, updateNavAuth

  // ========== GARDEN TOOLS PRODUCTS ==========
  const PRODUCTS = [
    { id: 1, name: "Snake Plants", price: 200, priceRange: "₱350-800", category: "Snakeplants", rating: 5,     image: "https://images.squarespace-cdn.com/content/v1/54fbb611e4b0d7c1e151d22a/1610074066643-OP8HDJUWUH8T5MHN879K/Snake+Plant.jpg?format=1000w", description: "Low-maintenance snake plants perfect for indoor gardening." },
    { id: 2, name: "Hibiscus Plants", price: 280, priceRange: "₱280-500", category: "Hibiscus", rating: 4, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREXS1FeaFL7uOvUUCQ9WJoyFE2nkzPuC5McyqvNCTxZuKp0RZ66GmICkPm8yy6U_NPgILAfNrDLJAheH8QAvogL_3OnHBRjRgg-Rv1LQ&s=10", description: "Beautiful hibiscus plants for your garden." },
    { id: 3, name: "Cactus Plants", price: 280, priceRange: "₱150-300", category: "Cacti", rating: 4, image: "https://gardenerspath.com/wp-content/uploads/2024/11/How-to-Water-Cactus-Feature.jpg", description: "Beautiful cactus plants for your garden." },
    { id: 4, name: "Aloe Vera Plants", price: 750, priceRange: "₱550-750", category: "Aloe Vera", rating: 4, image: "https://www.southernliving.com/thmb/DC8ytSO5e9padoHAnGZdmodAaGc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-912168376-0098b123b88f4c62a68b249130b480e9.jpg", description: "Medicinal aloe vera plants for your garden." },
    { id: 5, name: "Photos Plants", price: 850, priceRange: "₱250-500", category: "Photos", rating: 5, image: "https://nouveauraw.com/wp-content/uploads/2020/01/Pothos-Golden-Pothos-plant-800-great-coloring.png", description: "Beautiful photos plants for your garden." },
    { id: 6, name: "ZZ Plant", price: 1000, priceRange: "₱400-900", category: "ZZ Plant", rating: 4, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkWLlqAoE9sg87Rc68HkvRIOSBEpg8AySW5r1g3w7Clw3cyYDHdFLd57mOAjMf4RLUZDyNvF-OQ1sYKadXqJkY6ovwSsoBYLQNBrBDAA&s=10", description: "Drought-tolerant ZZ plant perfect for low-light conditions." }
  ];


  const categoryRatings = { "Snakeplants": 5, "Photos": 5, "Cacti": 4, "Hibiscus": 4, "Aloe Vera": 4, "ZZ Plant": 4 };
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



