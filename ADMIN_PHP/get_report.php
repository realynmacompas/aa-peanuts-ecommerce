<?php
require_once "../PHP/aapeanutsdb.php";



$type = $_GET['type'] ?? '';

function e($str) {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

switch ($type) {

case "sales":
    $range = $_GET['range'] ?? 'today';

    echo "<h3>📊 Sales Report</h3>";
    echo "<div class='sales-filters'>
            <button class='sales-btn ".($range=='today'?'active':'')."' data-range='today'>Today</button>
            <button class='sales-btn ".($range=='week'?'active':'')."' data-range='week'>This Week</button>
            <button class='sales-btn ".($range=='month'?'active':'')."' data-range='month'>This Month</button>
          </div>";

    // --- TODAY ---
    if ($range == "today") {

       $today = $conn->query("SELECT CURDATE() as d")->fetch_assoc()['d'];

        $res = $conn->query("
            SELECT order_id, username, product_name, quantity, total_payment, date_ordered
            FROM orders o
            LEFT JOIN users u ON o.user_id=u.id
            WHERE DATE(date_ordered)=CURDATE()
            ORDER BY date_ordered DESC
        ");

        $total = 0;
        echo "<h4>Date: {$today}</h4>";
        echo "<table class='report-table'>
                <tr class='green-header'>
                  <th>Order ID</th><th>Customer</th><th>Product</th>
                  <th>Qty</th><th>Total</th><th>Date</th>
                </tr>";

        while ($r = $res->fetch_assoc()) {
            $total += (float)$r['total_payment'];
            echo "<tr>
                    <td>".e($r['order_id'])."</td>
                    <td>".e($r['username'])."</td>
                    <td>".e($r['product_name'])."</td>
                    <td>".e($r['quantity'])."</td>
                    <td>₱".number_format($r['total_payment'],2)."</td>
                    <td>".e($r['date_ordered'])."</td>
                  </tr>";
        }

        // Last extra row shows TOTAL and the date boundary (today) as requested
        echo "<tr class='total-row'>
                <td colspan='4'><strong>TOTAL</strong></td>
                <td><strong>₱".number_format($total,2)."</strong></td>
                <td><strong>{$today}</strong></td>
              </tr>";
        echo "</table>";
    }

    // --- WEEK (last 7 days) ---
    elseif ($range == "week") {
        // Build last 7 days array (today first)
    
$today = $conn->query("SELECT CURDATE() as d")->fetch_assoc()['d'];

// Build last 7 days array starting from today (MySQL-based)
$days = [];
for ($i = 0; $i < 7; $i++) {
    $resDay = $conn->query("SELECT DATE_SUB('{$today}', INTERVAL {$i} DAY) as d")->fetch_assoc()['d'];
    $days[$resDay] = ['orders' => 0, 'sales' => 0];
}

// Define start and end from MySQL too
$start = $conn->query("SELECT DATE_SUB('{$today}', INTERVAL 6 DAY) as d")->fetch_assoc()['d'];
$end   = $today;


        $res = $conn->query("
            SELECT DATE(date_ordered) as d, COUNT(*) as orders, SUM(total_payment) as sales
            FROM orders
            WHERE DATE(date_ordered) BETWEEN '{$start}' AND '{$end}'
            GROUP BY DATE(date_ordered)
        ");

        while ($r = $res->fetch_assoc()) {
            $d = $r['d'];
            if (isset($days[$d])) {
                $days[$d] = ['orders' => (int)$r['orders'], 'sales' => (float)$r['sales']];
            }
        }

        echo "<table class='report-table'>
                <tr class='green-header'><th>Date</th><th>Total Orders</th><th>Total Sales</th></tr>";

        // Display days with today at top (iteration order preserves table order inserted above)
        foreach ($days as $d => $val) {
            $salesFormatted = number_format($val['sales'], 2);
            echo "<tr>
                    <td>".e($d)."</td>
                    <td>".e($val['orders'])."</td>
                    <td class='gold'>₱{$salesFormatted}</td>
                  </tr>";
        }

        // Optionally add grand totals for the week (sum)
        $weekOrders = 0; $weekSales = 0.0;
        foreach ($days as $val) { $weekOrders += $val['orders']; $weekSales += $val['sales']; }
        echo "<tr class='total-row'>
                <td><strong>WEEK TOTAL</strong></td>
                <td><strong>".e($weekOrders)."</strong></td>
                <td class='gold'><strong>₱".number_format($weekSales,2)."</strong></td>
              </tr>";

        echo "</table>";
    }

    // --- MONTH ---
elseif ($range == "month") {
    $res = $conn->query("
        SELECT DATE(date_ordered) as d, SUM(total_payment) as sales
        FROM orders
        WHERE YEAR(date_ordered) = YEAR(CURDATE())
          AND MONTH(date_ordered) = MONTH(CURDATE())
        GROUP BY DATE(date_ordered)
        ORDER BY d ASC
    ");

    // Initialize first
    $labels = [];
    $values = [];

    while ($r = $res->fetch_assoc()) {
        $labels[] = $r['d'];  
        $values[] = (float)$r['sales'];
    }

    if (count($labels) === 0) {
        echo "<p>No sales this month.</p>";
    } else {
        echo "<canvas id='salesChart'></canvas>";
        echo "<script src='https://cdn.jsdelivr.net/npm/chart.js'></script>";
        echo "<script>
          (function(){
            const ctx = document.getElementById('salesChart').getContext('2d');
            new Chart(ctx, {
              type: 'bar',
              data: {
                labels: " . json_encode($labels) . ",
                datasets: [{
                  label: 'Daily Sales',
                  data: " . json_encode($values) . ",
                  backgroundColor: 'rgba(40, 153, 40, 0.8)'
                }]
              },
              options: { 
                responsive: true, 
                plugins:{legend:{display:true}} 
              }
            });
          })();
        </script>";
    }
}


    break;


case "users":
    // sanitize filter
    $filter = $_GET['filter'] ?? 'all';
    $allowed = ['all','regular','reseller','admin'];
    if (!in_array($filter, $allowed)) $filter = 'all';

    $total = $conn->query("SELECT COUNT(*) as c FROM users")->fetch_assoc()['c'];
    $regular = $conn->query("SELECT COUNT(*) as c FROM users WHERE user_type='regular'")->fetch_assoc()['c'];
    $resellers = $conn->query("SELECT COUNT(*) as c FROM users WHERE user_type='reseller'")->fetch_assoc()['c'];
    $admins = $conn->query("SELECT COUNT(*) as c FROM users WHERE user_type='admin'")->fetch_assoc()['c'];

    echo "<h3>👥 User Report</h3>";
    echo "<div class='user-cards'>
            <div class='user-card total ".($filter=='all'?'active':'')."' data-filter='all'><h2>Total Users</h2><p>$total</p></div>
            <div class='user-card regular ".($filter=='regular'?'active':'')."' data-filter='regular'><h2>Regular</h2><p>$regular</p></div>
            <div class='user-card reseller ".($filter=='reseller'?'active':'')."' data-filter='reseller'><h2>Resellers</h2><p>$resellers</p></div>
            <div class='user-card admin ".($filter=='admin'?'active':'')."' data-filter='admin'><h2>Admins</h2><p>$admins</p></div>
          </div>";

    $where = ($filter === 'all') ? "" : "WHERE user_type = '".$conn->real_escape_string($filter)."'";
    $res = $conn->query("SELECT id, username, email, user_type FROM users {$where} ORDER BY id ASC");

    echo "<table class='report-table'>
            <tr class='green-header'><th>ID</th><th>Name</th><th>Email</th><th>Type</th></tr>";
    while ($r = $res->fetch_assoc()) {
        echo "<tr>
                <td>".e($r['id'])."</td>
                <td>".e($r['username'])."</td>
                <td>".e($r['email'])."</td>
                <td>".e(ucfirst($r['user_type']))."</td>
              </tr>";
    }
    echo "</table>";
    break;


case "inventory":
    $res = $conn->query("SELECT name, stock FROM products ORDER BY name ASC");
    echo "<h3>📦 Inventory Report</h3>";
    echo "<table class='report-table'><tr><th>Product</th><th>Stock</th><th>Status</th></tr>";
    while ($r = $res->fetch_assoc()) {
        $status = $r['stock'] > 50 ? "✅ In Stock" : ($r['stock'] > 0 ? "⚠ Low" : "❌ Out");
        echo "<tr><td>".e($r['name'])."</td><td>".e($r['stock'])."</td><td>$status</td></tr>";
    }
    echo "</table>";
    break;

default:
    echo "<p>No report selected.</p>";
    break;
}

?>
