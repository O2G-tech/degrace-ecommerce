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
    $products = (int) $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
    $categories = (int) $pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();
    $customers = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'customer'")->fetchColumn();
    $orders = (int) $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
    
    $revenue = (float) $pdo->query("
        SELECT COALESCE(SUM(total), 0)
        FROM orders
        WHERE status != 'Cancelled'
    ")->fetchColumn();

    $pendingOrders = (int) $pdo->query("
        SELECT COUNT(*)
        FROM orders
        WHERE status = 'Pending'
    ")->fetchColumn();

    $processingOrders = (int) $pdo->query("
        SELECT COUNT(*)
        FROM orders
        WHERE status = 'Processing'
    ")->fetchColumn();

    $shippedOrders = (int) $pdo->query("
        SELECT COUNT(*)
        FROM orders
        WHERE status = 'Shipped'
    ")->fetchColumn();

    $deliveredOrders = (int) $pdo->query("
        SELECT COUNT(*)
        FROM orders
        WHERE status = 'Delivered'
    ")->fetchColumn();

    $cancelledOrders = (int) $pdo->query("
        SELECT COUNT(*)
        FROM orders
        WHERE status = 'Cancelled'
    ")->fetchColumn();

    $todayOrders = (int) $pdo->query("
        SELECT COUNT(*)
        FROM orders
        WHERE DATE(created_at) = CURDATE()
    ")->fetchColumn();

    $todayRevenue = (float) $pdo->query("
        SELECT COALESCE(SUM(total), 0)
        FROM orders
        WHERE DATE(created_at) = CURDATE() AND status != 'Cancelled'
    ")->fetchColumn();

    $lowStockProducts = (int) $pdo->query("
        SELECT COUNT(*)
        FROM products
        WHERE stock <= 5
    ")->fetchColumn();

    $pendingReviews = (int) $pdo->query("
        SELECT COUNT(*)
        FROM reviews
        WHERE status = 'pending'
    ")->fetchColumn();

    $recentOrdersStmt = $pdo->query("
        SELECT
            id,
            order_number,
            full_name,
            email,
            phone,
            total,
            payment_method,
            payment_status,
            status,
            created_at
        FROM orders
        ORDER BY id DESC
        LIMIT 6
    ");
    $recentOrders = $recentOrdersStmt->fetchAll(PDO::FETCH_ASSOC);

    response(
        true,
        "Dashboard loaded successfully",
        [
            "products" => $products,
            "categories" => $categories,
            "customers" => $customers,
            "orders" => $orders,
            "revenue" => $revenue,
            "pending_orders" => $pendingOrders,
            "processing_orders" => $processingOrders,
            "shipped_orders" => $shippedOrders,
            "delivered_orders" => $deliveredOrders,
            "cancelled_orders" => $cancelledOrders,
            "today_orders" => $todayOrders,
            "today_revenue" => $todayRevenue,
            "low_stock_products" => $lowStockProducts,
            "pending_reviews" => $pendingReviews,
            "recent_orders" => $recentOrders
        ]
    );

} catch (PDOException $e) {
    error_log("Dashboard Error: " . $e->getMessage());
    response(false, "Failed to load dashboard data", null, 500);
}
