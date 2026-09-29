<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    response(false, "Only POST requests are allowed", null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data && !empty($_POST)) {
    $data = $_POST;
}

$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if ($email === "" || $password === "") {
    response(false, "Email and password are required", null, 422);
}

try {
    $stmt = $pdo->prepare("
        SELECT
            id,
            name,
            email,
            phone,
            password,
            role,
            status
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

    $_SESSION["user_id"] = $user["id"];
    $_SESSION["role"] = $user["role"];
    $_SESSION["user_name"] = $user["name"];
    $_SESSION["email"] = $user["email"];

    $sessionId = session_id();

    response(
        true,
        "Admin login successful",
        [
            "user" => $user,
            "token" => $sessionId,
            "session_id" => $sessionId
        ]
    );

} catch (PDOException $e) {
    error_log("Admin Login Error: " . $e->getMessage());
    response(false, "Server error while logging in", null, 500);
}
