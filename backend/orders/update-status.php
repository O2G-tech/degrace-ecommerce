<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "PUT" && $_SERVER["REQUEST_METHOD"] !== "POST") {
    response(false, "Only PUT or POST requests are allowed", null, 405);
}

requireAdmin();

$data = json_decode(file_get_contents("php://input"), true);
if (!$data && !empty($_POST)) {
    $data = $_POST;
}

$id = isset($data["id"]) ? (int) $data["id"] : (int) ($data["order_id"] ?? 0);
$status = trim($data["status"] ?? "");

$allowed = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled"
];

if ($id <= 0 || !in_array($status, $allowed)) {
    response(
        false,
        "Invalid order ID or status. Allowed: Pending, Processing, Shipped, Delivered, Cancelled",
        null,
        422
    );
}

try {
    // Check if order exists
    $checkStmt = $pdo->prepare("SELECT id, status, payment_status, payment_method FROM orders WHERE id = ?");
    $checkStmt->execute([$id]);
    $order = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        response(false, "Order not found", null, 404);
    }

    $paymentStatusUpdate = "";
    $params = [$status];

    if ($status === "Delivered" && $order["payment_method"] === "cod" && $order["payment_status"] !== "Completed") {
        $paymentStatusUpdate = ", payment_status = 'Completed'";
    } elseif ($status === "Cancelled" && $order["payment_status"] === "Pending") {
        $paymentStatusUpdate = ", payment_status = 'Cancelled'";
    }

    $params[] = $id;

    $stmt = $pdo->prepare("
        UPDATE orders
        SET status = ? $paymentStatusUpdate
        WHERE id = ?
    ");

    $stmt->execute($params);

    response(
        true,
        "Order status updated successfully to $status",
        [
            "order_id" => $id,
            "status" => $status
        ]
    );

} catch (PDOException $e) {
    error_log("Order Status Error: " . $e->getMessage());
    response(
        false,
        "Failed to update order status",
        null,
        500
    );
}
