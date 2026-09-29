<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";
require_once "../config/paystack.php";


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
| Get request data
|--------------------------------------------------------------------------
*/

$data = json_decode(
    file_get_contents("php://input"),
    true
);


$orderId = isset($data["order_id"])
    ? (int)$data["order_id"]
    : 0;

$email = trim(
    $data["email"] ?? ""
);


/*
|--------------------------------------------------------------------------
| Validate
|--------------------------------------------------------------------------
*/

if ($orderId <= 0) {

    response(
        false,
        "Order ID is required",
        null,
        400
    );

    exit;
}


if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {

    response(
        false,
        "Valid email is required",
        null,
        400
    );

    exit;
}


/*
|--------------------------------------------------------------------------
| Get order
|--------------------------------------------------------------------------
*/

try {

    $stmt = $pdo->prepare("
        SELECT
            id,
            order_number,
            email,
            total,
            payment_status,
            status
        FROM orders
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $orderId
    ]);

    $order = $stmt->fetch(
        PDO::FETCH_ASSOC
    );


    if (!$order) {

        response(
            false,
            "Order not found",
            null,
            404
        );

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Prevent paying an already paid order
    |--------------------------------------------------------------------------
    */

    if (
        strtolower(
            $order["payment_status"]
        ) === "paid"
    ) {

        response(
            false,
            "This order has already been paid",
            null,
            400
        );

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Amount
    |--------------------------------------------------------------------------
    |
    | Paystack expects amount in the smallest currency unit.
    |
    | ₦35,000
    |
    | becomes
    |
    | 3500000
    |
    */

    $amount = (int)round(
        ((float)$order["total"]) * 100
    );


    if ($amount <= 0) {

        response(
            false,
            "Invalid order amount",
            null,
            400
        );

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Generate unique reference
    |--------------------------------------------------------------------------
    */

    $reference =
        "JUMIA-" .
        $order["order_number"] .
        "-" .
        time();


    /*
    |--------------------------------------------------------------------------
    | Paystack request
    |--------------------------------------------------------------------------
    */

    $payload = [

        "email" => $email,

        "amount" => $amount,

        "currency" => "NGN",

        "reference" => $reference,

        "callback_url" =>
            "http://localhost:5173/payment/callback",

        "metadata" => [

            "order_id" =>
                $order["id"],

            "order_number" =>
                $order["order_number"]

        ]

    ];


    $ch = curl_init(
        PAYSTACK_BASE_URL .
        "/transaction/initialize"
    );


    curl_setopt_array(
        $ch,
        [

            CURLOPT_POST => true,

            CURLOPT_POSTFIELDS =>
                json_encode($payload),

            CURLOPT_RETURNTRANSFER =>
                true,

            CURLOPT_HTTPHEADER => [

                "Authorization: Bearer " .
                PAYSTACK_SECRET_KEY,

                "Content-Type: application/json"

            ]

        ]
    );


    $result = curl_exec($ch);

    $httpCode =
        curl_getinfo(
            $ch,
            CURLINFO_HTTP_CODE
        );


    if ($result === false) {

        $curlError =
            curl_error($ch);

        curl_close($ch);

        error_log(
            "PAYSTACK CURL ERROR: " .
            $curlError
        );

        response(
            false,
            "Unable to connect to payment gateway",
            null,
            500
        );

        exit;
    }


    curl_close($ch);


    $paystackResponse =
        json_decode(
            $result,
            true
        );


    if (
        $httpCode < 200 ||
        $httpCode >= 300 ||
        empty($paystackResponse["status"])
    ) {

        error_log(
            "PAYSTACK INITIALIZE ERROR: " .
            $result
        );

        response(
            false,
            $paystackResponse["message"] ??
            "Payment initialization failed",
            null,
            500
        );

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Save pending payment
    |--------------------------------------------------------------------------
    */

    $paymentStmt = $pdo->prepare("
        INSERT INTO payments
        (
            order_id,
            user_id,
            provider,
            reference,
            transaction_id,
            amount,
            currency,
            status,
            gateway_response
        )
        SELECT
            o.id,
            o.user_id,
            'paystack',
            ?,
            NULL,
            ?,
            'NGN',
            'pending',
            ?
        FROM orders o
        WHERE o.id = ?
    ");


    $paymentStmt->execute([

        $reference,

        $order["total"],

        json_encode(
            $paystackResponse
        ),

        $orderId

    ]);


    /*
    |--------------------------------------------------------------------------
    | Return payment information to React
    |--------------------------------------------------------------------------
    */

    response(

        true,

        "Payment initialized successfully",

        [

            "order_id" =>
                $order["id"],

            "order_number" =>
                $order["order_number"],

            "reference" =>
                $paystackResponse["data"]["reference"],

            "authorization_url" =>
                $paystackResponse["data"]["authorization_url"],

            "access_code" =>
                $paystackResponse["data"]["access_code"]

        ]

    );


} catch (PDOException $e) {

    error_log(
        "PAYMENT INITIALIZE ERROR: " .
        $e->getMessage()
    );

    response(
        false,
        "Failed to initialize payment",
        null,
        500
    );
}