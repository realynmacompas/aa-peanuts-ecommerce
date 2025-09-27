<?php
session_start();
include '../PHP/aapeanutsdb.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username']; // changed $name to $username
    $email = $_POST['email'];
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
   

    // Check if username or email already exists
    $check_query = "SELECT * FROM users WHERE username = ? OR email = ?";
    $stmt = $conn->prepare($check_query);
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $_SESSION['signup_error'] = "Email or username already exists.";
        header("Location: ../PAGES/login.html");
        exit();        
    }


    //PASSWORD REQUIREMENTS

$password = $_POST['password'];

if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/', $password)) {
    die("Password does not meet the security requirements.");
}



if ($password !== $confirm_password) {
    $_SESSION['signup_error'] = "Passwords do not match.";
    header("Location: ../PAGES/login.html");
    exit();
}

if (!preg_match("/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|ph)$/", $email)) {
    $_SESSION['signup_error'] = "Invalid email format. Must end with .com, .net, .org, etc.";
    echo "email_invalid";
    exit();
}


        // Insert new user
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $insert_query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($insert_query);
        $stmt->bind_param("sss", $username, $email, $hashedPassword);

       // header("Location: ../PAGES/login.html?signup=success");

       if ($stmt->execute()) {
        $_SESSION['signup_success'] = "Signup successful! Please log in.";
        header("Location: ../PAGES/login.html?signup=success");

    } else {
        $_SESSION['signup_error'] = "Database error. Please try again.";
        header("Location: ../PAGES/signup.php");
    }

        exit();

        
    
}
?>

