<?php
include '../PHP/aapeanutsdb.php';
$result = $conn->query("SELECT * FROM products ORDER BY id ASC");
while ($p = $result->fetch_assoc()):
?>
<tr data-id="<?= $p['id'] ?>">
  <td><?= $p['id'] ?></td>
  <td><?= htmlspecialchars($p['name']) ?></td>
  <td>₱<?= number_format($p['price'], 2) ?></td>
  <td><?= (int)$p['stock'] ?></td>
  <td><img src="<?= $p['image'] ?>" alt="img" width="50"></td>
  <td><?= htmlspecialchars($p['description']) ?></td>
  <td>
     <div class="products-action-buttons">
      <button class="btn btn-edit" onclick="editProduct(<?= $p['id'] ?>)">Edit</button>
      <button class="btn btn-delete" onclick="deleteProduct(<?= $p['id'] ?>)">Delete</button>
     </div>
</td>
</tr>
<?php endwhile; ?>
