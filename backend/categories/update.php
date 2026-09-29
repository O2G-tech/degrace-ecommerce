<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "PUT" && $_SERVER["REQUEST_METHOD"] !== "POST") {
    response(false, "Only PUT or POST requests are allowed", null, 405);
}

requireAdmin();

$data = json_decode(file_get_contents("php://input"), true);
if (!$data && !empty($_POST)) {
    $data = $_POST;
}

$id = isset($data["id"]) ? (int) $data["id"] : (int) ($_GET["id"] ?? 0);
$name = trim($data["name"] ?? "");
$parentId = $data["parent_id"] ?? null;
$status = $data["status"] ?? "active";

if ($id <= 0 || $name === "") {
    response(false, "Category ID and name are required", null, 422);
}

if ($parentId === "" || $parentId === null || $parentId === "null" || (int)$parentId === 0) {
    $parentId = null;
}

if ((int) $parentId === (int) $id) {
    response(false, "A category cannot be its own parent", null, 422);
}

$slug = strtolower(preg_replace("/[^a-zA-Z0-9]+/", "-", $name));
$slug = trim($slug, "-");

try {
    $currStmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
    $currStmt->execute([$id]);
    $current = $currStmt->fetch(PDO::FETCH_ASSOC);

    if (!$current) {
        response(false, "Category not found", null, 404);
    }

    $image = $current["image"];

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
    } elseif (isset($data["image"]) && !empty($data["image"])) {
        $image = $data["image"];
    }

    $stmt = $pdo->prepare("
        UPDATE categories
        SET name = ?, slug = ?, parent_id = ?, image = ?, status = ?
        WHERE id = ?
    ");

    $stmt->execute([$name, $slug, $parentId, $image, $status, $id]);

    $fetchStmt = $pdo->prepare("
        SELECT c.*, parent.name AS parent_name
        FROM categories c
        LEFT JOIN categories parent ON parent.id = c.parent_id
        WHERE c.id = ?
    ");
    $fetchStmt->execute([$id]);
    $updatedCategory = $fetchStmt->fetch(PDO::FETCH_ASSOC);

    response(true, "Category updated successfully", $updatedCategory);

} catch (PDOException $e) {
    error_log("Update Category Error: " . $e->getMessage());
    response(false, "Failed to update category: " . $e->getMessage(), null, 500);
}
