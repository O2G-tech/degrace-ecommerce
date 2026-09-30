<?php
require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    response(false, "Only POST requests are allowed", null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);

$email    = trim($data["email"]    ?? "");
$password =       $data["password"] ?? "";

if ($email === "" || $password === "") {
    response(false, "Email and password are required", null, 400);
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
} catch (Exception $e) {
    // Table might already exist — ignore
}

try {
    $stmt = $pdo->prepare("
        SELECT id, name, email, phone, password, role, status
        FROM users
        WHERE email = ?
        LIMIT 1
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        response(false, "Invalid email or password", null, 401);
    }

    if ($user["status"] !== "active") {
        response(false, "Your account has been blocked", null, 403);
    }

    if (!password_verify($password, $user["password"])) {
        response(false, "Invalid email or password", null, 401);
    }

    // Generate a secure random token
    $token = bin2hex(random_bytes(32)); // 64-char hex token

    // Remove old tokens for this user (keep DB tidy)
    $pdo->prepare("DELETE FROM user_tokens WHERE user_id = ?")->execute([$user["id"]]);

    // Insert new token — expires in 30 days
    $stmt = $pdo->prepare("
        INSERT INTO user_tokens (user_id, token, expires_at)
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))
    ");
    $stmt->execute([$user["id"], $token]);

    unset($user["password"]);

    response(true, "Login successful", [
        "user"       => $user,
        "token"      => $token,
        "session_id" => $token   // kept for backwards compatibility
    ]);

} catch (PDOException $e) {
    response(false, "Login failed: " . $e->getMessage(), null, 500);
}