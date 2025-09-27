<?php
session_start();
header('Content-Type: application/json');
include '../PHP/aapeanutsdb.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Not logged in"]);
    exit();
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "Invalid JSON"]);
    exit();
}

$user_id = (int)$_SESSION['user_id'];
$product_name = $data['product_name'] ?? '';
$quantity = (int)($data['quantity'] ?? 0);
$price = (float)($data['price'] ?? 0);
$product_total = (float)($data['product_total'] ?? 0);
$shipping_fee = (float)($data['shipping_fee'] ?? 0);
$total_payment = (float)($data['total_payment'] ?? 0);
$product_image = $data['product_image'] ?? '';

$sql = "INSERT INTO cart (user_id, product_name, quantity, price, product_total, shipping_fee, total_payment, product_image) 
        VALUES (?,?,?,?,?,?,?,?)";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "error" => $conn->error]);
    exit();
}
$stmt->bind_param("isidddds", $user_id, $product_name, $quantity, $price, $product_total, $shipping_fee, $total_payment, $product_image);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}
