// nav.js handles: toggleMobileMenu, closeMobileMenu, openCartModal, closeCartModal, showToast, signOut, updateNavAuth

  // ========== FERTILIZER PRODUCTS ==========
  const PRODUCTS = [
      {
          id: 1,
          name: "Compost",
          price: 350,
          priceRange: "₱350",
          category: "Organic",
          rating: 5,
          image: "https://5.imimg.com/data5/CM/QR/KC/SELLER-8167092/organic-compost-fertilizer-500x500.jpg",
          description: "Nutrient-rich organic compost, ideal for enriching soil and boosting plant health naturally."
      },
      {
          id: 2,
          name: "Liquid Fertilizer",
          price: 380,
          priceRange: "₱380",
          category: "Liquid",
          rating: 4,
          image: "https://tiimg.tistatic.com/fp/1/008/434/liquid-bio-fertilizer-for-fast-crop-growing-use-075.jpg",
          description: "Fast-absorbing liquid fertilizer for quick nutrient uptake and vibrant foliage."
      },
      {
          id: 3,
          name: "Granular Fertilizer",
          price: 550,
          priceRange: "₱550",
          category: "Granular",
          rating: 5,
          image: "https://www.hhfertilizer.com/images/goods/7_2024031109485899411.jpg",
          description: "Slow-release granular formula provides steady nutrients for up to 3 months."
      },
      {
          id: 4,
          name: "Organic Fertilizer",
          price: 690,
          priceRange: "₱690",
          category: "Organic",
          rating: 5,
          image: "https://img.freepik.com/premium-photo/organic-fertilizer-isolated-white-background_1313004-201.jpg",
          description: "Certified organic blend of natural ingredients for sustainable gardening."
      },
      {
          id: 5,
          name: "Plant Booster",
          price: 450,
          priceRange: "₱450",
          category: "Liquid",
          rating: 4,
          image: "https://www.gardeningera.com/wp-content/uploads/2024/05/Gardening-Era-1.png",
          description: "Energizing plant booster with essential micronutrients for stronger roots and blooms."
      },
      {
          id: 6,
          name: "Rock Phosphate",
          price: 1200,
          priceRange: "₱1200",
          category: "Soil Enhancers",
          rating: 4,
          image: "https://5.imimg.com/data5/SELLER/Default/2023/4/300299368/TE/WR/AX/186880872/download-1-jpeg-500x500.jpeg",
          description: "Natural rock phosphate powder, excellent long-term phosphorus source."
      }
  ];


  const categoryRatings = { "Organic": 5, "Liquid": 4, "Granular": 5, "Soil Enhancers": 4 };
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
      toast.style.cssText = 'position:fixed;bottom:28px;right:28px;background:#2e5f2e;color:white;padding:12px 24px;border-radius:50px;font-weight:500;font-size:0.9rem;box-shadow:0 8px 20px rgba(0,0,0,0.12);z-index:9999;display:flex;align-items:center;gap:10px;font-family:Lato,sans-serif;';
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
      // delegate to nav.js addToCart(name, price, img)
      addToCart(product.name, product.price, product.image);
  }


  function showProductDetails(product) {
      alert(`🌱 ${product.name}\n💰 Price: ${product.priceRange}\n⭐ Rating: ${product.rating}/5\n\n${product.description}`);
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
          productGrid.innerHTML = `<div class="empty-state"><i class="fas fa-leaf"></i><p>No fertilizers found — try adjusting filters 🌿</p></div>`;
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
  }


  init();

