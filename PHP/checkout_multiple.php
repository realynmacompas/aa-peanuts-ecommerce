<?php
session_start();
include '../PHP/aapeanutsdb.php';

// Ensure user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "User not logged in"]);
    exit;
}

$user_id = $_SESSION['user_id']; // ✅ define this
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['cart_ids']) || empty($data['cart_ids'])) {
    echo json_encode(["success" => false, "error" => "No items selected"]);
    exit;
}

$cart_ids = $data['cart_ids'];
$ids_placeholder = implode(',', array_fill(0, count($cart_ids), '?'));
$sql = "SELECT * FROM cart WHERE cart_id IN ($ids_placeholder) AND user_id = ?";
$stmt = $conn->prepare($sql);

$types = str_repeat('i', count($cart_ids)) . 'i'; 
$params = array_merge($cart_ids, [$user_id]);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}

if (empty($items)) {
    echo json_encode(["success" => false, "error" => "No matching items in cart"]);
    exit;
}

$conn->begin_transaction();
try {
    $order_sql = "INSERT INTO orders 
        (user_id, product_name, quantity, price, product_total, shipping_fee, total_payment, payment_method, shipping_address, contact_no, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'COD', 'To be filled', '00000000000', 'Pending')";
    $order_stmt = $conn->prepare($order_sql);

    foreach ($items as $item) {
        $order_stmt->bind_param(
            "isidddd",
            $user_id,
            $item['product_name'],
            $item['quantity'],
            $item['price'],
            $item['product_total'],
            $item['shipping_fee'],
            $item['total_payment']
        );
        $order_stmt->execute();
    }

    // Delete selected items from cart
    $delete_sql = "DELETE FROM cart WHERE cart_id IN ($ids_placeholder) AND user_id = ?";
    $delete_stmt = $conn->prepare($delete_sql);
    $delete_stmt->bind_param($types, ...$params);
    $delete_stmt->execute();

    $conn->commit();
    echo json_encode(["success" => true]);
    exit; // ✅ stop here
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
    exit;
}
?>
