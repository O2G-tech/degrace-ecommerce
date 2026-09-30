<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";
require_once "../helpers/auth.php";

/*
|--------------------------------------------------------------------------
| Only POST requests
|--------------------------------------------------------------------------
*/

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
| Check logged-in user
|--------------------------------------------------------------------------
*/

$userId = requireLogin();


/*
|--------------------------------------------------------------------------
| Get request body
|--------------------------------------------------------------------------
*/

$rawInput = file_get_contents("php://input");

$input = json_decode($rawInput, true);

if (!is_array($input)) {

    response(
        false,
        "Invalid JSON request",
        null,
        400
    );

    exit;
}


/*
|--------------------------------------------------------------------------
| Required checkout fields
|--------------------------------------------------------------------------
*/

$requiredFields = [
    "full_name",
    "phone",
    "email",
    "address",
    "state",
    "city"
];

foreach ($requiredFields as $field) {

    if (
        !isset($input[$field]) ||
        trim((string)$input[$field]) === ""
    ) {

        response(
            false,
            "Please provide " . $field,
            null,
            400
        );

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| Get checkout data
|--------------------------------------------------------------------------
*/

$fullName = trim((string)$input["full_name"]);
$phone = trim((string)$input["phone"]);
$email = trim((string)$input["email"]);
$address = trim((string)$input["address"]);
$state = trim((string)$input["state"]);
$city = trim((string)$input["city"]);

$postalCode = trim(
    (string)($input["postal_code"] ?? "")
);

$deliveryMethod = trim(
    (string)($input["delivery_method"] ?? "standard")
);

$paymentMethod = trim(
    (string)($input["payment_method"] ?? "pay_on_delivery")
);


/*
|--------------------------------------------------------------------------
| Delivery fee
|--------------------------------------------------------------------------
*/

if ($deliveryMethod === "express") {

    $deliveryFee = 10000;

} else {

    $deliveryFee = 5000;
}


/*
|--------------------------------------------------------------------------
| Start transaction
|--------------------------------------------------------------------------
*/

try {

    $pdo->beginTransaction();


    /*
    |--------------------------------------------------------------------------
    | Find user's cart
    |--------------------------------------------------------------------------
    */

    $cartSQL = "
        SELECT id
        FROM cart
        WHERE user_id = ?
        LIMIT 1
    ";

    $cartStmt = $pdo->prepare($cartSQL);

    $cartStmt->execute([
        $userId
    ]);

    $cart = $cartStmt->fetch(PDO::FETCH_ASSOC);


    if (!$cart) {

        $pdo->rollBack();

        response(
            false,
            "Cart not found for this user",
            null,
            404
        );

        exit;
    }


    $cartId = (int)$cart["id"];


    /*
    |--------------------------------------------------------------------------
    | Get cart products
    |--------------------------------------------------------------------------
    */

    $itemsSQL = "
        SELECT
            ci.product_id,
            ci.quantity,
            p.name,
            p.price,
            p.stock
        FROM cart_items ci
        INNER JOIN products p
            ON p.id = ci.product_id
        WHERE ci.cart_id = ?
    ";

    $itemsStmt = $pdo->prepare($itemsSQL);

    $itemsStmt->execute([
        $cartId
    ]);

    $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | Check empty cart
    |--------------------------------------------------------------------------
    */

    if (empty($items)) {

        $pdo->rollBack();

        response(
            false,
            "Your cart is empty",
            null,
            400
        );

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Calculate subtotal
    |--------------------------------------------------------------------------
    */

    $subtotal = 0;


    foreach ($items as $item) {

        $quantity = (int)$item["quantity"];
        $stock = (int)$item["stock"];
        $price = (float)$item["price"];


        if ($quantity <= 0) {

            $pdo->rollBack();

            response(
                false,
                "Invalid quantity for " . $item["name"],
                null,
                400
            );

            exit;
        }


        if ($quantity > $stock) {

            $pdo->rollBack();

            response(
                false,
                "Insufficient stock for " . $item["name"],
                null,
                400
            );

            exit;
        }


        $subtotal += $price * $quantity;
    }


    /*
    |--------------------------------------------------------------------------
    | Calculate total
    |--------------------------------------------------------------------------
    */

    $total = $subtotal + $deliveryFee;


    /*
    |--------------------------------------------------------------------------
    | Generate order number
    |--------------------------------------------------------------------------
    */

    $orderNumber =
        "ORD-" .
        date("YmdHis") .
        "-" .
        random_int(100, 999);


    /*
    |--------------------------------------------------------------------------
    | Create order
    |--------------------------------------------------------------------------
    */

    $orderSQL = "
        INSERT INTO orders (
            user_id,
            order_number,
            full_name,
            phone,
            email,
            address,
            state,
            city,
            postal_code,
            delivery_method,
            payment_method,
            payment_status,
            status,
            subtotal,
            delivery_fee,
            total
        )
        VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, 'pending', 'Pending',
            ?, ?, ?
        )
    ";

    $orderStmt = $pdo->prepare($orderSQL);

    $orderStmt->execute([
        $userId,
        $orderNumber,
        $fullName,
        $phone,
        $email,
        $address,
        $state,
        $city,
        $postalCode,
        $deliveryMethod,
        $paymentMethod,
        $subtotal,
        $deliveryFee,
        $total
    ]);


    $orderId = (int)$pdo->lastInsertId();


    if ($orderId <= 0) {

        throw new Exception(
            "Order was not created. No order ID returned."
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Insert order items
    |--------------------------------------------------------------------------
    */

    $itemSQL = "
        INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            price,
            quantity,
            subtotal
        )
        VALUES (?, ?, ?, ?, ?, ?)
    ";

    $itemStmt = $pdo->prepare($itemSQL);


    /*
    |--------------------------------------------------------------------------
    | Reduce stock
    |--------------------------------------------------------------------------
    */

    $stockSQL = "
        UPDATE products
        SET stock = stock - ?
        WHERE id = ?
    ";

    $stockStmt = $pdo->prepare($stockSQL);


    foreach ($items as $item) {

        $productId = (int)$item["product_id"];
        $quantity = (int)$item["quantity"];
        $price = (float)$item["price"];

        $itemSubtotal =
            $price * $quantity;


        /*
        | Insert order item
        */

        $itemStmt->execute([
            $orderId,
            $productId,
            $item["name"],
            $price,
            $quantity,
            $itemSubtotal
        ]);


        /*
        | Reduce product stock
        */

        $stockStmt->execute([
            $quantity,
            $productId
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Clear cart
    |--------------------------------------------------------------------------
    */

    $deleteSQL = "
        DELETE FROM cart_items
        WHERE cart_id = ?
    ";

    $deleteStmt = $pdo->prepare($deleteSQL);

    $deleteStmt->execute([
        $cartId
    ]);


    /*
    |--------------------------------------------------------------------------
    | Commit transaction
    |--------------------------------------------------------------------------
    */

    $pdo->commit();


    /*
    |--------------------------------------------------------------------------
    | Success response
    |--------------------------------------------------------------------------
    */

   response(
    true,
    "Order created successfully",
    [
        "order_id" => $orderId,
        "order_number" => $orderNumber
    ]
);


} catch (Throwable $e) {


    /*
    |--------------------------------------------------------------------------
    | Rollback
    |--------------------------------------------------------------------------
    */

    if ($pdo->inTransaction()) {

        $pdo->rollBack();
    }


    /*
    |--------------------------------------------------------------------------
    | Log actual error
    |--------------------------------------------------------------------------
    */

    error_log(
        "CREATE ORDER ERROR: " .
        $e->getMessage()
    );


    /*
    |--------------------------------------------------------------------------
    | Return actual error during development
    |--------------------------------------------------------------------------
    */

    response(
        false,
        "Order creation failed: " . $e->getMessage(),
        null,
        500
    );

    exit;
}

