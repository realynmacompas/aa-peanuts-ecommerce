<?php
session_start();
header('Content-Type: application/json');
include '../PHP/aapeanutsdb.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: ../PAGES/login.html"); 
    exit();
}

$user_id = (int)$_SESSION['user_id'];

$sql = "SELECT * FROM cart WHERE user_id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode([]);
    exit();
}
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();

$items = [];
while ($row = $res->fetch_assoc()) {
    $items[] = $row;
}

echo json_encode($items);
