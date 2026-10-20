/**
 * Luxe Fashion - E-Commerce Application
 * Vanilla JavaScript: products, cart, filters, search, localStorage
 */

// ========== CURRENCY (Indian Rupees) ==========
function formatINR(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

// ========== PRODUCT DATA (prices in INR, with colour for filter) ==========
const products = [
  { id: 1, name: 'Classic Wool Blazer', price: 14999, category: 'Men', color: 'Navy', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80', description: 'Premium wool blazer with notch lapel. Perfect for business and smart casual occasions.', rating: 4.8 },
  { id: 2, name: 'Silk Midi Dress', price: 11999, category: 'Women', color: 'Beige', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80', description: 'Elegant silk midi dress with flowing silhouette. Ideal for evening events.', rating: 4.9 },
  { id: 3, name: 'Leather Crossbody Bag', price: 6999, category: 'Accessories', color: 'Brown', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', description: 'Handcrafted leather crossbody bag with gold-tone hardware.', rating: 4.7 },
  { id: 4, name: 'Slim Fit Chinos', price: 5499, category: 'Men', color: 'Blue', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80', description: 'Comfortable slim-fit chinos in premium cotton. Available in multiple colors.', rating: 4.6 },
  { id: 5, name: 'Cashmere Sweater', price: 9999, category: 'Women', color: 'Grey', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80', description: 'Luxurious 100% cashmere crewneck sweater. Soft and warm for the season.', rating: 4.9 },
  { id: 6, name: 'Minimalist Watch', price: 12499, category: 'Accessories', color: 'Black', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', description: 'Swiss movement minimalist watch with leather strap. Timeless design.', rating: 4.8 },
  { id: 7, name: 'Oxford Shirt', price: 4699, category: 'Men', color: 'White', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80', description: 'Classic oxford cotton shirt. Versatile for office and weekend wear.', rating: 4.5 },
  { id: 8, name: 'High-Waist Trousers', price: 6199, category: 'Women', color: 'Black', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80', description: 'Tailored high-waist trousers with a flattering fit. Office-ready style.', rating: 4.7 },
  { id: 9, name: 'Designer Sunglasses', price: 9499, category: 'Accessories', color: 'Black', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80', description: 'UV-protection polarized sunglasses with acetate frame.', rating: 4.6 },
  { id: 10, name: 'Denim Jacket', price: 7899, category: 'Men', color: 'Blue', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80', description: 'Vintage wash denim jacket. A wardrobe staple for casual looks.', rating: 4.8 },
  { id: 11, name: 'Lace Blouse', price: 5899, category: 'Women', color: 'White', image: 'https://images.unsplash.com/photo-1564257631407-2f32f063b486?w=600&q=80', description: 'Delicate lace blouse with three-quarter sleeves. Feminine and chic.', rating: 4.7 },
  { id: 12, name: 'Leather Belt', price: 3899, category: 'Accessories', color: 'Brown', image: 'https://images.unsplash.com/photo-1624222247344-550fb60583c2?w=600&q=80', description: 'Full-grain leather belt with brushed silver buckle. Unisex design.', rating: 4.5 }
];

// ========== STATE ==========
let currentCategory = 'all';
let currentColor = 'all';
let searchQuery = '';
let sortBy = 'default';
let cart = [];

// ========== DOM ELEMENTS ==========
const productsGrid = document.getElementById('productsGrid');
const noProductsMessage = document.getElementById('noProductsMessage');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const cartBadge = document.getElementById('cartBadge');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const quickViewModal = document.getElementById('quickViewModal');
const quickViewContent = document.getElementById('quickViewContent');
const wishlistBadge = document.getElementById('wishlistBadge');
const wishlistItemsContainer = document.getElementById('wishlistItemsContainer');

// ========== WISHLIST (localStorage) ==========
const WISHLIST_STORAGE_KEY = 'luxe-fashion-wishlist';
let wishlist = [];

function loadWishlist() {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    wishlist = stored ? JSON.parse(stored) : [];
  } catch (e) {
    wishlist = [];
  }
}

function saveWishlist() {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const count = wishlist.length;
  wishlistBadge.textContent = count;
  wishlistBadge.style.visibility = count > 0 ? 'visible' : 'hidden';
}

function isInWishlist(productId) {
  return wishlist.some(item => item.id === productId);
}

function addToWishlist(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || isInWishlist(productId)) return;
  wishlist.push({ id: product.id, name: product.name, price: product.price, image: product.image });
  saveWishlist();
  renderWishlistModal();
}

function removeFromWishlist(productId) {
  wishlist = wishlist.filter(item => item.id !== productId);
  saveWishlist();
  renderWishlistModal();
  renderProducts();
}

function toggleWishlist(productId) {
  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
  } else {
    addToWishlist(productId);
  }
  renderProducts();
}

// ========== CART HELPERS (localStorage) ==========
const CART_STORAGE_KEY = 'luxe-fashion-cart';

function loadCart() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    cart = stored ? JSON.parse(stored) : [];
  } catch (e) {
    cart = [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;
  cartBadge.style.visibility = totalItems > 0 ? 'visible' : 'hidden';
}

// ========== FILTER & SORT ==========
function getFilteredAndSortedProducts() {
  let result = [...products];

  // Filter by category
  if (currentCategory !== 'all') {
    result = result.filter(p => p.category === currentCategory);
  }

  // Filter by colour
  if (currentColor !== 'all') {
    result = result.filter(p => (p.color || '').toLowerCase() === currentColor.toLowerCase());
  }

  // Filter by search
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.color || '').toLowerCase().includes(q)
    );
  }

  // Sort: Low → High, High → Low, Name A→Z, Name Z→A
  if (sortBy === 'price-low') {
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    result.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name-az') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'name-za') {
    result.sort((a, b) => b.name.localeCompare(a.name));
  }

  return result;
}

// ========== RENDER STARS ==========
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  let html = '';
  for (let i = 0; i < full; i++) html += '<i class="bi bi-star-fill"></i>';
  if (half) html += '<i class="bi bi-star-half"></i>';
  for (let i = 0; i < empty; i++) html += '<i class="bi bi-star"></i>';
  return html;
}

// ========== RENDER PRODUCTS ==========
function renderProducts() {
  const list = getFilteredAndSortedProducts();

  if (list.length === 0) {
    productsGrid.innerHTML = '';
    noProductsMessage.classList.remove('d-none');
    return;
  }

  noProductsMessage.classList.add('d-none');
  productsGrid.innerHTML = list.map(product => {
    const inWishlist = isInWishlist(product.id);
    return `
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div class="card product-card h-100">
        <div class="card-img-wrapper">
          <button type="button" class="wishlist-icon-btn ${inWishlist ? 'in-wishlist' : ''}" data-id="${product.id}" aria-label="Wishlist">
            <i class="bi ${inWishlist ? 'bi-heart-fill' : 'bi-heart'}"></i>
          </button>
          <img src="${product.image}" class="card-img-top" alt="${product.name}" loading="lazy">
          <button type="button" class="quick-view-btn" data-id="${product.id}">Quick View</button>
        </div>
        <div class="card-body">
          <span class="product-category">${product.category}</span>
          <h5 class="card-title">${product.name}</h5>
          <div class="product-rating">${renderStars(product.rating)}</div>
          <div class="product-price">${formatINR(product.price)}</div>
          <div class="d-grid gap-2">
            <button type="button" class="btn btn-add-cart w-100" data-id="${product.id}">Add to Cart</button>
            <button type="button" class="btn btn-outline-dark btn-wishlist-toggle w-100 rounded-0" data-id="${product.id}">
              ${inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  }).join('');

  // Attach event listeners
  productsGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id, 10)));
  });
  productsGrid.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', () => openQuickView(parseInt(btn.dataset.id, 10)));
  });
  productsGrid.querySelectorAll('.wishlist-icon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(parseInt(btn.dataset.id, 10));
    });
  });
  productsGrid.querySelectorAll('.btn-wishlist-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleWishlist(parseInt(btn.dataset.id, 10));
    });
  });
}

// ========== CART ACTIONS ==========
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
  }
  saveCart();
  renderCartModal();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCartModal();
}

function updateQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  saveCart();
  renderCartModal();
}

// ========== RENDER CART MODAL ==========
function renderCartModal() {
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <i class="bi bi-bag-heart display-4 text-muted"></i>
        <p class="mt-2 mb-0">Your cart is empty.</p>
      </div>
    `;
    cartTotal.textContent = formatINR(0);
    checkoutBtn.disabled = true;
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = formatINR(total);
  checkoutBtn.disabled = false;

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatINR(item.price)} × ${item.quantity}</div>
        <div class="cart-item-qty mt-2">
          <button type="button" class="btn btn-sm qty-minus" data-id="${item.id}">−</button>
          <span>${item.quantity}</span>
          <button type="button" class="btn btn-sm qty-plus" data-id="${item.id}">+</button>
        </div>
      </div>
      <button type="button" class="cart-item-remove" data-id="${item.id}" aria-label="Remove">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `).join('');

  cartItemsContainer.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.id, 10), -1));
  });
  cartItemsContainer.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.id, 10), 1));
  });
  cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id, 10)));
  });
}

// ========== RENDER WISHLIST MODAL ==========
function renderWishlistModal() {
  if (wishlist.length === 0) {
    wishlistItemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <i class="bi bi-heart display-4 text-muted"></i>
        <p class="mt-2 mb-0">Your wishlist is empty.</p>
      </div>
    `;
    return;
  }

  wishlistItemsContainer.innerHTML = wishlist.map(item => `
    <div class="cart-item wishlist-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatINR(item.price)}</div>
        <div class="mt-2">
          <button type="button" class="btn btn-sm btn-dark rounded-0 add-wishlist-to-cart" data-id="${item.id}">Add to Cart</button>
        </div>
      </div>
      <button type="button" class="cart-item-remove wishlist-remove" data-id="${item.id}" aria-label="Remove from wishlist">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `).join('');

  wishlistItemsContainer.querySelectorAll('.wishlist-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromWishlist(parseInt(btn.dataset.id, 10)));
  });
  wishlistItemsContainer.querySelectorAll('.add-wishlist-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(parseInt(btn.dataset.id, 10));
    });
  });
}

// ========== QUICK VIEW MODAL ==========
function openQuickView(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  quickViewContent.innerHTML = `
    <div class="row g-4">
      <div class="col-12 col-md-6">
        <img src="${product.image}" alt="${product.name}" class="quick-view-image">
      </div>
      <div class="col-12 col-md-6">
        <span class="text-muted text-uppercase small">${product.category}</span>
        <h4 class="mt-2">${product.name}</h4>
        <div class="text-warning mb-2">${renderStars(product.rating)}</div>
        <p class="quick-view-price mb-3">${formatINR(product.price)}</p>
        <p class="text-muted">${product.description}</p>
        <button type="button" class="btn btn-dark rounded-0 mt-2 add-from-quickview" data-id="${product.id}">Add to Cart</button>
      </div>
    </div>
  `;

  quickViewContent.querySelector('.add-from-quickview').addEventListener('click', () => {
    addToCart(product.id);
    bootstrap.Modal.getInstance(quickViewModal).hide();
  });

  new bootstrap.Modal(quickViewModal).show();
}

// ========== CATEGORY FILTER ==========
function initCategoryFilters() {
  document.querySelectorAll('.category-filter').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      currentCategory = link.dataset.category;
      document.querySelectorAll('.category-filter').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      renderProducts();
    });
  });
}

// ========== COLOUR FILTER ==========
function initColorFilters() {
  document.querySelectorAll('.colour-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentColor = btn.dataset.color;
      document.querySelectorAll('.colour-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts();
    });
  });
}

// ========== SEARCH ==========
function initSearch() {
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    renderProducts();
  });
}

// ========== SORT ==========
function initSort() {
  sortSelect.addEventListener('change', () => {
    sortBy = sortSelect.value;
    renderProducts();
  });
}

// ========== CART MODAL: RENDER WHEN OPENED ==========
document.getElementById('cartModal').addEventListener('show.bs.modal', () => {
  renderCartModal();
});

// ========== WISHLIST MODAL: RENDER WHEN OPENED ==========
document.getElementById('wishlistModal').addEventListener('show.bs.modal', () => {
  renderWishlistModal();
});

// ========== CHECKOUT → DELIVERY ADDRESS ==========
const deliveryModal = document.getElementById('deliveryModal');
const deliveryForm = document.getElementById('deliveryForm');
const orderSuccessModal = document.getElementById('orderSuccessModal');
const CURRENT_USER_KEY = 'luxe-fashion-current-user';

function getCurrentUser() {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
}

function openDeliveryModal() {
  deliveryForm.reset();
  const user = getCurrentUser();
  if (user) {
    document.getElementById('deliveryName').value = user.name || '';
    document.getElementById('deliveryPhone').value = user.number || '';
  }
  deliveryForm.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
  const cartModalInstance = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
  if (cartModalInstance) cartModalInstance.hide();
  new bootstrap.Modal(deliveryModal).show();
}

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) return;
  openDeliveryModal();
});

// ========== INDIAN DELIVERY VALIDATION ==========
function normalizeIndianMobile(input) {
  const digits = (input || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits;
}
function isValidIndianMobile(input) {
  const normalized = normalizeIndianMobile(input);
  return normalized.length === 10 && /^[6-9]\d{9}$/.test(normalized);
}
function isValidIndianPincode(input) {
  return /^[0-9]{6}$/.test((input || '').trim());
}

// ========== PLACE ORDER ==========
function validateDeliveryForm() {
  const name = document.getElementById('deliveryName');
  const phone = document.getElementById('deliveryPhone');
  const address1 = document.getElementById('deliveryAddress1');
  const city = document.getElementById('deliveryCity');
  const state = document.getElementById('deliveryState');
  const zip = document.getElementById('deliveryZip');
  let valid = true;

  [name, address1, city].forEach(f => {
    if (!f.value.trim()) {
      f.classList.add('is-invalid');
      valid = false;
    } else {
      f.classList.remove('is-invalid');
    }
  });

  if (!phone.value.trim()) {
    phone.classList.add('is-invalid');
    phone.nextElementSibling.textContent = 'Please enter mobile number.';
    valid = false;
  } else if (!isValidIndianMobile(phone.value)) {
    phone.classList.add('is-invalid');
    phone.nextElementSibling.textContent = 'Please enter a valid 10-digit Indian mobile number.';
    valid = false;
  } else {
    phone.classList.remove('is-invalid');
  }

  if (!state.value) {
    state.classList.add('is-invalid');
    valid = false;
  } else {
    state.classList.remove('is-invalid');
  }

  if (!zip.value.trim()) {
    zip.classList.add('is-invalid');
    zip.nextElementSibling.textContent = 'Please enter pincode.';
    valid = false;
  } else if (!isValidIndianPincode(zip.value)) {
    zip.classList.add('is-invalid');
    zip.nextElementSibling.textContent = 'Please enter a valid 6-digit Indian pincode.';
    valid = false;
  } else {
    zip.classList.remove('is-invalid');
  }

  return valid;
}

document.getElementById('placeOrderBtn').addEventListener('click', () => {
  if (!validateDeliveryForm()) return;

  const delivery = {
    name: document.getElementById('deliveryName').value.trim(),
    phone: document.getElementById('deliveryPhone').value.trim(),
    address1: document.getElementById('deliveryAddress1').value.trim(),
    address2: document.getElementById('deliveryAddress2').value.trim(),
    city: document.getElementById('deliveryCity').value.trim(),
    state: document.getElementById('deliveryState').value,
    zip: document.getElementById('deliveryZip').value.trim()
  };

  // Clear cart and persist order (optional: save order to localStorage)
  cart = [];
  saveCart();
  updateCartBadge();

  bootstrap.Modal.getInstance(deliveryModal).hide();
  new bootstrap.Modal(orderSuccessModal).show();
});

function checkLogin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
  } else {
    const loginLink = document.getElementById('loginLink');
    loginLink.textContent = 'Logout';
    loginLink.addEventListener('click', () => {
      localStorage.removeItem(CURRENT_USER_KEY);
      window.location.href = 'index.html';
    });
  }
}

// ========== INIT ==========
function init() {
  loadCart();
  checkLogin();
  loadWishlist();
  updateCartBadge();
  updateWishlistBadge();
  renderProducts();
  initCategoryFilters();
  initColorFilters();
  initSearch();
  initSort();
}

document.addEventListener('DOMContentLoaded', init);
