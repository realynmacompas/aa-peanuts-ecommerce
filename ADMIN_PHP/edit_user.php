<?php
session_start();
require_once "../aapeanuts.db.php";

// Admin only
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
    header("Location: ../login.php");
    exit();
}

if (!isset($_GET['id'])) {
    die("User ID is required.");
}

$id = intval($_GET['id']);
$sql = "SELECT * FROM users WHERE id = $id";
$result = $conn->query($sql);

if ($result->num_rows == 0) {
    die("User not found.");
}

$user = $result->fetch_assoc();

// Update logic
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_type = $_POST['user_type'];
    $is_reseller_unlocked = isset($_POST['is_reseller_unlocked']) ? 1 : 0;
    $user_mode = $_POST['user_mode'];

    $update = "UPDATE users 
               SET user_type='$user_type', is_reseller_unlocked='$is_reseller_unlocked', user_mode='$user_mode' 
               WHERE id=$id";
    if ($conn->query($update)) {
        header("Location: manage_users.php");
        exit();
    } else {
        echo "Error: " . $conn->error;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Edit User</title>
</head>
<body>
  <h2>Edit User - <?= htmlspecialchars($user['username']) ?></h2>
  <form method="post">
    <label>User Type:</label>
    <select name="user_type">
      <option value="regular" <?= $user['user_type']=='regular'?'selected':'' ?>>Regular</option>
      <option value="reseller" <?= $user['user_type']=='reseller'?'selected':'' ?>>Reseller</option>
      <option value="admin" <?= $user['user_type']=='admin'?'selected':'' ?>>Admin</option>
    </select><br><br>

    <label>Unlock Reseller:</label>
    <input type="checkbox" name="is_reseller_unlocked" <?= $user['is_reseller_unlocked'] ? 'checked' : '' ?>><br><br>

    <label>User Mode:</label>
    <select name="user_mode">
      <option value="regular" <?= $user['user_mode']=='regular'?'selected':'' ?>>Regular</option>
      <option value="reseller" <?= $user['user_mode']=='reseller'?'selected':'' ?>>Reseller</option>
    </select><br><br>

    <button type="submit">Update User</button>
  </form>
</body>
</html>
