<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    response(false, "Only POST requests are allowed", null, 405);
}

requireAdmin();

if (!isset($_FILES["image"]) || $_FILES["image"]["error"] !== UPLOAD_ERR_OK) {
    response(false, "No valid image uploaded", null, 400);
}

$uploadDir = "../uploads/products/";
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$extension = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
$allowed = ["jpg", "jpeg", "png", "webp", "gif"];

if (!in_array($extension, $allowed)) {
    response(false, "Invalid image format", null, 422);
}

$fileName = "product-" . time() . "-" . uniqid() . "." . $extension;
$targetPath = $uploadDir . $fileName;

if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetPath)) {
    response(true, "Image uploaded successfully", [
        "filename" => $fileName,
        "url" => "http://localhost/backend/uploads/products/" . $fileName
    ]);
} else {
    response(false, "Failed to save uploaded file", null, 500);
}
