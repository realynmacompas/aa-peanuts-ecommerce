<?php
include '../PHP/aapeanutsdb.php';
header("Content-Type: application/json");

$id = $_POST['id'] ?? '';
$name = $_POST['name'] ?? '';
$price = $_POST['price'] ?? 0;
$stock = $_POST['stock'] ?? 0;

$image = '';
if (!empty($_FILES['image']['name'])) {
    $targetDir = "../IMG/";
    $image = basename($_FILES['image']['name']);
    $targetFile = $targetDir . $image;
    move_uploaded_file($_FILES['image']['tmp_name'], $targetFile);
} else {
    // Keep old image if editing
    if (!empty($id)) {
        $old = $conn->query("SELECT image FROM products WHERE id=$id")->fetch_assoc();
        $image = $old['image'];
    }
}

$description = $_POST['description'] ?? '';

if ($id) {
    $stmt = $conn->prepare("UPDATE products SET name=?, price=?, stock=?, image=?, description=? WHERE id=?");
    $stmt->bind_param("sdissi", $name, $price, $stock, $image, $description, $id);
} else {
    $stmt = $conn->prepare("INSERT INTO products (name, price, stock, image, description) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sdiss", $name, $price, $stock, $image, $description);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}
$stmt->close();
$conn->close();
?>
