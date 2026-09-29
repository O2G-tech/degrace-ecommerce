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
$reply = trim($data["reply"] ?? ($data["admin_reply"] ?? ""));

if ($id <= 0) {
    response(false, "Review ID is required", null, 422);
}

try {
    $stmt = $pdo->prepare("UPDATE reviews SET admin_reply = ? WHERE id = ?");
    $stmt->execute([$reply === "" ? null : $reply, $id]);

    response(true, "Admin reply updated successfully", [
        "review_id" => $id,
        "admin_reply" => $reply
    ]);

} catch (PDOException $e) {
    error_log("ADMIN REVIEW REPLY ERROR: " . $e->getMessage());
    response(false, "Failed to save review reply", null, 500);
}
