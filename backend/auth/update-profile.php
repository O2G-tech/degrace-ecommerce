<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";
require_once "../config/database.php";

$userId = requireLogin();

if ($_SERVER["REQUEST_METHOD"] !== "PUT") {

    response(
        false,
        "Only PUT requests are allowed",
        null,
        405
    );
}

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$name = trim($data["name"] ?? "");
$phone = trim($data["phone"] ?? "");

if ($name === "") {

    response(
        false,
        "Name is required",
        null,
        400
    );
}

try {

    $stmt = $pdo->prepare("
        UPDATE users

        SET
            name = ?,
            phone = ?

        WHERE id = ?
    ");

    $stmt->execute([
        $name,
        $phone,
        $userId
    ]);

    response(
        true,
        "Profile updated successfully"
    );

} catch (PDOException $e) {

    response(
        false,
        "Failed to update profile",
        null,
        500
    );
}