<?php
session_start();
include '../PHP/aapeanutsdb.php';

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['id'])) {
    $cart_id = intval($_POST['id']);
    $user_id = $_SESSION['user_id'] ?? 0;

    if ($user_id > 0) {
        $stmt = $conn->prepare("DELETE FROM cart WHERE cart_id = ? AND user_id = ?");
        $stmt->bind_param("ii", $cart_id, $user_id);

        if ($stmt->execute()) {
            echo "Item removed from cart.";
        } else {
            echo "Error removing item.";
        }

        $stmt->close();
    } else {
        echo "Unauthorized request.";
    }
} else {
    echo "Invalid request.";
}

$conn->close();
?>
