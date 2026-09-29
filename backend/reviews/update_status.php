<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST" && $_SERVER["REQUEST_METHOD"] !== "PUT") {
    response(false, "Only POST or PUT requests are allowed", null, 405);
}

requireAdmin();

$data = json_decode(file_get_contents("php://input"), true);
if (!$data && !empty($_POST)) {
    $data = $_POST;
}

$id = isset($data["id"]) ? (int) $data["id"] : (int) ($data["review_id"] ?? 0);
$status = strtolower(trim($data["status"] ?? ""));

if ($id <= 0) {
    response(false, "Review ID is required", null, 422);
}

$allowedStatuses = ["pending", "approved", "rejected"];

if (!in_array($status, $allowedStatuses)) {
    response(false, "Invalid review status. Allowed: pending, approved, rejected", null, 422);
}

try {
    $stmt = $pdo->prepare("UPDATE reviews SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);

    response(true, "Review status updated to '$status'", [
        "review_id" => $id,
        "status" => $status
    ]);

} catch (PDOException $e) {
    error_log("UPDATE REVIEW STATUS ERROR: " . $e->getMessage());
    response(false, "Failed to update review status", null, 500);
}
