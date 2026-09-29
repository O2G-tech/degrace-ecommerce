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

    exit;
}


$productId = isset($_GET["product_id"])
    ? (int) $_GET["product_id"]
    : 0;


if ($productId <= 0) {

    response(
        false,
        "Product ID is required",
        null,
        400
    );

    exit;
}


try {

    $stmt = $pdo->prepare("
        SELECT

            r.id,

            r.product_id,

            r.user_id,

            r.rating,

            r.comment,

            r.admin_reply,

            r.created_at,

            u.name AS customer_name

        FROM reviews r

        INNER JOIN users u
            ON u.id = r.user_id

        WHERE r.product_id = ?

        AND r.status = 'approved'

        ORDER BY r.created_at DESC
    ");


    $stmt->execute([
        $productId
    ]);


    $reviews =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    response(
        true,
        "Reviews loaded successfully",
        [
            "reviews" => $reviews
        ]
    );


} catch (PDOException $e) {

    error_log(
        "GET REVIEWS ERROR: " .
        $e->getMessage()
    );


    response(
        false,
        "Failed to load reviews",
        null,
        500
    );
}