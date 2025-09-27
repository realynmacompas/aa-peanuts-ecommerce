<?php
session_start();
include '../PHP/aapeanutsdb.php';
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "User not logged in"]);
    exit;
}


$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "No data received"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$product_name = $data['product_name'];
$quantity = (int)$data['quantity'];
$price = (float)$data['price'];
$product_total = (float)$data['product_total'];
$shipping_fee = (float)$data['shipping_fee'];
$total_payment = (float)$data['total_payment'];
$product_image = $data['product_image'];
$address = $data['address'];
$contact = $data['contact'];
$payment_method = $data['payment_method'];
$cart_id = isset($data['cart_id']) ? intval($data['cart_id']) : 0;

// Insert into orders table
$stmt = $conn->prepare("INSERT INTO orders 
(user_id, product_name, quantity, price, product_total, shipping_fee, total_payment, product_image, shipping_address, contact_no, payment_method, status) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')");

if ($stmt === false) {
    echo json_encode(["success" => false, "error" => $conn->error]);
    exit;
}

$stmt->bind_param("isidddsssss", $user_id, $product_name, $quantity, $price, $product_total, $shipping_fee, $total_payment, $product_image, $address, $contact, $payment_method);

if ($stmt->execute()) {
    $order_id = $stmt->insert_id;


    // ✅ Update user's total_items_bought
    $update = $conn->prepare("UPDATE users SET total_items_bought = total_items_bought + ? WHERE id = ?");
    if ($update) {
        $update->bind_param("ii", $quantity, $user_id);
        $update->execute();
        $update->close();
    }

    // If this order came from a cart row, delete the cart row (safely)
    if ($cart_id > 0) {
        $del = $conn->prepare("DELETE FROM cart WHERE cart_id = ? AND user_id = ?");
        if ($del) {
            $del->bind_param("ii", $cart_id, $user_id);
            $del->execute();
            $del->close();
        }
    }

    echo json_encode(["success" => true, "order_id" => $order_id]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}
$stmt->close();
$conn->close();
?>
