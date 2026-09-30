<?php
if (!ob_get_level()) {
    ob_start();
}

// Session initialization with Bearer token & Cross-Site support
if (session_status() === PHP_SESSION_NONE) {
    $bearerToken = null;
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (!$authHeader && function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $headers['AUTHORIZATION'] ?? '';
    }

    if ($authHeader && preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        $bearerToken = trim($matches[1]);
    } elseif (isset($_SERVER['HTTP_X_SESSION_ID'])) {
        $bearerToken = trim($_SERVER['HTTP_X_SESSION_ID']);
    }

    if ($bearerToken && !empty($bearerToken) && $bearerToken !== "null" && $bearerToken !== "undefined") {
        if (preg_match('/^[-,a-zA-Z0-9]{1,128}$/', $bearerToken)) {
            session_id($bearerToken);
        }
    }

    // Set secure cross-site cookie attributes
    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params([
            'lifetime' => 86400 * 30,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'None'
        ]);
    }

    session_start();
}

/**
 * Require any authenticated user (customer or admin).
 * Returns user_id if authenticated, otherwise terminates with 401.
 */
function requireLogin()
{
    if (!isset($_SESSION["user_id"]) || empty($_SESSION["user_id"])) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Please sign in to your client account to continue."
        ]);
        exit;
    }

    return (int) $_SESSION["user_id"];
}

/**
 * Require administrator privileges.
 */
function requireAdmin()
{
    if (!isset($_SESSION["user_id"]) || empty($_SESSION["user_id"])) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Authentication required. Please log in as administrator."
        ]);
        exit;
    }

    $role = $_SESSION["role"] ?? "";
    if ($role !== "admin") {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Access denied. Administrator privileges required."
        ]);
        exit;
    }

    return (int) $_SESSION["user_id"];
}

/**
 * Get current authenticated user info from session without exiting.
 */
function getAuthUser()
{
    if (!isset($_SESSION["user_id"])) {
        return null;
    }

    return [
        "id" => (int) $_SESSION["user_id"],
        "role" => $_SESSION["role"] ?? "customer"
    ];
}
