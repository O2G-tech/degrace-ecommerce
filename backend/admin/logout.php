<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";
require_once "../helpers/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST" && $_SERVER["REQUEST_METHOD"] !== "GET") {
    response(false, "Only GET or POST requests are allowed", null, 405);
}

// Delete the DB token
$token = _getTokenFromRequest();
if ($token && $pdo) {
    try {
        $pdo->prepare("DELETE FROM user_tokens WHERE token = ?")->execute([$token]);
    } catch (Exception $e) { /* ignore */ }
}

response(true, "Admin logged out successfully");
