<?php
include '../PHP/aapeanutsdb.php';
header("Content-Type: application/json");

$id = $_POST['id'] ?? 0;
if ($id > 0) {
    $stmt = $conn->prepare("DELETE FROM products WHERE id=?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "error" => "Invalid ID"]);
}
$conn->close();
?>
