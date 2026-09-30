<?php
require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";
require_once "../helpers/auth.php";

// Delete the DB token so it can no longer be used
$token = _getTokenFromRequest();
if ($token && $pdo) {
    try {
        $pdo->prepare("DELETE FROM user_tokens WHERE token = ?")->execute([$token]);
    } catch (Exception $e) { /* ignore */ }
}

response(true, "Logout successful");