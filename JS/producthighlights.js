// Home btn click
function toggleLabel(element) {
  element.classList.toggle("active");
}


const products = document.querySelectorAll('.product');

  products.forEach(product => {
    product.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevents the click from bubbling up to the document
      // Deselect others
      products.forEach(p => p.classList.remove('selected'));
      // Select clicked one
      product.classList.add('selected');
    });
  });

  // Click outside to deselect
  document.addEventListener('click', (e) => {
    const isProduct = e.target.closest('.product');
    if (!isProduct) {
      products.forEach(p => p.classList.remove('selected'));
    }
  });

  
let currentProduct = {};
let actionType = '';

function openBuyModal(name, price, imgSrc, styleClass) {
  actionType = 'buy';
  showModal(name, price, imgSrc, styleClass);
}

function openCartModal(name, price, imgSrc, styleClass) {
  actionType = 'cart';
  showModal(name, price, imgSrc, styleClass);
}

function showModal(name, price, imgSrc, styleClass) {
  currentProduct = { name, price };

  document.getElementById('modalName').innerText = name;
  document.getElementById('modalPrice').innerText = price;
  document.getElementById('modalQuantity').value = 1;
  document.getElementById('modalImage').src = imgSrc;

  const layout = document.getElementById('modalLayout');
  const buyFields = document.getElementById('buyFields');
  const cartBtnContainer = document.getElementById('cartButtonContainer');
  const modalBox = document.getElementById('modalBox');


  // Remove any existing style class before applying new one
  modalBox.className = 'modal-content'; // reset base class
  if (styleClass) modalBox.classList.add(styleClass);

  // Layout Switching
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

  const total = quantity * price + shipping;
  totalPaymentElement.innerText = total.toFixed(2);
  productTotalElement.innerText = productTotal.toFixed(2);

}





function closeModal() {
  document.getElementById('productModal').style.display = 'none';
}

function submitForm() {
  if (actionType === 'buy') {
    const address = document.getElementById('address').value.trim();
    const contact = document.getElementById('contact').value.trim();

    if (!address || !contact) {
      alert('Please complete your shipping details.');
      return;
    }
  }


  // Ensure contact only accepts numbers
document.getElementById('contact').addEventListener('input', function () {
  this.value = this.value.replace(/[^0-9]/g, '');
});

 closeModal();

showConfirmation(actionType);

  const message = actionType === 'buy' ? ' ✅ Successfuly Checked out!' : '🛒Added to cart!';
  const confirmationBox = document.getElementById('confirmation');
  confirmationBox.innerText = message;
  confirmationBox.style.display = 'block';

  setTimeout(() => {
    confirmationBox.style.display = 'none';
  }, 3000);

  
}

//CONFIRMATION MESSAGE//

function showConfirmation(actionType) {
    const overlay = document.getElementById('confirmation-overlay');
    const messageBox = document.getElementById('confirmation');
    const message = actionType === 'buy' ? '✅ Successfully Checked Out!' : '🛒 Added to Cart!';
    messageBox.innerText = message;

    // Show overlay and message
    overlay.style.display = 'flex';
    messageBox.style.opacity = '0'; // reset
    messageBox.style.animation = 'zoomIn 0.5s forwards';

    // Wait 1.5s before fly to target
    setTimeout(() => {
        // Calculate target position
        const targetIcon = actionType === 'buy' ? document.getElementById('profileIcon') : document.getElementById('cartIcon');
        const rect = targetIcon.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const deltaX = rect.left + rect.width / 2 - centerX;
        const deltaY = rect.top + rect.height / 2 - centerY;

        messageBox.style.setProperty('--x', `${deltaX}px`);
        messageBox.style.setProperty('--y', `${deltaY}px`);
        messageBox.style.animation = 'flyToTarget 1s forwards';

        // Remove overlay after fly animation
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 1000);
    }, 1500);
  }

  