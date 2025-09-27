
  const cartTab = document.getElementById('cartTab');
  const ordersTab = document.getElementById('ordersTab');
  const cartSection = document.getElementById('cartSection');
  const ordersSection = document.getElementById('ordersSection');

  cartTab.addEventListener('click', () => {
    cartTab.classList.add('active');
    ordersTab.classList.remove('active');
    cartSection.classList.remove('hidden');
    ordersSection.classList.add('hidden');
  });

  ordersTab.addEventListener('click', () => {
    ordersTab.classList.add('active');
    cartTab.classList.remove('active');
    ordersSection.classList.remove('hidden');
    cartSection.classList.add('hidden');
  });


  /*FOR SWITCHING ACTIVE TAB ON ORDER STATUS*/
   const orderTabs = document.querySelectorAll('.order-status');

  function filterOrders(status) {
  // Remove 'active' from all tabs
  orderTabs.forEach(tab => tab.classList.remove('active'));

  // Add active class to the clicked tab
  orderTabs.forEach(tab => {
    if (tab.getAttribute('onclick').includes(status)) {
      tab.classList.add('active');
    }
  });

  // Show/hide order cards
  const cards = document.querySelectorAll(".order-card");
  cards.forEach(card => {
    const orderStatus = card.getAttribute("data-status");
    if (status === "all" || orderStatus === status.toLowerCase()) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });

    // You can add your order filtering logic here (optional)
    console.log("Filter by:", status);
 
}

function submitForm() {
  const name = document.getElementById("modalName").textContent;
  const price = parseFloat(document.getElementById("modalPrice").textContent);
  const quantity = parseInt(document.getElementById("modalQuantity").value);
  const productTotal = price * quantity;
  const shippingFee = 36.00; // or dynamic if you change it later
  const totalPayment = productTotal + shippingFee;

  // Create product object
  const product = {
    name: name,
    price: price,
    quantity: quantity,
    total: productTotal,
    shipping_fee: shippingFee,
    total_payment: totalPayment,
    image: document.getElementById("modalImage").src // ✅ pull from modal image
};

  // Check which button triggered (Buy Now or Add to Cart)
  if (document.getElementById("buyFields").style.display === "block") {
    // TODO: call your checkout/order insert
    alert("Proceeding to checkout...");
  } else {
    addToCart(product); // ✅ this sends to add_to_cart.php
  }

  closeModal();
}


//--------------------------------------------------------------------


function addToCart(product) {
  fetch("../PHP/add_to_cart.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_name: product.name,
      quantity: product.quantity,
      price: product.price,
      product_total: product.total,
      shipping_fee: product.shipping_fee,
      total_payment: product.total_payment,
      product_image: product.image
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("🛒 Added to cart!");
    } else {
      alert("❌ Error: " + data.error);
    }
  });
}


//-----------------------------------------------------------------------


document.addEventListener("DOMContentLoaded", () => {
  fetch("../PHP/get_cart.php", { credentials: "same-origin" })
    .then(res => res.json())
    .then(items => {
      const container = document.getElementById("cartItemsContainer");
      container.innerHTML = "";

      if (!items || items.length === 0) {
        container.innerHTML = "<p>Your cart is empty.</p>";
        return;
      }

      function inferStyleClassFromName(name = '') {
  const n = (name + '').toLowerCase();
  if (n.includes('spicy bbq') || n.includes('sbbq')) return 'style-sbbq';
  if (n.includes('spicy cheese') || n.includes('schiz')) return 'style-schiz';
  if (n.includes('cheese')) return 'style-cheese';
  if (n.includes('barbecue') || n.includes('bbq')) return 'style-bbq';
  if (n.includes('sour')) return 'style-sc';
  if (n.includes('spicy')) return 'style-s';
  if (n.includes('classic')) return 'style-cl';
  return ''; // default
}

       items.forEach(item => {
          // ✅ always coerce to numbers first (MySQL returns strings)
        const id = item.cart_id ?? item.id;         // use cart_id (fallback to id if you ever add it)
        const price = Number(item.price) || 0;
        const qty   = Number(item.quantity) || 1;
        const ship  = qty >= 5 ? 0 : 36;
        const total = price * qty + ship;

// Use a style_class from the server if present, otherwise infer from the product_name
  const styleClass = item.style_class && item.style_class.trim() ? item.style_class.trim() : inferStyleClassFromName(item.product_name);


        const div = document.createElement("div");
        div.classList.add("cart-item");

// attach style as data attribute so buyNow can easily pick it up
  if (styleClass) div.setAttribute('data-style', styleClass);
  div.setAttribute('data-id', id); // helpful for direct query

       div.innerHTML = `
  <div class="cart-left">
    <img src="${item.product_image}" alt="${item.product_name}" class="cart-img">
    <div class="quantity-controls">
      <button class="decrease-btn" data-id="${id}" data-price="${price}">−</button>
      <span class="qty" id="qty-${id}">${qty}</span>
      <button class="increase-btn" data-id="${id}" data-price="${price}">+</button>
    </div>
  </div>

  <div class="cart-right">
    <h3>${item.product_name}</h3>
    <p>Price: ₱${price.toFixed(2)}</p>  
    <p class="subtotal" id="subtotal-${id}">Subtotal: ₱${(price * qty).toFixed(2)}</p>
    <p class="shipping" id="ship-${id}">Shipping: ₱${ship.toFixed(2)}</p>

    <hr class="cart-divider">

    <p class="total" id="total-${id}" data-price="${price}">
      Total: ₱${total.toFixed(2)}
    </p>

    <div class="cart-actions">
      <button class="buy-btn" data-id="${id}">Buy Now</button>
      <button class="remove-btn" data-id="${id}">Remove</button>
    </div>
  </div>
`;


        container.appendChild(div);
      });

       // Hook up +/− after render
      document.querySelectorAll(".increase-btn").forEach(btn => {
        btn.addEventListener("click", (e) =>
          updateQuantity(e.currentTarget.dataset.id, +1, Number(e.currentTarget.dataset.price))
        );
      });

      document.querySelectorAll(".decrease-btn").forEach(btn => {
        btn.addEventListener("click", (e) =>
          updateQuantity(e.currentTarget.dataset.id, -1, Number(e.currentTarget.dataset.price))
        );
      });

      // Remove button
      document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.dataset.id;
          const itemEl = e.currentTarget.closest('.cart-item');
          removeItem(id, itemEl);
        });
      });

      // Buy Now button
      document.querySelectorAll(".buy-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.dataset.id;
          buyNow(id);
        });
      });
      
    })

    
    .catch(err => {
      console.error("Cart fetch error:", err);
      document.getElementById("cartItemsContainer").innerHTML = "<p>Error loading cart.</p>";
    });
});

// ✅ Update quantity (front-end only for now)
function updateQuantity(id, delta, price) {
  const qtyEl = document.getElementById(`qty-${id}`);
  let qty = Number(qtyEl.textContent) + delta;
  if (qty < 1) qty = 1;
  qtyEl.textContent = qty;

  // recalc subtotal
  document.getElementById(`subtotal-${id}`).textContent =
    `Subtotal: ₱${(price * qty).toFixed(2)}`;

  // shipping
  const ship = qty >= 5 ? 0 : 36;
  document.getElementById(`ship-${id}`).textContent = `Shipping: ₱${ship.toFixed(2)}`;

  // total
  const total = price * qty + ship;
  document.getElementById(`total-${id}`).textContent = `Total: ₱${total.toFixed(2)}`;
}


// ✅ Remove item with fade-out effect
function removeItem(id, itemEl) {
  fetch("../PHP/remove_cart.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "id=" + encodeURIComponent(id),
    credentials: "same-origin"
  })
  .then(res => res.text())
  .then(text => {
    if (text && /removed/i.test(text)) {
      if (itemEl) {
        itemEl.style.transition = "opacity 300ms ease, transform 300ms ease";
        itemEl.style.opacity = "0";
        itemEl.style.transform = "translateY(-6px)";
        setTimeout(() => {
          if (itemEl && itemEl.parentNode) itemEl.parentNode.removeChild(itemEl);
          const container = document.getElementById("cartItemsContainer");
          if (container && container.children.length === 0) {
            container.innerHTML = "<p>Your cart is empty.</p>";
          }
        }, 350);
      } else {
        location.reload();
      }
    } else {
      console.error("Remove failed:", text);
    }
  })
  .catch(err => console.error("Remove error:", err));
}

// NEW: open product modal pre-filled when clicking Buy on cart item
function buyNow(id) {
  const selector = `[data-id="${id}"]`;
  // prefer the cart-item container with data-id
  let match = document.querySelector(selector);
  if (!match) {
    // fallback: find any element with the data-id attribute
    match = document.querySelector(`[data-id="${id}"]`);
  }
  if (!match) {
    window.location.href = `../PHP/checkout.php?cart_id=${encodeURIComponent(id)}`;
    return;
  }

  // if we matched a child (e.g., the buy button), ensure we get the .cart-item wrapper
  const itemEl = match.closest ? match.closest('.cart-item') || match : match;

  const name = (itemEl.querySelector('h3') && itemEl.querySelector('h3').textContent.trim()) || itemEl.querySelector('.cart-item-name')?.textContent?.trim() || '';
  // price fallback logic
  let price = 0;
  const totalEl = itemEl.querySelector('.total');
  if (totalEl && totalEl.dataset && totalEl.dataset.price) {
    price = parseFloat(totalEl.dataset.price);
  } else {
    const priceText = itemEl.querySelector('.price')?.textContent || itemEl.querySelector('.thirty')?.textContent || '';
    price = parseFloat((priceText + '').replace(/[^0-9.]+/g, '')) || 0;
  }

  // quantity
  let qty = 1;
  const qtyEl = itemEl.querySelector('.qty') || itemEl.querySelector('.cart-item-qty') || itemEl.querySelector('input.qty');
  if (qtyEl) qty = parseInt(qtyEl.textContent || qtyEl.value || '1', 10) || 1;

  const img = (itemEl.querySelector('img') && itemEl.querySelector('img').src) || '';

  // read style from data-style OR infer from name
  let styleClass = itemEl.dataset && itemEl.dataset.style ? itemEl.dataset.style : '';
  if (!styleClass) {
    styleClass = inferStyleClassFromName(name); // reuse helper defined earlier
  }

  if (typeof openBuyModal === 'function') {
    openBuyModal(name, price.toFixed(2), img, styleClass);

    // fill modal quantity and cartId
    const modalQty = document.getElementById('modalQuantity');
    if (modalQty) modalQty.value = qty;
    if (typeof updateTotal === 'function') updateTotal();

    const modalCartId = document.getElementById('modalCartId');
    if (modalCartId) modalCartId.value = id;

    // ensure modal shows buy layout
    const modalBox = document.getElementById('modalBox');
    const layout = document.getElementById('modalLayout');
    if (modalBox) {
      modalBox.classList.remove('cart-mode');
      if (styleClass) modalBox.classList.add(styleClass);
    }
    if (layout) {
      layout.classList.remove('cart-layout');
    }
  } else {
    window.location.href = `../PHP/checkout.php?cart_id=${encodeURIComponent(id)}`;
  }
}


//------------------------------------------------------

// Call this to load orders into #order-items
function loadOrders() {
  const container = document.getElementById('order-items');
  if (!container) return;

  container.innerHTML = "<p>Loading orders...</p>";

  fetch("../PHP/get_orders.php", { credentials: "same-origin" })
    .then(res => res.json())
    .then(orders => {
      container.innerHTML = "";

      if (!orders || orders.length === 0) {
        container.innerHTML = "<p>No orders yet.</p>";
        return;
      }

      orders.forEach(order => {
        const id = order.order_id || order.id || '';
        const name = order.product_name || '';
        const qty = Number(order.quantity) || 1;
        const price = Number(order.price) || 0;
        const subtotal = Number(order.product_total) || price * qty;
        const shipping = Number(order.shipping_fee) || 0;
        const total = Number(order.total_payment) || (subtotal + shipping);
        // prefer product_image from products table; fallback to a project image
        let img = order.product_image || '../IMG/Founder.jpg';
        // quick sanitization: if path is empty, fallback
        if (!img || img.trim() === '') img = '../IMG/Founder.jpg';

        // render order card
        const card = document.createElement('div');
        card.className = 'order-card';
        card.setAttribute("data-status", (order.status || 'Pending').toLowerCase());
        
       card.innerHTML = `
  
  <div class="cart-left">
    <img src="${img}" alt="${name}" class="cart-img" 
         onerror="this.src='../IMG/Founder.jpg'">
  </div>

  <div class="cart-right">
    <h3>${escapeHtml(name)}</h3>
    <p>Qty: ${qty}</p>
    <p>Price: ₱${price.toFixed(2)}</p>
    <p class="subtotal">Subtotal: ₱${subtotal.toFixed(2)}</p>
    <p class="shipping">Shipping: ₱${shipping.toFixed(2)}</p>

    <hr class="cart-divider">

    <p class="total"><strong>Total: ₱${total.toFixed(2)}</strong></p>
    <p class="order-date">Ordered on: ${escapeHtml(order.date_ordered || '')}</p>

    <div class="cart-actions">
      <button class="buy-btn" data-id="${order.id}">Buy Again</button>
      <button class="review-btn" data-id="${order.id}">Write Review</button>
    </div>
  </div>
`;

        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error loading orders:", err);
      document.getElementById('order-items').innerHTML = "<p>Error loading orders.</p>";
    });
}

// Escape helper to avoid injecting raw HTML
function escapeHtml(text) {
  if (!text && text !== 0) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Hook Orders tab to load orders when clicked
// Replace your existing ordersTab click handler with this:
ordersTab.addEventListener('click', () => {
  ordersTab.classList.add('active');
  cartTab.classList.remove('active');
  ordersSection.classList.remove('hidden');
  cartSection.classList.add('hidden');
  // Fetch and render orders whenever user opens Orders tab
  loadOrders();
});


function submitForm() {
  const cartId = document.getElementById("modalCartId").value || 0;
  const name = document.getElementById("modalName").textContent.trim();
  const price = parseFloat(document.getElementById("modalPrice").textContent) || 0;
  const quantity = parseInt(document.getElementById("modalQuantity").value, 10) || 1;
  const productTotal = +(price * quantity).toFixed(2);
  const shippingFee = quantity >= 5 ? 0 : 36;
  const totalPayment = productTotal + shippingFee;
  const productImage = document.getElementById("modalImage").src;
  const address = document.getElementById("address").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const paymentMethod = document.getElementById("paymentMethod").value;

  if (!address || !contact) {
    alert("Please enter shipping address and contact number.");
    return;
  }

  //TO BUY FROM THE CART

  fetch("../PHP/place_order.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cart_id: cartId,
      product_name: name,
      quantity: quantity,
      price: price,
      product_total: productTotal,
      shipping_fee: shippingFee,
      total_payment: totalPayment,
      product_image: productImage,
      address: address,
      contact: contact,
      payment_method: paymentMethod
    }),
    credentials: "same-origin"
  })
  .then(res => res.json())
  .then(data => {
    
    
   if (data.success) {
  closeModal();
  loadOrders();   // refresh orders tab
  document.querySelector(`[data-id="${cartId}"]`)?.remove();

  // ✅ Use your animated confirmation (same as product.js)
  showConfirmation("buy");
} else {
  showConfirmation("error"); // optional: you can add a red error style
  console.error("Order error:", data);
}



  })
  .catch(err => {
    console.error("Checkout error:", err);
    alert("Checkout failed.");
  });
}
