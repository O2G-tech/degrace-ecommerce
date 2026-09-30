<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    response(
        false,
        "Only POST requests are allowed",
        null,
        405
    );
}

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if ($email === "" || $password === "") {

    response(
        false,
        "Email and password are required",
        null,
        400
    );
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

    $user = $stmt->fetch();

    if (!$user) {

        response(
            false,
            "Invalid email or password",
            null,
            401
        );
    }

    if ($user["status"] !== "active") {

        response(
            false,
            "Your account has been blocked",
            null,
            403
        );
    }

    if (!password_verify(
        $password,
        $user["password"]
    )) {

        response(
            false,
            "Invalid email or password",
            null,
            401
        );
    }

    $_SESSION["user_id"] = $user["id"];
    $_SESSION["role"] = $user["role"];
    $_SESSION["user_name"] = $user["name"];
    $_SESSION["email"] = $user["email"];

    $token = session_id();

    unset($user["password"]);

    response(
        true,
        "Login successful",
        [
            "user" => $user,
            "token" => $token,
            "session_id" => $token
        ]
    );

} catch (PDOException $e) {

    response(
        false,
        "Login failed",
        null,
        500
    );
}