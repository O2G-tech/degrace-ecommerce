<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    response(false, "Only GET requests are allowed", null, 405);
}

try {

    $stmt = $pdo->query("
        SELECT
            p.*,
            o.order_number,
            o.full_name
        FROM payments p
        LEFT JOIN orders o
            ON o.id = p.order_id
        ORDER BY p.id DESC
    ");

    $payments =
        $stmt->fetchAll(PDO::FETCH_ASSOC);

    response(
        true,
        "Payments loaded successfully",
        $payments
    );

} catch (PDOException $e) {

    error_log(
        "Payments Error: " .
        $e->getMessage()
    );

    response(
        false,
        "Failed to load payments",
        null,
        500
    );
}