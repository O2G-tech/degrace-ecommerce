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
    response(false, "Product ID is required", null, 422);
}

try {
    // Delete associated images
    $pdo->prepare("DELETE FROM product_images WHERE product_id = ?")->execute([$id]);
    
    // Delete product
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);

    response(true, "Product deleted successfully");

} catch (PDOException $e) {
    error_log("Delete Product Error: " . $e->getMessage());
    response(false, "Failed to delete product: " . $e->getMessage(), null, 500);
}
