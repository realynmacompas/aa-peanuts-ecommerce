<?php
session_start();
require_once "../PHP/aapeanutsdb.php";

// ✅ Restrict access
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
    header("Location: ../PHP/login.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    $price = (float)$_POST['price'];
    $description = trim($_POST['description']);

    // ✅ Handle image upload
    $image = null;
    if (!empty($_FILES['image']['name'])) {
        $targetDir = "../IMG/";
        $image = basename($_FILES['image']['name']);
        $targetFile = $targetDir . $image;
        move_uploaded_file($_FILES['image']['tmp_name'], $targetFile);
    }

    $stmt = $conn->prepare("INSERT INTO products (name, price, image, description) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sdss", $name, $price, $image, $description);

    if ($stmt->execute()) {
        header("Location: admin.php");
        exit();
    } else {
        echo "❌ Error: " . $stmt->error;
    }

    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
    $fileName = $_FILES['image']['name'];
    $fileTmp = $_FILES['image']['tmp_name'];
    $fileDest = 'uploads/' . basename($fileName);

    if (move_uploaded_file($fileTmp, $fileDest)) {
        echo "Image uploaded successfully!";
    } else {
        echo "Error uploading image.";
    }
}

}
?>

<!DOCTYPE html>
<html>
<head><title>Add Product</title></head>
<body>
    <h1>Add Product</h1>
    <form action="../ADMIN_PHP/add_product.php" method="POST" enctype="multipart/form-data">
    <label>Name:</label><br>
        <input type="text" name="name" required><br><br>

       <label>Price:</label><br>
            <div class="price-input">
             <span>₱</span>
             <input type="number" name="price" min="1" step="1" value="1" required>
            </div>
          <small id="formattedPrice">₱1.00</small>

       <label>Image:</label><br>
       <input type="file" name="image" accept="image/*" onchange="previewImage(event)"><br><br>
       <img id="imgPreview" src="#" alt="Preview" style="max-width: 200px; display: none;">
       

        <label>Description:</label><br>
        <textarea name="description"></textarea><br><br>

        <button type="submit">Save</button>
    </form>
    <a href="../ADMIN_PHP/admin.php">⬅ Back</a>
</body>
</html>
