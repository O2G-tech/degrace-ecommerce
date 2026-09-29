<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    response(
        false,
        "Only GET requests are allowed",
        null,
        405
    );
}


$id = $_GET["id"] ?? null;


if (!$id || !is_numeric($id)) {

    response(
        false,
        "Valid product ID is required",
        null,
        400
    );
}


try {

    /*
    |--------------------------------------------------------------------------
    | Product
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT

            p.id,
            p.category_id,
            p.name,
            p.slug,
            p.description,
            p.price,
            p.stock,
            p.created_at,

            c.name AS category_name,

            COALESCE((
                SELECT r.rating
                FROM reviews r
                WHERE r.product_id = p.id
                AND r.status = 'approved'
                GROUP BY r.rating
                ORDER BY COUNT(*) DESC, r.rating DESC
                LIMIT 1
            ), 0) AS majority_rating

        FROM products p

        LEFT JOIN categories c
            ON c.id = p.category_id

        WHERE p.id = ?

        LIMIT 1
    ");

    $stmt->execute([
        (int) $id
    ]);

    $product =
        $stmt->fetch(
            PDO::FETCH_ASSOC
        );


    if (!$product) {

        response(
            false,
            "Product not found",
            null,
            404
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Product images
    |--------------------------------------------------------------------------
    */

    $imageStmt = $pdo->prepare("
        SELECT

            id,
            image,
            is_primary,
            sort_order

        FROM product_images

        WHERE product_id = ?

        ORDER BY
            is_primary DESC,
            sort_order ASC,
            id ASC
    ");

    $imageStmt->execute([
        (int) $id
    ]);

    $images =
        $imageStmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    $product["images"] = $images;


    response(
        true,
        "Product loaded successfully",
        $product
    );


} catch (PDOException $e) {

    error_log(
        "Single product error: " .
        $e->getMessage()
    );

    response(
        false,
        "Failed to load product",
        null,
        500
    );
}