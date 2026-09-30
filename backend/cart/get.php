<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../config/auth.php";

header("Content-Type: application/json");

$userId = requireLogin();


$stmt = $pdo->prepare("
    SELECT
        ci.id,
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.image
    FROM cart_items ci
    INNER JOIN cart c
        ON c.id = ci.cart_id
    INNER JOIN products p
        ON p.id = ci.product_id
    WHERE c.user_id = ?
    ORDER BY ci.id DESC
");

$stmt->execute([
    $userId
]);


$items = [];

$subtotal = 0;


while ($row = $stmt->fetch()) {

    $row["quantity"] =
        (int) $row["quantity"];

    $row["price"] =
        (float) $row["price"];

    $row["item_total"] =
        $row["price"] *
        $row["quantity"];

    $subtotal +=
        $row["item_total"];

    $items[] = $row;
}


/*
|--------------------------------------------------------------------------
| Delivery fee
|--------------------------------------------------------------------------
*/

$delivery = count($items) > 0
    ? 5000
    : 0;


$total =
    $subtotal + $delivery;


echo json_encode([

    "success" => true,

    "message" =>
        "Cart loaded successfully",

    "data" => [

        "items" => $items,

        "subtotal" =>
            $subtotal,

        "delivery" =>
            $delivery,

        "total" =>
            $total

    ]

]);