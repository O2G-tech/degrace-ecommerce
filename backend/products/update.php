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

$id = isset($data["id"]) ? (int) $data["id"] : (int) ($_GET["id"] ?? 0);

if ($id <= 0) {
    response(false, "Product ID is required", null, 422);
}

try {
    $currStmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $currStmt->execute([$id]);
    $current = $currStmt->fetch(PDO::FETCH_ASSOC);

    if (!$current) {
        response(false, "Product not found", null, 404);
    }

    $categoryId = isset($data["category_id"]) ? (int) $data["category_id"] : (int) $current["category_id"];
    $name = isset($data["name"]) ? trim($data["name"]) : $current["name"];
    $slug = isset($data["slug"]) && trim($data["slug"]) !== "" ? trim($data["slug"]) : $current["slug"];
    $description = isset($data["description"]) ? trim($data["description"]) : $current["description"];
    $price = isset($data["price"]) ? (float) $data["price"] : (float) $current["price"];
    $stock = isset($data["stock"]) ? (int) $data["stock"] : (int) $current["stock"];
    $status = isset($data["status"]) ? $data["status"] : $current["status"];
    $imageName = $current["image"];

    if (isset($_FILES["image"]) && $_FILES["image"]["error"] === UPLOAD_ERR_OK) {
        $uploadDir = "../uploads/products/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $extension = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
        $allowed = ["jpg", "jpeg", "png", "webp", "gif"];

        if (in_array($extension, $allowed)) {
            $uniqueName = strtolower(preg_replace("/[^a-zA-Z0-9]+/", "-", $name)) . "-" . time() . "-" . uniqid() . "." . $extension;
            if (move_uploaded_file($_FILES["image"]["tmp_name"], $uploadDir . $uniqueName)) {
                $imageName = $uniqueName;
            }
        }
    } elseif (isset($data["image"]) && !empty($data["image"])) {
        $imageName = $data["image"];
    }

    $stmt = $pdo->prepare("
        UPDATE products
        SET
            category_id = ?,
            name = ?,
            slug = ?,
            description = ?,
            price = ?,
            stock = ?,
            image = ?,
            status = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $categoryId,
        $name,
        $slug,
        $description,
        $price,
        $stock,
        $imageName,
        $status,
        $id
    ]);

    $fetchStmt = $pdo->prepare("
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.id = ?
    ");
    $fetchStmt->execute([$id]);
    $updated = $fetchStmt->fetch(PDO::FETCH_ASSOC);

    response(true, "Product updated successfully", $updated);

} catch (PDOException $e) {
    error_log("Update Product Error: " . $e->getMessage());
    response(false, "Failed to update product: " . $e->getMessage(), null, 500);
}
