<?php

require_once "helpers/cors.php";
require_once "config/database.php";

echo json_encode([
    "success" => true,
    "message" => "PHP API and MySQL connection are working"
]);