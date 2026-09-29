<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    response(false, "Only GET requests are allowed", null, 405);
}

$userId = requireLogin();
$isAdmin = isset($_SESSION["role"]) && $_SESSION["role"] === "admin";

$orderId = isset($_GET["id"]) ? (int) $_GET["id"] : 0;

if ($orderId <= 0) {
    response(false, "Invalid order ID", null, 400);
}

try {
    if ($isAdmin) {
        $orderStmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? LIMIT 1");
        $orderStmt->execute([$orderId]);
    } else {
        $orderStmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1");
        $orderStmt->execute([$orderId, $userId]);
    }

    $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        response(false, "Order not found", null, 404);
    }

    $itemsStmt = $pdo->prepare("
        SELECT
            oi.id,
            oi.order_id,
            oi.product_id,
            oi.product_name,
            oi.price,
            oi.quantity,
            oi.subtotal,
            p.image,
            p.slug
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
        ORDER BY oi.id ASC
    ");

    $itemsStmt->execute([$orderId]);
    $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

    response(
        true,
        "Order loaded successfully",
        [
            "order" => $order,
            "items" => $items
        ]
    );

} catch (PDOException $e) {
    error_log("Single Order Error: " . $e->getMessage());
    response(false, "Failed to load order", null, 500);
}
