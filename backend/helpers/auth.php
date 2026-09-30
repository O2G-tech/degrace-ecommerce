<?php
if (!ob_get_level()) {
    ob_start();
}

// -------------------------------------------------------
// Token-based authentication (stateless, works on Render)
// -------------------------------------------------------
// We read the Bearer token from the Authorization header or
// X-Session-ID header, then look it up in the user_tokens
// table in the database to get the user_id and role.
// PHP sessions are NOT used for auth — they cannot persist
// on stateless cloud hosts like Render.com.
// -------------------------------------------------------

function _getTokenFromRequest(): ?string
{
    // 1. Try Authorization: Bearer <token>
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (!$authHeader && function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization']
            ?? $headers['authorization']
            ?? $headers['AUTHORIZATION']
            ?? '';
    }

    if ($authHeader && preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        return trim($matches[1]);
    }

    // 2. Try X-Session-ID header
    if (!empty($_SERVER['HTTP_X_SESSION_ID'])) {
        return trim($_SERVER['HTTP_X_SESSION_ID']);
    }

    return null;
}

function _lookupToken(string $token): ?array
{
    global $pdo;

    if (!$pdo || empty($token) || $token === 'null' || $token === 'undefined') {
        return null;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT ut.user_id, u.role, u.name, u.email, u.status
            FROM user_tokens ut
            JOIN users u ON u.id = ut.user_id
            WHERE ut.token = ?
              AND (ut.expires_at IS NULL OR ut.expires_at > NOW())
            LIMIT 1
        ");
        $stmt->execute([$token]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    } catch (Exception $e) {
        return null;
    }
}

/**
 * Require any authenticated user (customer or admin).
 * Returns user_id if authenticated, otherwise terminates with 401.
 */
function requireLogin(): int
{
    $token = _getTokenFromRequest();

    if ($token) {
        $userData = _lookupToken($token);
        if ($userData && !empty($userData['user_id']) && $userData['status'] === 'active') {
            return (int) $userData['user_id'];
        }
    }

    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Please sign in to your client account to continue."
    ]);
    exit;
}

/**
 * Require administrator privileges.
 */
function requireAdmin(): int
{
    $token = _getTokenFromRequest();

    if ($token) {
        $userData = _lookupToken($token);
        if ($userData && !empty($userData['user_id'])) {
            if ($userData['status'] !== 'active') {
                http_response_code(403);
                echo json_encode([
                    "success" => false,
                    "message" => "Your account has been deactivated."
                ]);
                exit;
            }
            if ($userData['role'] === 'admin') {
                return (int) $userData['user_id'];
            }
            http_response_code(403);
            echo json_encode([
                "success" => false,
                "message" => "Access denied. Administrator privileges required."
            ]);
            exit;
        }
    }

    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Authentication required. Please log in as administrator."
    ]);
    exit;
}

/**
 * Get current authenticated user info without exiting.
 */
function getAuthUser(): ?array
{
    $token = _getTokenFromRequest();
    if (!$token) return null;
    return _lookupToken($token);
}
