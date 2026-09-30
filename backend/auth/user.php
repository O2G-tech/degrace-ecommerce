<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";
require_once "../helpers/auth.php";

$userId = requireLogin();

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

        WHERE id = ?

        LIMIT 1
    ");

    $stmt->execute([$userId]);

    $user = $stmt->fetch();

    if (!$user) {
        response(
            false,
            "User account not found",
            null,
            404
        );
    }

    response(
        true,
        "User loaded successfully",
        $user
    );

} catch (PDOException $e) {

    response(
        false,
        "Failed to load user",
        null,
        500
    );
}