<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    response(false, "Only GET requests are allowed", null, 405);
}

requireAdmin();

$period = $_GET["period"] ?? "30";
$allowedPeriods = ["7", "30", "90", "all"];

if (!in_array($period, $allowedPeriods, true)) {
    $period = "30";
}

$dateFilter = "";
$params = [];

if ($period !== "all") {
    $dateFilter = " AND o.created_at >= ?";
    $params[] = date("Y-m-d 00:00:00", strtotime("-" . (int) $period . " days"));
}

try {
    $summaryStmt = $pdo->prepare("
        SELECT
            COUNT(*) AS total_orders,
            COALESCE(SUM(CASE WHEN o.status <> 'Cancelled' THEN o.total ELSE 0 END), 0) AS revenue,
            COALESCE(SUM(CASE WHEN o.status = 'Delivered' THEN o.total ELSE 0 END), 0) AS delivered_revenue,
            COALESCE(SUM(CASE WHEN o.status = 'Cancelled' THEN o.total ELSE 0 END), 0) AS cancelled_value,
            COUNT(DISTINCT o.user_id) AS customers
        FROM orders o
        WHERE 1 = 1 $dateFilter
    ");
    $summaryStmt->execute($params);
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

    $statusStmt = $pdo->prepare("
        SELECT o.status, COUNT(*) AS order_count
        FROM orders o
        WHERE 1 = 1 $dateFilter
        GROUP BY o.status
        ORDER BY order_count DESC
    ");
    $statusStmt->execute($params);
    $statusBreakdown = $statusStmt->fetchAll(PDO::FETCH_ASSOC);

    $salesStmt = $pdo->prepare("
        SELECT
            DATE(o.created_at) AS sale_date,
            COUNT(*) AS order_count,
            COALESCE(SUM(CASE WHEN o.status <> 'Cancelled' THEN o.total ELSE 0 END), 0) AS revenue
        FROM orders o
        WHERE 1 = 1 $dateFilter
        GROUP BY DATE(o.created_at)
        ORDER BY sale_date ASC
    ");
    $salesStmt->execute($params);
    $dailySales = $salesStmt->fetchAll(PDO::FETCH_ASSOC);

    $topProductsStmt = $pdo->prepare("
        SELECT
            oi.product_id,
            oi.product_name,
            SUM(oi.quantity) AS units_sold,
            COALESCE(SUM(oi.subtotal), 0) AS revenue
        FROM order_items oi
        INNER JOIN orders o ON o.id = oi.order_id
        WHERE o.status <> 'Cancelled' $dateFilter
        GROUP BY oi.product_id, oi.product_name
        ORDER BY units_sold DESC, revenue DESC
        LIMIT 10
    ");
    $topProductsStmt->execute($params);
    $topProducts = $topProductsStmt->fetchAll(PDO::FETCH_ASSOC);

    $inventory = (int) $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
    $lowStock = (int) $pdo->query("SELECT COUNT(*) FROM products WHERE stock <= 5")->fetchColumn();

    response(true, "Reports loaded successfully", [
        "period" => $period,
        "summary" => [
            "total_orders" => (int) $summary["total_orders"],
            "revenue" => (float) $summary["revenue"],
            "delivered_revenue" => (float) $summary["delivered_revenue"],
            "cancelled_value" => (float) $summary["cancelled_value"],
            "customers" => (int) $summary["customers"],
            "average_order_value" => (int) $summary["total_orders"] > 0
                ? (float) $summary["revenue"] / (int) $summary["total_orders"]
                : 0
        ],
        "inventory" => [
            "products" => $inventory,
            "low_stock" => $lowStock
        ],
        "status_breakdown" => $statusBreakdown,
        "daily_sales" => $dailySales,
        "top_products" => $topProducts
    ]);

} catch (PDOException $e) {
    error_log("Admin Reports Error: " . $e->getMessage());
    response(false, "Failed to load reports", null, 500);
}
