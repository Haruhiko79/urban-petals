// nav.js handles: toggleMobileMenu, closeMobileMenu, openCartModal, closeCartModal, showToast, signOut, updateNavAuth

  // ========== Plant Pots Products ==========
  const PRODUCTS = [
      {
          id: 1,
          name: "Potted Sensation plant",
          price: 350,
          priceRange: "₱350",
          category: "Ceramic",
          rating: 5,
          image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=900&q=80",
         description: "Our decorative ceramic planter with wooden stand. Perfect for showing off your plants."
      },
      {
          id: 2,
          name: "Elevated Planter with Wooden Stand",
          price: 380,
          priceRange: "₱380",
          category: "Ceramic",
          rating: 4,
          image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTofD-bJpZhJOVb1NphYroeiLqPSwloDa8nsA&s",
         description: "Our decorative ceramic planter with wooden stand. Perfect for showing off your plants."
      },
      {
          id: 3,
          name: "Venetian Tall Fiberglass Planter",
          price: 550,
          priceRange: "₱550",
          category: "Fiberglass",
          rating: 5,
          image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=900&q=80",
          description: "Our decorative ceramic planter with wooden stand. Perfect for showing off your plants."
      },
      {
          id: 4,
          name: "Ribbed Tall Fiberglass Planters",
          price: 690,
          priceRange: "₱690",
          category: "Fiberglass",
          rating: 5,
          image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP9c3vVN_0qwFQ88518lWBtnOjjj8DSM4ndQ&s",
          description: "Our decorative ceramic planter with wooden stand. Perfect for showing off your plants."
      },
      {
          id: 5,
          name: "Terracotta Pots",
          price: 450,
          priceRange: "₱450",
          category: "Terracotta",
          rating: 4,
          image: "https://www.livemoor.co.uk/cdn/shop/files/1_d8b4cad6-6255-4e13-ab27-999c6abc6a0c.jpg?v=1718832910",
         description: "Our decorative ceramic planter with wooden stand. Perfect for showing off your plants."
      },
      {
          id: 6,
          name: "Terraneo Zonarati Terracotta Pot",
          price: 1200,
          priceRange: "₱1200",
          category: "Terracotta",
          rating: 4,
          image: "https://www.architecturalplants.com/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-09-at-14-15-53_ab998084.jpg",
          description: "Our decorative ceramic planter with wooden stand. Perfect for showing off your plants."
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

