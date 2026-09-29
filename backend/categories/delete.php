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
    response(false, "Category ID is required", null, 422);
}

try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM categories WHERE parent_id = ?");
    $stmt->execute([$id]);
    $children = $stmt->fetchColumn();

    if ($children > 0) {
        response(false, "Cannot delete a category that has subcategories. Please reassign or delete subcategories first.", null, 409);
    }

    // Unset category_id from products in this category so products are not orphaned
    $pdo->prepare("UPDATE products SET category_id = NULL WHERE category_id = ?")->execute([$id]);

    $delStmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
    $delStmt->execute([$id]);

    response(true, "Category deleted successfully");

} catch (PDOException $e) {
    error_log("Delete Category Error: " . $e->getMessage());
    response(false, "Failed to delete category: " . $e->getMessage(), null, 500);
}
