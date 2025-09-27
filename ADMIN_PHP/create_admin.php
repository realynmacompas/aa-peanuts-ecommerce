<?php
include '../PHP/aapeanutsdb.php'; 

$username = "Alpha_Omega";
$email = "johnramienofuego826@gmail.com";
$raw_password = "MangekyouSharingan12oo3!";
$hashed_password = password_hash($raw_password, PASSWORD_DEFAULT);
$user_type = "admin";

// Check if email already exists (avoid duplicate)
$check = mysqli_query($conn, "SELECT * FROM users WHERE email = '$email'");
if (mysqli_num_rows($check) > 0) {
    echo "Admin already exists.";
} else {
    $sql = "INSERT INTO users (username, email, password, user_type) 
            VALUES ('$username', '$email', '$hashed_password', '$user_type')";

    if (mysqli_query($conn, $sql)) {
        echo "✅ Admin added securely.";
    } else {
        echo "❌ Error: " . mysqli_error($conn);
    }
}
?>
