<?php
session_start();
require_once "../aapeanuts.db.php"; // adjust path if needed

// Only admin access
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
    header("Location: ../login.php");
    exit();
}

// Fetch all users
$sql = "SELECT id, username, email, user_type, is_reseller_unlocked, total_items_bought, user_mode 
        FROM users ORDER BY id ASC";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Manage Users - Admin Panel</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
    th { background-color: #f2f2f2; }
    a.btn { padding: 5px 10px; border-radius: 5px; text-decoration: none; }
    .edit { background: #4CAF50; color: white; }
    .delete { background: #f44336; color: white; }
  </style>
</head>
<body>
  <h2>Manage Users</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Username</th>
        <th>Email</th>
        <th>User Type</th>
        <th>Unlocked Reseller</th>
        <th>Total Bought</th>
        <th>User Mode</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php if ($result->num_rows > 0): ?>
        <?php while($row = $result->fetch_assoc()): ?>
          <tr>
            <td><?= $row['id'] ?></td>
            <td><?= htmlspecialchars($row['username']) ?></td>
            <td><?= htmlspecialchars($row['email']) ?></td>
            <td><?= ucfirst($row['user_type']) ?></td>
            <td><?= $row['is_reseller_unlocked'] ? "Yes" : "No" ?></td>
            <td><?= $row['total_items_bought'] ?></td>
            <td><?= ucfirst($row['user_mode']) ?></td>
            <td>
              <a href="edit_user.php?id=<?= $row['id'] ?>" class="btn edit">Edit</a>
              <a href="delete_user.php?id=<?= $row['id'] ?>" class="btn delete" onclick="return confirm('Are you sure?');">Delete</a>
            </td>
          </tr>
        <?php endwhile; ?>
      <?php else: ?>
        <tr><td colspan="8">No users found</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</body>
</html>
