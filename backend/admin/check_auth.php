<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    response(false, "Only GET requests are allowed", null, 405);
}

$adminId = requireAdmin();

try {
    $stmt = $pdo->prepare("
        SELECT
            id,
            name,
            email,
            phone,
            role,
            status,
            created_at
        FROM users
        WHERE id = ? AND role = 'admin'
        LIMIT 1
    ");

    $stmt->execute([$adminId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        response(false, "Admin account not found", null, 404);
    }

    response(true, "Admin session is valid", [
        "user" => $user,
        "session_id" => session_id()
    ]);

} catch (PDOException $e) {
    error_log("Check Auth Error: " . $e->getMessage());
    response(false, "Server error verifying session", null, 500);
}
