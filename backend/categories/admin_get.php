<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    response(false, "Only GET requests are allowed", null, 405);
}

requireAdmin();

try {
    $stmt = $pdo->query("
        SELECT
            c.id,
            c.parent_id,
            c.name,
            c.slug,
            c.image,
            c.status,
            c.created_at,
            parent.name AS parent_name,
            (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
        FROM categories c
        LEFT JOIN categories parent ON parent.id = c.parent_id
        ORDER BY
            COALESCE(parent.name, c.name) ASC,
            c.parent_id IS NOT NULL ASC,
            c.name ASC
    ");

    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    response(true, "Categories loaded successfully", $categories);

} catch (PDOException $e) {
    error_log("Admin Categories Error: " . $e->getMessage());
    response(false, "Failed to load categories", null, 500);
}
