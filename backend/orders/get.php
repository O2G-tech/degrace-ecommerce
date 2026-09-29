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


session_start();


/*
|--------------------------------------------------------------------------
| Check login
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION["user_id"])) {

    response(
        false,
        "Please login first",
        null,
        401
    );

    exit;
}


$userId =
    (int) $_SESSION["user_id"];


try {


    /*
    |--------------------------------------------------------------------------
    | Get orders
    |--------------------------------------------------------------------------
    */

    $sql = "

        SELECT

            id,

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

            total,

            created_at,

            updated_at

        FROM orders

        WHERE user_id = ?

        ORDER BY created_at DESC

    ";


    $stmt =
        $pdo->prepare(
            $sql
        );


    $stmt->execute([
        $userId
    ]);


    $orders =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    response(

        true,

        "Orders loaded successfully",

        $orders

    );


} catch (PDOException $e) {


    error_log(
        "Get Orders Error: " .
        $e->getMessage()
    );


    response(

        false,

        "Failed to load orders",

        null,

        500

    );

}

