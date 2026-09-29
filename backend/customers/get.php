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
            u.id,
            u.name,
            u.email,
            u.phone,
            u.status,
            u.created_at,
            COUNT(o.id) AS order_count,
            COALESCE(SUM(CASE WHEN o.status != 'Cancelled' THEN o.total ELSE 0 END), 0) AS total_spent
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id
        WHERE u.role = 'customer'
        GROUP BY
            u.id,
            u.name,
            u.email,
            u.phone,
            u.status,
            u.created_at
        ORDER BY u.id DESC
    ");

    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    response(
        true,
        "Customers loaded successfully",
        $customers
    );

} catch (PDOException $e) {
    error_log("Customers Error: " . $e->getMessage());
    response(
        false,
        "Failed to load customers",
        null,
        500
    );
}
