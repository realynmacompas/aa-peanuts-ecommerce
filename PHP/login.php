<?php
session_start();
include '../PHP/aapeanutsdb.php';


$email = $_POST['email'];
$password = $_POST['password'];


$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();


if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user ['password'])) {
        $_SESSION['user_id'] = $user['id'];
         $_SESSION['username'] = $user['username']; // store username
        $_SESSION['email'] = $user['email'];       // store email
          $_SESSION['user_type'] = $user['user_type']; // admin / regular / reseller

        // Return the type so JS can redirect properly
        echo $user['user_type'];
        exit;
    }
}
echo "invalid";
exit;
?>
