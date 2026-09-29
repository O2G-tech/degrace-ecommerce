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


$data = json_decode(
    file_get_contents("php://input"),
    true
);


$reference =
    trim(
        $data["reference"] ?? ""
    );


if ($reference === "") {

    response(
        false,
        "Payment reference is required",
        null,
        400
    );

    exit;
}


try {

    /*
    |--------------------------------------------------------------------------
    | Find payment
    |--------------------------------------------------------------------------
    */

    $paymentStmt = $pdo->prepare("
        SELECT
            id,
            order_id,
            amount,
            status
        FROM payments
        WHERE reference = ?
        LIMIT 1
    ");

    $paymentStmt->execute([
        $reference
    ]);


    $payment =
        $paymentStmt->fetch(
            PDO::FETCH_ASSOC
        );


    if (!$payment) {

        response(
            false,
            "Payment record not found",
            null,
            404
        );

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Ask Paystack to verify transaction
    |--------------------------------------------------------------------------
    */

    $url =
        PAYSTACK_BASE_URL .
        "/transaction/verify/" .
        urlencode($reference);


    $ch = curl_init($url);


    curl_setopt_array(
        $ch,
        [

            CURLOPT_RETURNTRANSFER =>
                true,

            CURLOPT_HTTPHEADER => [

                "Authorization: Bearer " .
                PAYSTACK_SECRET_KEY,

                "Content-Type: application/json"

            ]

        ]
    );


    $result =
        curl_exec($ch);


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
            "PAYSTACK VERIFY CURL ERROR: " .
            $curlError
        );

        response(
            false,
            "Unable to verify payment",
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

        response(
            false,
            "Payment verification failed",
            null,
            400
        );

        exit;
    }


    $transaction =
        $paystackResponse["data"];


    /*
    |--------------------------------------------------------------------------
    | Check transaction status
    |--------------------------------------------------------------------------
    */

    if (
        ($transaction["status"] ?? "") !==
        "success"
    ) {

        $updatePayment =
            $pdo->prepare("
                UPDATE payments
                SET
                    status = ?,
                    gateway_response = ?,
                    updated_at = NOW()
                WHERE reference = ?
            ");


        $updatePayment->execute([

            $transaction["status"] ??
            "failed",

            json_encode(
                $paystackResponse
            ),

            $reference

        ]);


        response(
            false,
            "Payment was not successful",
            [
                "status" =>
                    $transaction["status"] ??
                    "failed"
            ],
            400
        );

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Verify amount
    |--------------------------------------------------------------------------
    |
    | VERY IMPORTANT.
    |
    | Paystack amount is in kobo.
    |
    */

    $expectedAmount =
        (int)round(
            ((float)$payment["amount"]) * 100
        );


    $paidAmount =
        (int)$transaction["amount"];


    if (
        $paidAmount !==
        $expectedAmount
    ) {

        response(
            false,
            "Payment amount does not match order amount",
            null,
            400
        );

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Prevent duplicate processing
    |--------------------------------------------------------------------------
    */

    $pdo->beginTransaction();


    /*
    |--------------------------------------------------------------------------
    | Update payment
    |--------------------------------------------------------------------------
    */

    $updatePayment =
        $pdo->prepare("
            UPDATE payments
            SET
                transaction_id = ?,
                status = 'success',
                gateway_response = ?,
                paid_at = ?,
                updated_at = NOW()
            WHERE reference = ?
        ");


    $updatePayment->execute([

        $transaction["id"] ?? null,

        json_encode(
            $paystackResponse
        ),

        $transaction["paid_at"] ??
        date("Y-m-d H:i:s"),

        $reference

    ]);


    /*
    |--------------------------------------------------------------------------
    | Update order
    |--------------------------------------------------------------------------
    */

    $updateOrder =
        $pdo->prepare("
            UPDATE orders
            SET
                payment_status = 'paid',
                status = 'Processing',
                payment_method = 'paystack',
                updated_at = NOW()
            WHERE id = ?
        ");


    $updateOrder->execute([

        $payment["order_id"]

    ]);


    $pdo->commit();


    response(

        true,

        "Payment verified successfully",

        [

            "reference" =>
                $reference,

            "transaction_id" =>
                $transaction["id"] ?? null,

            "amount" =>
                $transaction["amount"],

            "currency" =>
                $transaction["currency"],

            "status" =>
                "success",

            "order_id" =>
                $payment["order_id"]

        ]

    );


} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }


    error_log(
        "PAYMENT VERIFY ERROR: " .
        $e->getMessage()
    );


    response(
        false,
        "Failed to verify payment",
        null,
        500
    );
}