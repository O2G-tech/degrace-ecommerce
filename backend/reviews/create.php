<?php

session_start();

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    response(
        false,
        "Only POST requests are allowed",
        null,
        405
    );

    exit;
}


// Check login
if (!isset($_SESSION["user_id"])) {

    response(
        false,
        "Please login to write a review",
        null,
        401
    );

    exit;
}


$userId = (int) $_SESSION["user_id"];


$data = json_decode(
    file_get_contents("php://input"),
    true
);


$productId = isset($data["product_id"])
    ? (int) $data["product_id"]
    : 0;

$rating = isset($data["rating"])
    ? (int) $data["rating"]
    : 0;

$comment = trim(
    $data["comment"] ?? ""
);


// Validate product
if ($productId <= 0) {

    response(
        false,
        "Invalid product",
        null,
        400
    );

    exit;
}


// Validate rating
if ($rating < 1 || $rating > 5) {

    response(
        false,
        "Rating must be between 1 and 5",
        null,
        400
    );

    exit;
}


// Validate comment
if ($comment === "") {

    response(
        false,
        "Please write a review",
        null,
        400
    );

    exit;
}


try {

    // Check product exists
    $productStmt = $pdo->prepare("
        SELECT id
        FROM products
        WHERE id = ?
    ");

    $productStmt->execute([
        $productId
    ]);


    if (!$productStmt->fetch()) {

        response(
            false,
            "Product not found",
            null,
            404
        );

        exit;
    }


    // Prevent duplicate review
    $checkStmt = $pdo->prepare("
        SELECT id
        FROM reviews
        WHERE product_id = ?
        AND user_id = ?
    ");

    $checkStmt->execute([
        $productId,
        $userId
    ]);


    if ($checkStmt->fetch()) {

        response(
            false,
            "You have already reviewed this product",
            null,
            400
        );

        exit;
    }


    // Create review
    $stmt = $pdo->prepare("
        INSERT INTO reviews
        (
            product_id,
            user_id,
            rating,
            comment,
            status
        )
        VALUES
        (?, ?, ?, ?, 'pending')
    ");


    $stmt->execute([
        $productId,
        $userId,
        $rating,
        $comment
    ]);


    response(
        true,
        "Review submitted successfully. It will appear after approval.",
        [
            "id" => $pdo->lastInsertId()
        ]
    );


} catch (PDOException $e) {

    error_log(
        "CREATE REVIEW ERROR: " .
        $e->getMessage()
    );


    response(
        false,
        "Failed to submit review",
        null,
        500
    );
}