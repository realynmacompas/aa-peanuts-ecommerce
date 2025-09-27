<?php
session_start();
require_once "../aapeanuts.db.php";

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
    header("Location: ../login.php");
    exit();
}

if (!isset($_GET['id'])) {
    die("User ID is required.");
}

$id = intval($_GET['id']);
$conn->query("DELETE FROM users WHERE id=$id");

header("Location: manage_users.php");
exit();
