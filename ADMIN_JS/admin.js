// admin.js
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll("aside nav ul li[data-section]");
  const sections = document.querySelectorAll("main section");
  const quickButtons = document.querySelectorAll(".quick-links button[data-target]");

  function hideAllSections() {
    sections.forEach(s => s.classList.add("hidden"));
  }
  function clearActiveNav() {
    navItems.forEach(n => n.classList.remove("active"));
  }
  function showSectionById(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("hidden");
  }

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const sectionId = item.dataset.section;
      if (!sectionId) return;
      clearActiveNav();
      hideAllSections();
      item.classList.add("active");
      showSectionById(sectionId);
    });
  });

  quickButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tgt = btn.dataset.target;
      if (!tgt) return;
      // highlight nav if exists
      const navMatch = Array.from(navItems).find(n => n.dataset.section === tgt);
      if (navMatch) {
        clearActiveNav();
        navMatch.classList.add("active");
      }
      hideAllSections();
      showSectionById(tgt);
    });
  });

  // Ensure initial state: show dashboard section and mark nav active
  const activeNav = document.querySelector("aside nav ul li.active[data-section]");
  if (activeNav) {
    hideAllSections();
    showSectionById(activeNav.dataset.section);
  } else {
    // fallback: show dashboard
    hideAllSections();
    showSectionById("dashboard");
    const dash = document.querySelector('aside nav ul li[data-section="dashboard"]');
    if (dash) dash.classList.add("active");
  }
});


//PRODUCTS SECTION CRUD BUTTONS//

// ===== PRODUCTS MODAL HANDLERS =====
const addProductBtn = document.getElementById("openAddProduct");
const addProductModal = document.getElementById("addProductModal");
const editProductModal = document.getElementById("editProductModal");
const closeBtns = document.querySelectorAll(".modal .close");

// Open Add Modal
if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
        addProductModal.classList.remove("hidden");
    });
}

// Open Edit Modal
document.querySelectorAll(".openEditModal").forEach(btn => {
    btn.addEventListener("click", () => {
        let id = btn.dataset.id;
        let name = btn.dataset.name;
        let price = btn.dataset.price;
        let stock = btn.dataset.stock;
        let desc = btn.dataset.desc;
        let img = btn.dataset.img;

        let form = editProductModal.querySelector("form");
        form.id.value = id;
        form.name.value = name;
        form.price.value = price;
        form.stock.value = stock;
        form.description.value = desc;

        let currentImage = document.getElementById("currentImage");
        currentImage.src = img ? `../IMG/${img}` : "";

        editProductModal.classList.remove("hidden");
    });
});

// Close modals
closeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        btn.closest(".modal").classList.add("hidden");
    });
});

// Delete Product
document.querySelectorAll(".deleteProduct").forEach(btn => {
    btn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this product?")) {
            window.location.href = `delete_product.php?id=${btn.dataset.id}`;
        }
    });
});


function openProductForm() {
  document.getElementById('productFormContainer').classList.remove('hidden');
  document.getElementById('productId').value = '';
  document.getElementById('productForm').reset();
}

function closeProductForm() {
  document.getElementById('productFormContainer').classList.add('hidden');
}

function editProduct(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const imgSrc = row.children[4].querySelector('img').src;
  document.getElementById('productId').value = id;
  document.getElementById('productName').value = row.children[1].textContent;
  document.getElementById('productPrice').value = parseFloat(row.children[2].textContent.replace('₱',''));
  document.getElementById('productStock').value = parseInt(row.children[3].textContent, 10);

 document.getElementById('productImagePreview').src = imgSrc;
document.getElementById('productImagePreview').style.display = 'block';
  
  document.getElementById('productDescription').value = row.children[5].textContent;
  document.getElementById('productFormContainer').classList.remove('hidden');
}

document.getElementById('productImage').addEventListener('change', function(e) {
  const preview = document.getElementById('productImagePreview');
  preview.src = URL.createObjectURL(this.files[0]);
  preview.style.display = 'block';
});


function saveProduct(e) {
  e.preventDefault();
  const formData = new FormData(document.getElementById('productForm'));
  fetch('../ADMIN_PHP/save_product.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Close the form
      closeProductForm();

      // Show products section
      document.getElementById('products').classList.remove('hidden');

      // Optionally, fetch the updated table via AJAX or append the new row
      // For now, simple solution: reload only products table
      fetchProductsTable();
    } else {
      alert('❌ ' + data.error);
    }
  });
}

// Fetch updated products table (replace tbody)
function fetchProductsTable() {
  fetch('../ADMIN_PHP/fetch_products.php')
    .then(res => res.text())
    .then(html => {
      document.getElementById('productsTableBody').innerHTML = html;
    });
}




// ------------------------
// REPORTS SECTION HANDLER
// ------------------------
// ------------------------
// REPORTS SECTION HANDLER
// ------------------------
document.addEventListener("DOMContentLoaded", () => {
  const reportBtns = document.querySelectorAll(".report-btn");
  const output = document.getElementById("reportOutput");
  if (!reportBtns.length || !output) return;

  // initial load
  loadReport("sales", "today", "all");

  // main report buttons (Sales / Users / Inventory)
  reportBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // set active visual
      reportBtns.forEach(b => b.classList.toggle("active", b === btn));
      const type = btn.dataset.type;
      // users should default to 'all', sales to today
      if (type === "sales") loadReport("sales", "today", "all");
      else if (type === "users") loadReport("users", "today", "all");
      else loadReport(type, "today", "all");
    });
  });

  // unified loader
  function loadReport(type = "sales", range = "today", filter = "all") {
    // fetch HTML from server
    fetch(`../ADMIN_PHP/get_report.php?type=${encodeURIComponent(type)}&range=${encodeURIComponent(range)}&filter=${encodeURIComponent(filter)}`)
      .then(res => res.text())
      .then(html => {
        output.innerHTML = html;

        // sales sub-filters (today / week / month)
        const salesBtns = output.querySelectorAll(".sales-btn");
        if (salesBtns.length) {
          salesBtns.forEach(sb => {
            sb.addEventListener("click", () => {
              // visually toggle inside output
              salesBtns.forEach(s => s.classList.toggle("active", s === sb));
              loadReport("sales", sb.dataset.range || "today", "all");
            });
          });
        }

        // user cards: clickable filters
        const userCards = output.querySelectorAll(".user-card");
        if (userCards.length) {
          userCards.forEach(card => {
            // set pointer cursor & click handler
            card.style.cursor = "pointer";
            card.addEventListener("click", () => {
              // set visual active
              userCards.forEach(c => c.classList.toggle("active", c === card));
              const f = card.dataset.filter || "all";
              loadReport("users", "today", f);
            });
          });
        }
      })
      .catch(err => {
        output.innerHTML = `<p style="color:red;">❌ Error loading report: ${err}</p>`;
      });
  }
});



//<section id="reseller-tracker" class="hidden"><h1>Reseller Tracker</h1></section>
   // <li data-section="reseller-tracker">Reseller Tracker</li>
