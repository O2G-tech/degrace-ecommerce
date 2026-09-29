<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";

try {

    $stmt = $pdo->prepare("
        SELECT
            id,
            parent_id,
            name,
            slug,
            image,
            status
        FROM categories
        WHERE parent_id IS NULL
        AND status = 'active'
        ORDER BY name ASC
    ");

    $stmt->execute();

    $categories = $stmt->fetchAll();

    response(
        true,
        "Categories loaded successfully",
        $categories
    );

} catch (PDOException $e) {

    response(
        false,
        "Failed to load categories",
        null,
        500
    );
}