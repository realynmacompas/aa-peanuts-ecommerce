let currentProduct = { name: '', price: 0 };
let actionType = '';

// ---------------- MODAL OPENERS ----------------
function openBuyModal(name, price, imgSrc, styleClass) {
  actionType = 'buy';
  showModal(name, price, imgSrc, styleClass);
}

function openCartModal(name, price, imgSrc, styleClass) {
  actionType = 'cart';
  showModal(name, price, imgSrc, styleClass);
}

function showModal(name, price, imgSrc, styleClass) {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : +price;
  currentProduct = { name, price: numericPrice };

  document.getElementById('modalName').innerText = name;
  document.getElementById('modalPrice').innerText = numericPrice.toFixed(2);
  document.getElementById('modalQuantity').value = 1;
  document.getElementById('modalImage').src = imgSrc;

  const layout = document.getElementById('modalLayout');
  const buyFields = document.getElementById('buyFields');
  const cartBtnContainer = document.getElementById('cartButtonContainer');
  const modalBox = document.getElementById('modalBox');

  // Reset & apply style
  modalBox.className = 'modal-content';
  if (styleClass) modalBox.classList.add(styleClass);

  // Switch layout
  if (actionType === 'buy') {
    layout.classList.remove('cart-layout');
    buyFields.style.display = 'block';
    cartBtnContainer.style.display = 'none';
    modalBox.classList.remove('cart-mode');
  } else {
    layout.classList.add('cart-layout');
    buyFields.style.display = 'none';
    cartBtnContainer.style.display = 'block';
    modalBox.classList.add('cart-mode');
  }

  updateTotal();
  document.getElementById('productModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('productModal').style.display = 'none';
}

// ---------------- VALIDATION ----------------
// Contact numbers only
//document.getElementById('contact').addEventListener('input', function () {
  //this.value = this.value.replace(/[^0-9]/g, '');
//});

// ---------------- TOTAL CALCULATOR ----------------
function updateTotal() {
  const quantity = parseInt(document.getElementById('modalQuantity').value) || 1;
  const price = currentProduct.price;

  const productTotalElement = document.getElementById('productTotal');
  const shippingFeeElement = document.getElementById('shippingFee');
  const freeShipText = document.getElementById('free-ship');
  const totalPaymentElement = document.getElementById('totalPayment');

  const productTotal = quantity * price;
  let shipping = 36;

  if (quantity >= 5) {
    shipping = 0;
    shippingFeeElement.innerText = "0.00";
    freeShipText.innerText = "Free Shipping!";
  } else {
    shippingFeeElement.innerText = "36.00";
    const remaining = 5 - quantity;
    freeShipText.innerText = `Buy ${remaining} more to get Free Shipping!`;
  }

  const total = productTotal + shipping;
  productTotalElement.innerText = productTotal.toFixed(2);
  totalPaymentElement.innerText = total.toFixed(2);
}

// ---------------- FORM SUBMIT ----------------
function submitForm() {
  const name = document.getElementById('modalName').textContent;
  const price = parseFloat(document.getElementById('modalPrice').textContent);
  const quantity = parseInt(document.getElementById('modalQuantity').value, 10) || 1;
  const productTotal = +(price * quantity).toFixed(2);
  const shippingFee = quantity >= 5 ? 0 : 36;
  const totalPayment = +(productTotal + shippingFee).toFixed(2);
  const image = document.getElementById('modalImage').getAttribute('src');

  const payload = {
    product_name: name,
    quantity,
    price,
    product_total: productTotal,
    shipping_fee: shippingFee,
    total_payment: totalPayment,
    product_image: image
  };

  if (actionType === 'cart') {
    addToCart(payload);
  } else {
    const region = document.getElementById('region').value;
    const province = document.getElementById('province').value;
    const city = document.getElementById('city').value;
    const barangay = document.getElementById('barangay').value;
    const street = document.getElementById('address').value.trim();

    const fullAddress = [street, barangay, city, province, region]
  .filter(Boolean)
  .join(', ');

    const contact = document.getElementById('contact').value.trim();
    const payment_method = document.getElementById('paymentMethod').value;
    const cartIdEl = document.getElementById('modalCartId');
    const cart_id = cartIdEl && cartIdEl.value ? parseInt(cartIdEl.value, 10) : null;

    if (!street || !contact || !region || !city || !barangay) {
  alert('⚠️ Please complete your shipping details.');
  return;
}

   
    // ✅ Use fullAddress, not old address
    fetch('../PHP/place_order.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        product_name: name,
        quantity,
        price,
        product_total: productTotal,
        shipping_fee: shippingFee,
        total_payment: totalPayment,
        product_image: image,
        address: fullAddress,
        contact,
        payment_method,
        cart_id
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (cart_id) {
            const match = document.querySelector(`[data-id="${cart_id}"]`);
            if (match) {
              const cartRow = match.closest('.cart-item') || match;
              if (cartRow) cartRow.remove();
            }
          }
          closeModal();
          showConfirmation('buy');
        } else {
          alert('❌ Order failed: ' + data.error);
        }
      })
      .catch(err => alert('Network error: ' + err));
  }
}

// ---------------- ADD TO CART ----------------
function addToCart(payload) {
  fetch('../PHP/add_to_cart.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        closeModal();
        showConfirmation('cart');
      } else {
        if (data.error && String(data.error).toLowerCase().includes('not logged in')) {
          window.location.href = '../PAGES/login.html';
        } else {
          alert('Add to cart failed: ' + (data.error || 'Unknown error'));
        }
      }
    })
    .catch(err => alert('Network error: ' + err));
}

// ---------------- CONFIRMATION ANIMATION ----------------
function showConfirmation(actionType) {
  const overlay = document.getElementById('confirmation-overlay');
  const messageBox = document.getElementById('confirmation');
  const message = actionType === 'buy'
    ? '✅ Successfully Checked Out!'
    : '🛒 Added to Cart!';

  messageBox.innerText = message;

  overlay.style.display = 'flex';
  overlay.style.opacity = '1';
  overlay.style.transition = 'opacity 0.5s';
  messageBox.style.opacity = '0';
  messageBox.style.animation = 'zoomIn 0.5s forwards';

  setTimeout(() => {
    const targetIcon = actionType === 'buy'
      ? document.getElementById('profileIcon')
      : document.getElementById('cartIcon');

    if (!targetIcon) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.style.display = 'none', 500);
      return;
    }

    const rect = targetIcon.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = rect.left + rect.width / 2 - centerX;
    const deltaY = rect.top + rect.height / 2 - centerY;

    messageBox.style.setProperty('--x', `${deltaX}px`);
    messageBox.style.setProperty('--y', `${deltaY}px`);
    messageBox.style.animation = 'flyToTarget 1s forwards';

    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 500);
    }, 1000);
  }, 1500);
}

// ---------------- PSGC DROPDOWNS ----------------

document.addEventListener('DOMContentLoaded', () => {
  // Safe contact input listener (won't throw if element missing)
  const contactEl = document.getElementById('contact');
  if (contactEl) {
    contactEl.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '');
    });
  }

  // global holder for PSGC nested JSON
  window.psgcData = {};

  // Load nested psgc.json (adjust path if your file is in a different folder)
  fetch('/AAPEANUTS/psgc.json')
    .then(res => {
      if (!res.ok) throw new Error('PSGC fetch failed: ' + res.status);
      return res.json();
    })
    .then(data => {
      window.psgcData = data;
      console.log('PSGC loaded — regions count:', Object.keys(data).length);
      loadRegions();
    })
    .catch(err => {
      console.error('❌ Error loading PSGC:', err);
      const regionSelect = document.getElementById('region');
      if (regionSelect) regionSelect.innerHTML = '<option value="">(PSGC load error)</option>';
    });

  // Expose functions to window so inline onchange attributes keep working
  window.loadRegions = function () {
    const regionSelect = document.getElementById('region');
    const provinceSelect = document.getElementById('province');
    const citySelect = document.getElementById('city');
    const barangaySelect = document.getElementById('barangay');

    if (!regionSelect) return;
    regionSelect.innerHTML = '<option value="">-- Select Region --</option>';

    // Reset downstream selects
    if (provinceSelect) { provinceSelect.innerHTML = '<option value="">-- Select Province --</option>'; provinceSelect.disabled = true; }
    if (citySelect) { citySelect.innerHTML = '<option value="">-- Select City / Municipality --</option>'; citySelect.disabled = true; }
    if (barangaySelect) { barangaySelect.innerHTML = '<option value="">-- Select Barangay --</option>'; barangaySelect.disabled = true; }

    Object.keys(window.psgcData || {}).forEach(region => {
      const opt = document.createElement('option');
      opt.value = region;
      opt.textContent = region;
      regionSelect.appendChild(opt);
    });
  };

  window.loadProvinces = function () {
    const region = (document.getElementById('region') || {}).value;
    const provinceSelect = document.getElementById('province');
    const citySelect = document.getElementById('city');
    const barangaySelect = document.getElementById('barangay');

    // reset
    if (provinceSelect) { provinceSelect.innerHTML = '<option value="">-- Select Province --</option>'; provinceSelect.disabled = true; }
    if (citySelect) { citySelect.innerHTML = '<option value="">-- Select City / Municipality --</option>'; citySelect.disabled = true; }
    if (barangaySelect) { barangaySelect.innerHTML = '<option value="">-- Select Barangay --</option>'; barangaySelect.disabled = true; }

    if (!region) return;
    const regionObj = window.psgcData[region];
    if (!regionObj) return;

    // detect whether regionObj children are arrays (cities) or objects (provinces)
    const firstKey = Object.keys(regionObj)[0];
    const firstVal = regionObj[firstKey];

    if (Array.isArray(firstVal)) {
      // Region → City → Barangay (NCR/independent cities)
      // leave provinceSelect disabled; populate citySelect directly
      Object.keys(regionObj).forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        opt.textContent = city;
        citySelect.appendChild(opt);
      });
      citySelect.disabled = false;
    } else {
      // Region → Province → City → Barangay (normal provinces)
      Object.keys(regionObj).forEach(province => {
        const opt = document.createElement('option');
        opt.value = province;
        opt.textContent = province;
        provinceSelect.appendChild(opt);
      });
      provinceSelect.disabled = false;
    }
  };

  window.loadCities = function () {
    const region = (document.getElementById('region') || {}).value;
    const province = (document.getElementById('province') || {}).value;
    const citySelect = document.getElementById('city');
    const barangaySelect = document.getElementById('barangay');

    if (!citySelect) return;
    citySelect.innerHTML = '<option value="">-- Select City / Municipality --</option>';
    citySelect.disabled = true;
    if (barangaySelect) { barangaySelect.innerHTML = '<option value="">-- Select Barangay --</option>'; barangaySelect.disabled = true; }

    if (!region) return;
    const regionObj = window.psgcData[region];
    if (!regionObj) return;

    // If province was selected (normal provinces), load its cities
    if (province && regionObj[province]) {
      const provinceObj = regionObj[province];
      Object.keys(provinceObj).forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        opt.textContent = city;
        citySelect.appendChild(opt);
      });
      citySelect.disabled = false;
    } else {
      // No province selected (happens when region contains cities directly) — nothing to do,
      // cities already loaded by loadProvinces() in that case.
    }
  };

  window.loadBarangays = function () {
    const region = (document.getElementById('region') || {}).value;
    const province = (document.getElementById('province') || {}).value;
    const city = (document.getElementById('city') || {}).value;
    const barangaySelect = document.getElementById('barangay');

    if (!barangaySelect) return;
    barangaySelect.innerHTML = '<option value="">-- Select Barangay --</option>';
    barangaySelect.disabled = true;

    if (!region || !city) return;
    const regionObj = window.psgcData[region];
    if (!regionObj) return;

    // Resolve barangays whether city lives under a province or directly under region
    let barangays = [];
    if (province && regionObj[province] && Array.isArray(regionObj[province][city])) {
      barangays = regionObj[province][city];
    } else if (Array.isArray(regionObj[city])) {
      barangays = regionObj[city];
    }

    if (!barangays || barangays.length === 0) return;

    barangays.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b;
      barangaySelect.appendChild(opt);
    });
    barangaySelect.disabled = false;
  };

}); // end DOMContentLoaded
