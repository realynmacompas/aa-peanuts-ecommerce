<?php
// admin.php
session_start();
require_once "../PHP/aapeanutsdb.php"; // <-- adjust path if needed

// Restrict access to admin only
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
    header("Location: ../PHP/login.php");
    exit();
}

function e($str) {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

// --- DASHBOARD QUERIES ---
$totalUsers = $conn->query("SELECT COUNT(*) AS c FROM users")->fetch_assoc()['c'] ?? 0;
$totalSalesToday = $conn->query("
    SELECT IFNULL(SUM(total_payment),0) AS t 
    FROM orders 
    WHERE DATE(date_ordered) = CURDATE()
")->fetch_assoc()['t'] ?? 0;
$totalRevenue = $conn->query("SELECT IFNULL(SUM(total_payment),0) AS r FROM orders")->fetch_assoc()['r'] ?? 0;
$totalPacks = $conn->query("SELECT IFNULL(SUM(quantity),0) AS q FROM orders")->fetch_assoc()['q'] ?? 0;

// --- USERS LIST ---
$users = $conn->query("SELECT id, username, email, user_type, total_items_bought FROM users");
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>A&A Peanuts Admin Panel</title>
  <link rel="stylesheet" href="../ADMIN_CSS/admin.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

</head>
<body>

  <!-- Sidebar Navigation -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <a href="../ADMIN_PHP/admin.php"><h1><img src="../IMG/1e2b3aea-d004-4674-9f39-a064586ce66b-removebg-preview (6).png" alt="logo" id="header-logo"></h1></a>
      <p id="greek-word">ελκυστικός</p>
      <p id="admin_text">🔑Admin Panel</p>
    </div>

    <nav>
      <ul>
        <li class="active" data-section="dashboard">Dashboard</li>
        <li data-section="users">Users</li>
        <li data-section="orders">Orders</li>
        <li data-section="products">Products</li>
       <!-- <li data-section="reseller-tracker">Reseller Tracker</li>-->
        <li data-section="reports">Reports</li>
        <li data-section="settings">Settings</li>
        <li class="logout"><a href="../PAGES/login.html">Log out</a></li>
      </ul>
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="main-content">

    <!-- DASHBOARD SECTION (visible by default) -->
    <section id="dashboard">
      <h1>Dashboard</h1>
      <div class="kpi-container">
        <div class="kpi-card"><h3>Total Users</h3><p id="kpi-total-users"><?= e($totalUsers) ?></p></div>
        <div class="kpi-card"><h3>Total Sales Today</h3><p id="kpi-sales-today">₱<?= e($totalSalesToday) ?></p></div>
        <div class="kpi-card"><h3>Total Revenue</h3><p id="kpi-total-revenue">₱<?= e($totalRevenue) ?></p></div>
        <div class="kpi-card"><h3>Total Packs Sold</h3><p id="kpi-total-packs"><?= e($totalPacks) ?></p></div>
      </div>

      <div class="quick-links">
        <button data-target="users">Manage Users</button>
        <button data-target="orders">Manage Orders</button>
        <button data-target="products">Add New Product</button>
        <button data-target="reports">View Reports</button>
      </div>
    </section>

    <!-- USERS MANAGEMENT SECTION -->
    <section id="users" class="hidden">
      <h1>Users Management</h1>
      <table>
        <thead>
          <tr>
            <th>User ID</th><th>Full Name</th><th>Email</th><th>Account Type</th><th>Packs Purchased</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
        <?php if ($users && $users->num_rows > 0): ?>
          <?php while ($u = $users->fetch_assoc()): ?>
            <tr data-id="<?= e($u['id']) ?>">
              <td><?= e($u['id']) ?></td>
              <td><?= e($u['username']) ?></td>
              <td><?= e($u['email']) ?></td>
              <td><?= e(ucfirst($u['user_type'])) ?></td>
              <td><?= e($u['total_items_bought']) ?></td>
              <td>
                <button class="view-btn" data-id="<?= e($u['id']) ?>">View</button>
                <a href="../PHP/edit_user.php?id=<?= e($u['id']) ?>"><button>Edit</button></a>
                <a href="../PHP/delete_user.php?id=<?= e($u['id']) ?>" onclick="return confirm('Delete user?');"><button>Delete</button></a>
              </td>
            </tr>
          <?php endwhile; ?>
        <?php else: ?>
          <tr><td colspan="6">No users found.</td></tr>
        <?php endif; ?>
        </tbody>
      </table>
    </section>

    <!-- ORDERS MANAGEMENT SECTION -->
    <section id="orders" class="hidden">
      <h1>Orders Management</h1>
      <table>
        <thead>
          <tr>
            <th>Order ID</th><th>Customer Name</th><th>Products</th><th>Quantity</th>
            <th>Order Total</th><th>Account Type</th><th>Status</th><th>Order Date</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
        <?php
        // Use your actual order PK column name 'order_id'
        $orders = $conn->query("
          SELECT o.order_id, o.user_id, o.product_name, o.quantity, o.total_payment,
                 o.status, o.date_ordered, u.username, u.user_type
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.id
          ORDER BY o.date_ordered DESC
        ");
        if ($orders && $orders->num_rows > 0):
            while ($o = $orders->fetch_assoc()):
        ?>
          <tr data-id="<?= e($o['order_id']) ?>">
            <td><?= e($o['order_id']) ?></td>
            <td><?= e($o['username'] ?? 'Unknown') ?></td>
            <td><?= e($o['product_name']) ?></td>
            <td><?= e($o['quantity']) ?></td>
            <td>₱<?= e($o['total_payment']) ?></td>
            <td><?= e(ucfirst($o['user_type'] ?? 'regular')) ?></td>
            <td><?= e(ucfirst($o['status'])) ?></td>
            <td><?= e($o['date_ordered']) ?></td>
            <td>
              <button class="update-status-btn" data-id="<?= e($o['order_id']) ?>">Update Status</button>
              <button class="cancel-btn" data-id="<?= e($o['order_id']) ?>">Cancel</button>
            </td>
          </tr>
        <?php
            endwhile;
        else:
        ?>
          <tr><td colspan="9">No orders found.</td></tr>
        <?php endif; ?>
        </tbody>
      </table>
    </section>


    <!-- PRODUCTS MANAGEMENT SECTION -->
<section id="products" class="hidden">
  <h1>Products</h1>
  <button class="btn btn-add" onclick="openProductForm()">+ Add Product</button>

  <!-- Add/Edit Form (hidden by default) -->
  <div id="productFormContainer" class="form-container hidden">
    <form id="productForm" onsubmit="return saveProduct(event)">
      <input type="hidden" id="productId" name="id">
      <label>Name:</label>
      <input type="text" id="productName" name="name" required>
      <label>Price:</label>
      <input type="number" id="productPrice" name="price" step="1" required>
       <label>Stock:</label>
      <input type="number" id="productStock" name="stock" min="0" required>
      <label>Image URL:</label>
      <input type="file" id="productImage" name="image">

      <img id="productImagePreview">

      <label>Description:</label>
      <textarea id="productDescription" name="description"></textarea>
      <button type="submit" class="btn btn-save">Save</button>
      <button type="button" class="btn btn-cancel" onclick="closeProductForm()">Cancel</button>
    </form>
  </div>

  <!-- Products Table -->
  <table class="products-table">
    <thead>
     <tr>
       <th>ID</th><th>Name</th><th>Price</th><th>Stock</th><th>Image</th><th>Description</th><th>Actions</th>
     </tr>
   </thead>
    <tbody id="productsTableBody">
      <?php
      include '../PHP/aapeanutsdb.php';
      $result = $conn->query("SELECT * FROM products ORDER BY id ASC");
      while ($p = $result->fetch_assoc()):
      ?>
        <tr data-id="<?= $p['id'] ?>">
          <td><?= $p['id'] ?></td>
          <td><?= htmlspecialchars($p['name']) ?></td>
          <td>₱<?= number_format($p['price'], 2) ?></td>
          <td><?= (int)$p['stock'] ?></td>
          <td><img src="../IMG/<?= htmlspecialchars($p['image']) ?>" alt="img" width="50"></td>
          <td><?= htmlspecialchars($p['description']) ?></td>
          <td>
             <div class="products-action-buttons">
              <button class="btn btn-edit" onclick="editProduct(<?= $p['id'] ?>)">Edit</button>
              <button class="btn btn-delete" 
                onclick="openDeleteConfirmation(<?= $p['id'] ?>, this.closest('tr'))">
                 Delete
              </button>

             </div>
        </td>
        </tr>
      <?php endwhile; ?>
    </tbody>
  </table>
</section>



<!-- REPORTS SECTION -->
<section id="reports" class="hidden">
  <h1>Reports</h1>

  <div class="report-controls">
    <button class="report-btn active" data-type="sales">📊 Sales Report</button>
    <button class="report-btn" data-type="users">👥 User Report</button>
    <button class="report-btn" data-type="inventory">📦 Inventory Report</button>
  </div>

  <div id="reportOutput" class="report-output">
    <!-- Default loaded via JS: Sales Report (Today) -->
  </div>
</section>



    <!-- Other sections (placeholder, hidden) -->
    <!--<section id="reseller-tracker" class="hidden"><h1>Reseller Tracker</h1></section>-->
    <section id="settings" class="hidden"><h1>Settings</h1></section>

  </main>
   <?php include '../ADMIN_PAGE/delete_confirmation.html'; ?>

  <script src="../ADMIN_JS/admin.js"></script>
</body>
</html>
