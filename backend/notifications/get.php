<?php
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../config/database.php';

$userId = requireLogin();

try {
    // Fetch notifications related to user's orders, status updates, or admin notes
    $stmt = $pdo->prepare("
        SELECT 
            o.id AS order_id,
            o.order_number,
            o.status,
            o.admin_note,
            o.created_at,
            o.total
        FROM orders o
        WHERE o.user_id = ?
        ORDER BY o.id DESC
        LIMIT 10
    ");
    $stmt->execute([$userId]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $notifications = [];
    foreach ($orders as $ord) {
        // Status update notification
        $notifications[] = [
            "id" => "status_" . $ord["order_id"],
            "title" => "Order #" . $ord["order_number"] . " Status: " . $ord["status"],
            "message" => "Your order fulfillment status is currently marked as '" . $ord["status"] . "'.",
            "date" => $ord["created_at"],
            "type" => "status",
            "link" => "/orders/" . $ord["order_id"]
        ];

        // Admin message notification if admin wrote a note
        if (!empty($ord["admin_note"])) {
            $notifications[] = [
                "id" => "msg_" . $ord["order_id"],
                "title" => "Concierge Message on Order #" . $ord["order_number"],
                "message" => $ord["admin_note"],
                "date" => $ord["created_at"],
                "type" => "message",
                "link" => "/orders/" . $ord["order_id"]
            ];
        }
    }

    // Default welcome notice
    $notifications[] = [
        "id" => "welcome",
        "title" => "Welcome to DE-GRACE Maison",
        "message" => "Enjoy bespoke haute couture collections and personalized white-glove concierge delivery.",
        "date" => date("Y-m-d H:i:s"),
        "type" => "welcome",
        "link" => "/products"
    ];

    response(true, "Notifications retrieved successfully", $notifications);

} catch (Exception $e) {
    response(false, "Failed to load notifications: " . $e->getMessage(), [], 500);
}
