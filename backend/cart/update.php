<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../config/auth.php";

header("Content-Type: application/json");

$userId = requireLogin();

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$cartItemId =
    $data["cart_item_id"] ?? null;

$quantity =
    $data["quantity"] ?? null;


if (
    !$cartItemId ||
    !is_numeric($cartItemId) ||
    !is_numeric($quantity)
) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid cart item"
    ]);

    exit;
}


$cartItemId = (int) $cartItemId;
$quantity = (int) $quantity;


/*
|--------------------------------------------------------------------------
| Quantity 0 = remove
|--------------------------------------------------------------------------
*/

if ($quantity <= 0) {

    $stmt = $pdo->prepare("
        DELETE ci

        FROM cart_items ci

        INNER JOIN cart c
            ON c.id = ci.cart_id

        WHERE ci.id = ?

        AND c.user_id = ?
    ");

    $stmt->execute([
        $cartItemId,
        $userId
    ]);


    echo json_encode([
        "success" => true,
        "message" =>
            "Product removed from cart"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Check item and stock
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT p.stock

    FROM cart_items ci

    INNER JOIN cart c
        ON c.id = ci.cart_id

    INNER JOIN products p
        ON p.id = ci.product_id

    WHERE ci.id = ?

    AND c.user_id = ?

    LIMIT 1
");

$stmt->execute([
    $cartItemId,
    $userId
]);

$item = $stmt->fetch();


if (!$item) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Cart item not found"
    ]);

    exit;
}


if ($quantity > $item["stock"]) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Quantity exceeds available stock"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Update quantity
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    UPDATE cart_items ci

    INNER JOIN cart c
        ON c.id = ci.cart_id

    SET ci.quantity = ?

    WHERE ci.id = ?

    AND c.user_id = ?
");

$stmt->execute([
    $quantity,
    $cartItemId,
    $userId
]);


echo json_encode([
    "success" => true,
    "message" =>
        "Cart updated successfully"
]);