<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    response(
        false,
        "Only POST requests are allowed",
        null,
        405
    );
}

$input = file_get_contents("php://input");

$data = json_decode($input, true);

if (!is_array($data)) {

    response(
        false,
        "Invalid JSON request",
        null,
        400
    );
}

$token = trim($data["token"] ?? "");

$password = $data["password"] ?? "";

$confirmPassword =
    $data["confirm_password"] ?? "";

if (
    $token === "" ||
    $password === "" ||
    $confirmPassword === ""
) {

    response(
        false,
        "All fields are required",
        null,
        400
    );
}

if (strlen($password) < 6) {

    response(
        false,
        "Password must contain at least 6 characters",
        null,
        400
    );
}

if ($password !== $confirmPassword) {

    response(
        false,
        "Passwords do not match",
        null,
        400
    );
}

try {

    $hashedToken = hash(
        "sha256",
        $token
    );

    $stmt = $pdo->prepare("
        SELECT id

        FROM users

        WHERE reset_token = ?

        AND reset_token_expires IS NOT NULL

        AND reset_token_expires > NOW()

        LIMIT 1
    ");

    $stmt->execute([
        $hashedToken
    ]);

    $user = $stmt->fetch(
        PDO::FETCH_ASSOC
    );

    if (!$user) {

        response(
            false,
            "Invalid or expired reset token",
            null,
            400
        );
    }

    $hashedPassword = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    $update = $pdo->prepare("
        UPDATE users

        SET
            password = ?,
            reset_token = NULL,
            reset_token_expires = NULL

        WHERE id = ?
    ");

    $update->execute([
        $hashedPassword,
        $user["id"]
    ]);

    response(
        true,
        "Password reset successfully"
    );

} catch (PDOException $e) {

    error_log(
        "Reset password error: " .
        $e->getMessage()
    );

    response(
        false,
        "Password reset failed",
        null,
        500
    );
}