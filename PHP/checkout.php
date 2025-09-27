<?php
session_start();
include '../PHP/aapeanutsdb.php';

// Require login
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$user_id = $_SESSION['user_id'];
$cart_id = isset($_GET['cart_id']) ? intval($_GET['cart_id']) : 0;
$item = null;

if ($cart_id > 0) {
    // Fetch the cart row directly (cart table has product_name, price, product_image, quantity)
    $stmt = $conn->prepare("
        SELECT cart_id, product_name, quantity, price, product_total, shipping_fee, total_payment, product_image
        FROM cart
        WHERE cart_id = ? AND user_id = ?
        LIMIT 1
    ");
    if ($stmt) {
        $stmt->bind_param("ii", $cart_id, $user_id);
        $stmt->execute();
        $res = $stmt->get_result();
        $item = $res->fetch_assoc();
        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Checkout</title>
  <link rel="stylesheet" href="../CSS/product.css">
  <style>
    /* small safe styles so layout is usable immediately */
    .checkout-item { max-width:720px; margin:24px auto; border:1px solid #eee; padding:16px; border-radius:8px; display:flex; gap:16px; align-items:flex-start; }
    .checkout-img { width:70px; height:70px; object-fit:cover; border-radius:8px; }
  </style>
</head>
<body>
  <h1>Checkout</h1>

  <?php if ($item): 
      // fallback for image
      $img = !empty($item['product_image']) ? $item['product_image'] : '../IMG/Founder.jpg';
  ?>
    <div class="checkout-item">
      <img src="<?php echo htmlspecialchars($img); ?>" alt="<?php echo htmlspecialchars($item['product_name']); ?>" class="checkout-img" onerror="this.src='../IMG/Founder.jpg'">
      <div>
        <h2><?php echo htmlspecialchars($item['product_name']); ?></h2>
        <p>Unit Price: ₱<?php echo number_format($item['price'], 2); ?></p>
        <p>Quantity: <?php echo (int)$item['quantity']; ?></p>
        <p>Subtotal: ₱<?php echo number_format($item['price'] * $item['quantity'], 2); ?></p>
        <p>Shipping: ₱<?php echo number_format($item['shipping_fee'], 2); ?></p>
        <p><strong>Total: ₱<?php echo number_format($item['total_payment'], 2); ?></strong></p>

        <!-- If you want to collect address/payment here, add inputs and POST them to place_order.php -->
        <form method="POST" action="../PHP/place_order.php">
          <input type="hidden" name="cart_id" value="<?php echo (int)$item['cart_id']; ?>">
          <button type="submit">Confirm Order</button>
        </form>
      </div>
    </div>
  <?php else: ?>
    <p>Item not found.</p>
  <?php endif; ?>
</body>
</html>
