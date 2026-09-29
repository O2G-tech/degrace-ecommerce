<?php
header("Content-Type: application/json");
require_once __DIR__ . '/helpers/cors.php';

echo json_encode([
    "status" => "online",
    "service" => "DE-GRACE Luxury E-Commerce API",
    "version" => "1.0.0",
    "timestamp" => date("c")
]);
