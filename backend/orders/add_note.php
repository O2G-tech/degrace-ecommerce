<?php
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../config/database.php';

requireAdmin();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    response(false, "Only POST requests allowed", null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data && !empty($_POST)) {
    $data = $_POST;
}

$orderId = (int) ($data["id"] ?? $data["order_id"] ?? 0);
$note = trim($data["note"] ?? $data["message"] ?? "");

if ($orderId <= 0 || $note === "") {
    response(false, "Order ID and note message are required", null, 400);
}

try {
    // Check if admin_note column exists, if not add it
    try {
        $pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note TEXT DEFAULT NULL");
    } catch (Exception $ex) {}

    $stmt = $pdo->prepare("UPDATE orders SET admin_note = ? WHERE id = ?");
    $stmt->execute([$note, $orderId]);

    response(true, "Concierge message sent to client successfully", ["order_id" => $orderId, "admin_note" => $note]);
} catch (PDOException $e) {
    response(false, "Failed to send note: " . $e->getMessage(), null, 500);
}
