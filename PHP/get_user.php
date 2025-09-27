<?php
session_start();
include '../PHP/aapeanutsdb.php';

header('Content-Type: application/json');

if (!isset($_SESSION['username'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit();
}

echo json_encode([
    "username" => ucfirst($_SESSION['username']),
    "email" => $_SESSION['email'],
    "user_type" => ucfirst($_SESSION['user_type'])
]);
