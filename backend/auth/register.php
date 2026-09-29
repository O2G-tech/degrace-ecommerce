<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";

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

$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$phone = trim($data["phone"] ?? "");
$password = $data["password"] ?? "";
$confirmPassword = $data["confirm_password"] ?? "";

$errors = [];

if ($name === "") {
    $errors["name"] = "Full name is required";
} elseif (strlen($name) < 2 || strlen($name) > 100) {
    $errors["name"] = "Name must be between 2 and 100 characters";
} elseif (!preg_match("/^[\p{L}][\p{L}'\-]*(?: [\p{L}][\p{L}'\-]*)*$/u", $name)) {
    $errors["name"] = "Name can only contain letters, spaces, hyphens and apostrophes";
}

if ($email === "") {
    $errors["email"] = "Email is required";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors["email"] = "Please enter a valid email address";
} elseif (strlen($email) > 255) {
    $errors["email"] = "Email address is too long";
}

if ($phone !== "" && !preg_match("/^\+?[0-9]{7,15}$/", $phone)) {
    $errors["phone"] = "Please enter a valid phone number";
}

if ($password === "") {
    $errors["password"] = "Password is required";
} elseif (strlen($password) < 6) {
    $errors["password"] = "Password must contain at least 6 characters";
} elseif (strlen($password) > 72) {
    $errors["password"] = "Password must not exceed 72 characters";
}

if ($confirmPassword === "") {
    $errors["confirm_password"] = "Please confirm your password";
} elseif ($password !== "" && $password !== $confirmPassword) {
    $errors["confirm_password"] = "Passwords do not match";
}

if (!empty($errors)) {

    response(
        false,
        "Please fix the errors below",
        ["errors" => $errors],
        400
    );
}

try {

    $check = $pdo->prepare("
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
    ");

    $check->execute([$email]);

    if ($check->fetch()) {

        response(
            false,
            "Please fix the errors below",
            ["errors" => ["email" => "An account with this email already exists"]],
            409
        );
    }

    $hashedPassword = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    $stmt = $pdo->prepare("
        INSERT INTO users
        (
            name,
            email,
            phone,
            password,
            role,
            status
        )
        VALUES
        (?, ?, ?, ?, 'customer', 'active')
    ");

    $stmt->execute([
        $name,
        $email,
        $phone,
        $hashedPassword
    ]);

    response(
        true,
        "Registration successful",
        [
            "id" => $pdo->lastInsertId()
        ],
        201
    );

} catch (PDOException $e) {

    response(
        false,
        "Registration failed",
        null,
        500
    );
}