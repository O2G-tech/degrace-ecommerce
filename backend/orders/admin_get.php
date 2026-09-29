<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    response(false, "Only GET requests are allowed", null, 405);
}

requireAdmin();

$status = trim($_GET["status"] ?? "all");
$search = trim($_GET["search"] ?? "");

$where = ["1=1"];
$params = [];

if ($status !== "all" && !empty($status)) {
    $where[] = "o.status = ?";
    $params[] = $status;
}

if ($search !== "") {
    $where[] = "(o.order_number LIKE ? OR o.full_name LIKE ? OR o.email LIKE ? OR o.phone LIKE ?)";
    $wildcard = "%" . $search . "%";
    $params[] = $wildcard;
    $params[] = $wildcard;
    $params[] = $wildcard;
    $params[] = $wildcard;
}

$whereClause = implode(" AND ", $where);

try {
    $sql = "
        SELECT
            o.id,
            o.order_number,
            o.user_id,
            o.full_name,
            o.phone,
            o.email,
            o.address,
            o.city,
            o.state,
            o.postal_code,
            o.delivery_method,
            o.subtotal,
            o.delivery_fee,
            o.total,
            o.payment_method,
            o.payment_status,
            o.status,
            o.created_at,
            COUNT(oi.id) AS items_count
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE $whereClause
        GROUP BY
            o.id, o.order_number, o.user_id, o.full_name, o.phone, o.email,
            o.address, o.city, o.state, o.postal_code, o.delivery_method,
            o.subtotal, o.delivery_fee, o.total, o.payment_method,
            o.payment_status, o.status, o.created_at
        ORDER BY o.id DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    response(
        true,
        "Orders loaded successfully",
        $orders
    );

} catch (PDOException $e) {
    error_log("Admin Orders Error: " . $e->getMessage());
    response(
        false,
        "Failed to load orders",
        null,
        500
    );
}
