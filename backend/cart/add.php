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

$productId = $data["product_id"] ?? null;
$quantity = $data["quantity"] ?? 1;

if (!$productId || !is_numeric($productId)) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid product"
    ]);

    exit;
}

$productId = (int) $productId;
$quantity = (int) $quantity;

if ($quantity < 1) {
    $quantity = 1;
}


/*
|--------------------------------------------------------------------------
| Get product
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT id, name, price, stock
    FROM products
    WHERE id = ?
    LIMIT 1
");

$stmt->execute([
    $productId
]);

$product = $stmt->fetch();


if (!$product) {

    echo json_encode([
        "success" => false,
        "message" => "Product not found"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Check stock
|--------------------------------------------------------------------------
*/

if ($product["stock"] < $quantity) {

    echo json_encode([
        "success" => false,
        "message" => "Not enough stock available"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Find customer's cart
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT id
    FROM cart
    WHERE user_id = ?
    LIMIT 1
");

$stmt->execute([
    $userId
]);

$cart = $stmt->fetch();


/*
|--------------------------------------------------------------------------
| Create cart if it doesn't exist
|--------------------------------------------------------------------------
*/

if (!$cart) {

    $stmt = $pdo->prepare("
        INSERT INTO cart (user_id)
        VALUES (?)
    ");

    $stmt->execute([
        $userId
    ]);

    $cartId = $pdo->lastInsertId();

} else {

    $cartId = $cart["id"];

}


/*
|--------------------------------------------------------------------------
| Check whether product already exists
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT id, quantity
    FROM cart_items
    WHERE cart_id = ?
    AND product_id = ?
    LIMIT 1
");

$stmt->execute([
    $cartId,
    $productId
]);

$existingItem = $stmt->fetch();


/*
|--------------------------------------------------------------------------
| Product already in cart
|--------------------------------------------------------------------------
*/

if ($existingItem) {

    $newQuantity =
        $existingItem["quantity"] + $quantity;


    if ($newQuantity > $product["stock"]) {

        echo json_encode([
            "success" => false,
            "message" =>
                "You cannot add more than the available stock"
        ]);

        exit;
    }


    $stmt = $pdo->prepare("
        UPDATE cart_items
        SET quantity = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $newQuantity,
        $existingItem["id"]
    ]);


/*
|--------------------------------------------------------------------------
| New product
|--------------------------------------------------------------------------
*/

} else {

    $stmt = $pdo->prepare("
        INSERT INTO cart_items
        (
            cart_id,
            product_id,
            quantity
        )
        VALUES (?, ?, ?)
    ");

    $stmt->execute([
        $cartId,
        $productId,
        $quantity
    ]);

}


echo json_encode([
    "success" => true,
    "message" => "Product added to cart"
]);