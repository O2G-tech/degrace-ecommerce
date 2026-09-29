<?php

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


/*
|--------------------------------------------------------------------------
| Get JSON request
|--------------------------------------------------------------------------
*/

$data = json_decode(
    file_get_contents("php://input"),
    true
);


/*
|--------------------------------------------------------------------------
| Get cart item ID
|--------------------------------------------------------------------------
*/

$cartItemId = isset($data["cart_item_id"])
    ? (int) $data["cart_item_id"]
    : 0;


if ($cartItemId <= 0) {

    response(
        false,
        "Invalid cart item",
        null,
        400
    );

    exit;
}


/*
|--------------------------------------------------------------------------
| Get logged-in user
|--------------------------------------------------------------------------
|
| This assumes your login system stores user_id
| in the PHP session.
|--------------------------------------------------------------------------
*/

session_start();

$userId = $_SESSION["user_id"] ?? null;


if (!$userId) {

    response(
        false,
        "Please login to manage your cart",
        null,
        401
    );

    exit;
}


try {

    /*
    |--------------------------------------------------------------------------
    | Find cart item belonging to this user
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            ci.id,
            ci.cart_id,
            ci.product_id
        FROM cart_items ci
        INNER JOIN cart c
            ON c.id = ci.cart_id
        WHERE ci.id = ?
        AND c.user_id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $cartItemId,
        $userId
    ]);


    $cartItem = $stmt->fetch(
        PDO::FETCH_ASSOC
    );


    if (!$cartItem) {

        response(
            false,
            "Cart item not found",
            null,
            404
        );

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Delete cart item
    |--------------------------------------------------------------------------
    */

    $deleteStmt = $pdo->prepare("
        DELETE FROM cart_items
        WHERE id = ?
    ");


    $deleteStmt->execute([
        $cartItemId
    ]);


    response(
        true,
        "Product removed from cart",
        [
            "cart_item_id" => $cartItemId
        ]
    );


} catch (PDOException $e) {

    error_log(
        "REMOVE CART ITEM ERROR: " .
        $e->getMessage()
    );


    response(
        false,
        "Failed to remove product from cart",
        null,
        500
    );
}