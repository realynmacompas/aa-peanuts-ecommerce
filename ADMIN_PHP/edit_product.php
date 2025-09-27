<?php
session_start();
require_once "../PHP/aapeanutsdb.php";

// ✅ Restrict access
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
    header("Location: ../PHP/login.php");
    exit();
}

if (!isset($_GET['id'])) {
    die("❌ No product selected");
}
$id = (int)$_GET['id'];

// Fetch existing product
$product = $conn->query("SELECT * FROM products WHERE id = $id")->fetch_assoc();
if (!$product) die("❌ Product not found");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    $price = (float)$_POST['price'];
    $stock = (int)$_POST['stock'];
    $description = trim($_POST['description']);

    $image = $product['image']; // keep old image
    if (!empty($_FILES['image']['name'])) {
        $targetDir = "../IMG/";
        $image = basename($_FILES['image']['name']);
        $targetFile = $targetDir . $image;
        move_uploaded_file($_FILES['image']['tmp_name'], $targetFile);
    }

   $stmt = $conn->prepare("UPDATE products SET name=?, price=?, stock=?, image=?, description=? WHERE id=?");
$stmt->bind_param("sdssii", $name, $price, $stock, $image, $description, $id);

    if ($stmt->execute()) {
        header("Location: admin.php");
        exit();
    } else {
        echo "❌ Error: " . $stmt->error;
    }
}
?>

<!DOCTYPE html>
<html>
<head><title>Edit Product</title></head>
<body>
    <h1>Edit Product</h1>
    <form action="" method="POST" enctype="multipart/form-data">
        <label>Name:</label><br>
        <input type="text" name="name" value="<?= htmlspecialchars($product['name']) ?>" required><br><br>

        <label>Price:</label><br>
            <div class="price-input">
              <span>₱</span>
             <input type="number" name="price" min="1" step="1" value="<?= htmlspecialchars($product['price']) ?>" required>
            </div>
         <small id="formattedPrice">₱<?= number_format($product['price'], 2) ?></small>


          <label>Stock:</label><br>
        <input type="number" name="stock" min="0" value="<?= (int)$product['stock'] ?>" required><br><br>


       <label>Image:</label><br>
       <input type="file" name="image" accept="image/*" onchange="previewImage(event)"><br><br>
      <img id="imgPreview" src="../IMG/<?= htmlspecialchars($product['image']) ?>" 
     alt="Preview" style="max-width: 200px; <?= $product['image'] ? '' : 'display:none;' ?>">

        <label>Description:</label><br>
        <textarea name="description"><?= htmlspecialchars($product['description']) ?></textarea><br><br>

        <button type="submit">Update</button>
    </form>
    <a href="../ADMIN_PHP/admin.php">⬅ Back</a>

    

</body>
</html>
