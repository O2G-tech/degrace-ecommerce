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

$email = trim($data["email"] ?? "");

if ($email === "") {

    response(
        false,
        "Email is required",
        null,
        400
    );
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    response(
        false,
        "Invalid email address",
        null,
        400
    );
}

try {

    $stmt = $pdo->prepare("
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
    ");

    $stmt->execute([$email]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    /*
     * Don't reveal whether an email
     * exists in a production application.
     */

    if (!$user) {

        response(
            true,
            "If the email exists, a reset link will be sent"
        );
    }

    $token = bin2hex(
        random_bytes(32)
    );

    $hashedToken = hash(
        "sha256",
        $token
    );

    $expires = date(
        "Y-m-d H:i:s",
        time() + 3600
    );

    $update = $pdo->prepare("
        UPDATE users

        SET
            reset_token = ?,
            reset_token_expires = ?

        WHERE id = ?
    ");

    $update->execute([
        $hashedToken,
        $expires,
        $user["id"]
    ]);

    /*
     * DEVELOPMENT ONLY
     *
     * In production this token should
     * be sent to the customer's email.
     */

    response(
        true,
        "Password reset token generated",
        [
            "reset_token" => $token
        ]
    );

} catch (PDOException $e) {

    error_log(
        "Forgot password error: " .
        $e->getMessage()
    );

    response(
        false,
        "Unable to process password reset",
        null,
        500
    );
}