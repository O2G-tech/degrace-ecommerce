<?php

session_start();

header("Content-Type: application/json");

function requireLogin()
{
    if (!isset($_SESSION["user_id"])) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Please login to continue"
        ]);

        exit;
    }

    return (int) $_SESSION["user_id"];
}