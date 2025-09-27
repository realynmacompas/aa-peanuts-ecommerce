<?php
include '../PHP/aapeanutsdb.php';

if (isset($_POST['type']) && isset($_POST['value'])) {
    $type = $_POST['type'];
    $value = $_POST['value'];

    // Whitelist only allowed fields
    $allowedTypes = ['username', 'email'];

    if (in_array($type, $allowedTypes)) {
        $query = "SELECT * FROM users WHERE $type = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $value);
        $stmt->execute();
        $result = $stmt->get_result();

        echo $result->num_rows > 0 ? 'taken' : 'available';
    } else {
        echo 'invalid'; // if someone tries to send bad "type"
    }
}
?>
