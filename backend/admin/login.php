<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";
require_once "../helpers/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    response(false, "Only POST requests are allowed", null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data && !empty($_POST)) {
    $data = $_POST;
}

$email    = trim($data["email"]    ?? "");
$password =       $data["password"] ?? "";

if ($email === "" || $password === "") {
    response(false, "Email and password are required", null, 422);
}

// Ensure user_tokens table exists
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS user_tokens (
            id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id    INT NOT NULL,
            token      VARCHAR(128) NOT NULL UNIQUE,
            expires_at DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_token (token),
            INDEX idx_user  (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
} catch (Exception $e) { /* ignore */ }

try {
    $stmt = $pdo->prepare("
        SELECT id, name, email, phone, password, role, status
        FROM users
        WHERE email = ?
        LIMIT 1
    ");

    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        response(false, "Invalid administrator credentials", null, 401);
    }

    if (!password_verify($password, $user["password"])) {
        response(false, "Invalid administrator credentials", null, 401);
    }

    if ($user["role"] !== "admin") {
        response(false, "Access denied. You do not have administrator privileges.", null, 403);
    }

    if (isset($user["status"]) && $user["status"] === "inactive") {
        response(false, "Administrator account is deactivated.", null, 403);
    }

    unset($user["password"]);

    // Generate a secure random token stored in DB
    $token = bin2hex(random_bytes(32));

    // Remove old tokens for this user
    $pdo->prepare("DELETE FROM user_tokens WHERE user_id = ?")->execute([$user["id"]]);

    // Insert new token — expires in 30 days
    $stmt = $pdo->prepare("
        INSERT INTO user_tokens (user_id, token, expires_at)
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))
    ");
    $stmt->execute([$user["id"], $token]);

    response(
        true,
        "Admin login successful",
        [
            "user"       => $user,
            "token"      => $token,
            "session_id" => $token
        ]
    );

} catch (PDOException $e) {
    error_log("Admin Login Error: " . $e->getMessage());
    response(false, "Server error while logging in: " . $e->getMessage(), null, 500);
}
