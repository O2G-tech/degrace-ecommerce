<?php
header("Content-Type: application/json");
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/database.php';

try {
    // Check if tables already exist
    $check = $pdo->query("SHOW TABLES LIKE 'users'");
    $exists = $check->rowCount() > 0;

    $sqlFile = __DIR__ . '/database.sql';
    if (!file_exists($sqlFile)) {
        echo json_encode(["success" => false, "message" => "database.sql file not found"]);
        exit;
    }

    $sql = file_get_contents($sqlFile);

    // Disable foreign key checks and execute commands
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec($sql);
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    echo json_encode([
        "success" => true,
        "message" => "Database successfully initialized and migrated!",
        "was_existing" => $exists
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Migration failed: " . $e->getMessage()
    ]);
}
