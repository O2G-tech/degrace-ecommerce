<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";


/*
|--------------------------------------------------------------------------
| Only GET requests
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    response(
        false,
        "Only GET requests are allowed",
        null,
        405
    );

    exit;
}


/*
|--------------------------------------------------------------------------
| Get parent category ID
|--------------------------------------------------------------------------
*/

$parentId = $_GET["parent_id"] ?? null;


if (
    $parentId === null ||
    !is_numeric($parentId)
) {

    response(
        false,
        "Parent category ID is required",
        null,
        400
    );

    exit;
}


/*
|--------------------------------------------------------------------------
| Get child categories
|--------------------------------------------------------------------------
*/

try {

    $stmt = $pdo->prepare("
        SELECT
            id,
            parent_id,
            name,
            slug,
            image

        FROM categories

        WHERE parent_id = ?

        ORDER BY name ASC
    ");


    $stmt->execute([
        (int) $parentId
    ]);


    $categories =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    /*
    |--------------------------------------------------------------------------
    | Return response
    |--------------------------------------------------------------------------
    */

    response(
        true,
        "Subcategories loaded successfully",
        $categories
    );


} catch (PDOException $e) {

    error_log(
        "Subcategory error: " .
        $e->getMessage()
    );


    response(
        false,
        "Failed to load subcategories",
        null,
        500
    );

}
