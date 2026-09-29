<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "DELETE" && $_SERVER["REQUEST_METHOD"] !== "POST") {
    response(false, "Only DELETE or POST requests are allowed", null, 405);
}

requireAdmin();

$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data["id"]) ? (int) $data["id"] : (int) ($_GET["id"] ?? ($_POST["id"] ?? 0));

if ($id <= 0) {
    response(false, "Review ID is required", null, 422);
}

try {
    $stmt = $pdo->prepare("DELETE FROM reviews WHERE id = ?");
    $stmt->execute([$id]);

    response(true, "Review deleted successfully");

} catch (PDOException $e) {
    error_log("DELETE REVIEW ERROR: " . $e->getMessage());
    response(false, "Failed to delete review", null, 500);
}
