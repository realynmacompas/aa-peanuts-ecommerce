<?php
session_start();
header('Content-Type: application/json');
include '../PHP/aapeanutsdb.php';

if (!isset($_SESSION['user_id'])) {
    // not logged in -> empty list
    echo json_encode([]);
    exit();
}

$user_id = (int) $_SESSION['user_id'];

// Select from orders and LEFT JOIN products (to get product image if available)
$sql = "
  SELECT 
    o.order_id,
    o.product_name,
    o.quantity,
    o.price,
    o.product_total,
    o.shipping_fee,
    o.total_payment,
    o.payment_method,
    o.shipping_address,
    o.contact_no,
    o.status,
    o.date_ordered,
    p.image AS product_image
  FROM orders o
  LEFT JOIN products p ON p.name = o.product_name
  WHERE o.user_id = ?
  ORDER BY o.date_ordered DESC
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode([]);
    exit();
}
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();

$orders = [];
while ($row = $res->fetch_assoc()) {
    $orders[] = $row;
}

echo json_encode($orders);
$conn->close();
