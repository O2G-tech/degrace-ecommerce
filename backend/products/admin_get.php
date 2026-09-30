<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";
require_once "../helpers/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    response(false, "Only GET requests are allowed", null, 405);
}

requireAdmin();

try {
    $stmt = $pdo->query("
        SELECT
            p.id,
            p.category_id,
            p.name,
            p.slug,
            p.description,
            p.price,
            p.stock,
            p.image,
            p.status,
            p.created_at,
            c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        ORDER BY p.id DESC
    ");

    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    response(true, "Products loaded successfully", $products);

} catch (PDOException $e) {
    error_log("Admin Products Error: " . $e->getMessage());
    response(false, "Failed to load products", null, 500);
}
