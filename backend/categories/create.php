<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    response(false, "Only POST requests are allowed", null, 405);
}

requireAdmin();

$data = json_decode(file_get_contents("php://input"), true);
if (!$data && !empty($_POST)) {
    $data = $_POST;
}

$name = trim($data["name"] ?? "");
$parentId = $data["parent_id"] ?? null;
$image = $data["image"] ?? null;
$status = $data["status"] ?? "active";

if ($name === "") {
    response(false, "Category name is required", null, 422);
}

if ($parentId === "" || $parentId === null || $parentId === "null" || (int)$parentId === 0) {
    $parentId = null;
}

$slug = strtolower(preg_replace("/[^a-zA-Z0-9]+/", "-", $name));
$slug = trim($slug, "-");

// Handle image upload if multipart
if (isset($_FILES["image"]) && $_FILES["image"]["error"] === UPLOAD_ERR_OK) {
    $uploadDir = "../uploads/categories/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    $ext = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
    if (in_array($ext, ["jpg", "jpeg", "png", "webp"])) {
        $imgName = $slug . "-" . time() . "." . $ext;
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $uploadDir . $imgName)) {
            $image = $imgName;
        }
    }
}

try {
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE slug = ? LIMIT 1");
    $stmt->execute([$slug]);

    if ($stmt->fetch()) {
        $slug = $slug . "-" . time();
    }

    $stmt = $pdo->prepare("
        INSERT INTO categories (parent_id, name, slug, image, status)
        VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->execute([$parentId, $name, $slug, $image, $status]);
    $newId = $pdo->lastInsertId();

    $fetchStmt = $pdo->prepare("
        SELECT c.*, parent.name AS parent_name
        FROM categories c
        LEFT JOIN categories parent ON parent.id = c.parent_id
        WHERE c.id = ?
    ");
    $fetchStmt->execute([$newId]);
    $newCategory = $fetchStmt->fetch(PDO::FETCH_ASSOC);

    response(true, "Category created successfully", $newCategory, 201);

} catch (PDOException $e) {
    error_log("Create Category Error: " . $e->getMessage());
    response(false, "Failed to create category: " . $e->getMessage(), null, 500);
}
