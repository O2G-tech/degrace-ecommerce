
<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../config/database.php";


/*
|--------------------------------------------------------------------------
| Only allow GET requests
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
| Get query parameters
|--------------------------------------------------------------------------
*/

$page = isset($_GET["page"])
    ? max(1, (int) $_GET["page"])
    : 1;

$limit = isset($_GET["limit"])
    ? max(1, min(100, (int) $_GET["limit"]))
    : 12;

$search = trim(
    $_GET["search"] ?? ""
);

$categoryId = trim(
    $_GET["category_id"] ?? ""
);

$sort = $_GET["sort"] ?? "latest";


$offset = ($page - 1) * $limit;


/*
|--------------------------------------------------------------------------
| Sorting
|--------------------------------------------------------------------------
*/

switch ($sort) {

    case "price_low":
        $orderBy = "p.price ASC";
        break;

    case "price_high":
        $orderBy = "p.price DESC";
        break;

    case "name_asc":
        $orderBy = "p.name ASC";
        break;

    case "name_desc":
        $orderBy = "p.name DESC";
        break;

    case "latest":
    default:
        $orderBy = "p.created_at DESC";
        break;
}


/*
|--------------------------------------------------------------------------
| Build WHERE conditions
|--------------------------------------------------------------------------
*/

$where = [];

$params = [];


/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

if ($search !== "") {

    $where[] = "
        (
            p.name LIKE ?
            OR p.description LIKE ?
        )
    ";

    $searchValue = "%" . $search . "%";

    $params[] = $searchValue;
    $params[] = $searchValue;
}


/*
|--------------------------------------------------------------------------
| Category filter
|--------------------------------------------------------------------------
*/

if (
    $categoryId !== "" &&
    is_numeric($categoryId)
) {

    $where[] = "p.category_id = ?";

    $params[] = (int) $categoryId;
}


/*
|--------------------------------------------------------------------------
| WHERE SQL
|--------------------------------------------------------------------------
*/

$whereSQL = "";

if (!empty($where)) {

    $whereSQL =
        "WHERE " .
        implode(
            " AND ",
            $where
        );
}


try {

    /*
    |--------------------------------------------------------------------------
    | Count products
    |--------------------------------------------------------------------------
    */

    $countSQL = "
        SELECT COUNT(*)
        FROM products p
        $whereSQL
    ";


    $countStmt =
        $pdo->prepare(
            $countSQL
        );


    $countStmt->execute(
        $params
    );


    $totalProducts =
        (int) $countStmt->fetchColumn();


    /*
    |--------------------------------------------------------------------------
    | Get products
    |--------------------------------------------------------------------------
    */

    $sql = "
        SELECT

            p.id,
            p.category_id,
            p.name,
            p.slug,
            p.description,
            p.price,
            p.stock,
            p.image,
            p.created_at,

            c.name AS category_name,

            COALESCE((
                SELECT r.rating
                FROM reviews r
                WHERE r.product_id = p.id
                AND r.status = 'approved'
                GROUP BY r.rating
                ORDER BY COUNT(*) DESC, r.rating DESC
                LIMIT 1
            ), 0) AS majority_rating

        FROM products p

        LEFT JOIN categories c
            ON c.id = p.category_id

        $whereSQL

        ORDER BY $orderBy

        LIMIT $limit
        OFFSET $offset
    ";


    $stmt =
        $pdo->prepare(
            $sql
        );


    $stmt->execute(
        $params
    );


    $products =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    $totalPages =
        $limit > 0
            ? (int) ceil(
                $totalProducts / $limit
            )
            : 0;


    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    response(
        true,
        "Products loaded successfully",
        [
            "products" => $products,

            "pagination" => [
                "page" =>
                    $page,

                "limit" =>
                    $limit,

                "total" =>
                    $totalProducts,

                "total_pages" =>
                    $totalPages
            ]
        ]
    );


} catch (PDOException $e) {

    error_log(
        "Products API Error: " .
        $e->getMessage()
    );


    response(
        false,
        "Failed to load products",
        null,
        500
    );
}
