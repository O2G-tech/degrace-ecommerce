<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    response(false, "Only GET requests are allowed", null, 405);
}

requireAdmin();

$status = trim($_GET["status"] ?? "all");
$search = trim($_GET["search"] ?? "");

$where = ["1=1"];
$params = [];

if ($status !== "all" && in_array($status, ["pending", "approved", "rejected"])) {
    $where[] = "r.status = ?";
    $params[] = $status;
}

if ($search !== "") {
    $where[] = "(p.name LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR r.comment LIKE ?)";
    $wildcard = "%" . $search . "%";
    $params[] = $wildcard;
    $params[] = $wildcard;
    $params[] = $wildcard;
    $params[] = $wildcard;
}

$whereClause = implode(" AND ", $where);

try {
    $stmt = $pdo->prepare("
        SELECT
            r.id,
            r.product_id,
            r.user_id,
            r.rating,
            r.comment,
            r.status,
            r.admin_reply,
            r.created_at,
            p.name AS product_name,
            p.image AS product_image,
            u.name AS customer_name,
            u.email AS customer_email
        FROM reviews r
        INNER JOIN products p ON p.id = r.product_id
        INNER JOIN users u ON u.id = r.user_id
        WHERE $whereClause
        ORDER BY r.created_at DESC
    ");

    $stmt->execute($params);
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    response(true, "Reviews loaded successfully", [
        "reviews" => $reviews,
        "count" => count($reviews)
    ]);

} catch (PDOException $e) {
    error_log("ADMIN REVIEWS ERROR: " . $e->getMessage());
    response(false, "Failed to load reviews", null, 500);
}
