<?php

require_once "../helpers/cors.php";
require_once "../helpers/response.php";
require_once "../helpers/auth.php";
require_once "../config/database.php";

$adminId = requireAdmin();

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $search = trim($_GET["search"] ?? "");
    $role = trim($_GET["role"] ?? "all");
    $status = trim($_GET["status"] ?? "all");

    $where = ["1=1"];
    $params = [];

    if ($role !== "all" && in_array($role, ["customer", "admin"])) {
        $where[] = "u.role = ?";
        $params[] = $role;
    }

    if ($status !== "all" && in_array($status, ["active", "inactive"])) {
        $where[] = "u.status = ?";
        $params[] = $status;
    }

    if ($search !== "") {
        $where[] = "(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
        $wildcard = "%" . $search . "%";
        $params[] = $wildcard;
        $params[] = $wildcard;
        $params[] = $wildcard;
    }

    $whereClause = implode(" AND ", $where);

    try {
        $sql = "
            SELECT
                u.id,
                u.name,
                u.email,
                u.phone,
                u.role,
                u.status,
                u.created_at,
                COUNT(o.id) AS order_count,
                COALESCE(SUM(CASE WHEN o.status != 'Cancelled' THEN o.total ELSE 0 END), 0) AS total_spent
            FROM users u
            LEFT JOIN orders o ON o.user_id = u.id
            WHERE $whereClause
            GROUP BY u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at
            ORDER BY u.id DESC
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        response(true, "Users loaded successfully", $users);

    } catch (PDOException $e) {
        error_log("Admin Users List Error: " . $e->getMessage());
        response(false, "Failed to load users", null, 500);
    }
}

if ($method === "POST" || $method === "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data && !empty($_POST)) {
        $data = $_POST;
    }

    $userId = isset($data["id"]) ? (int) $data["id"] : (int) ($data["user_id"] ?? 0);
    $action = $data["action"] ?? "update";

    if ($userId <= 0) {
        response(false, "Valid User ID is required", null, 422);
    }

    try {
        // Toggle status
        if ($action === "toggle_status" || isset($data["status"])) {
            $newStatus = $data["status"] ?? null;
            if (!$newStatus) {
                // Fetch current status and toggle
                $curr = $pdo->prepare("SELECT status FROM users WHERE id = ?");
                $curr->execute([$userId]);
                $currStatus = $curr->fetchColumn();
                $newStatus = ($currStatus === "inactive") ? "active" : "inactive";
            }

            if (!in_array($newStatus, ["active", "inactive"])) {
                response(false, "Invalid status value", null, 422);
            }

            // Prevent deactivating own admin account
            if ($userId === $adminId && $newStatus === "inactive") {
                response(false, "You cannot deactivate your own administrator account", null, 400);
            }

            $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE id = ?");
            $stmt->execute([$newStatus, $userId]);

            response(true, "User status updated to '$newStatus'", ["id" => $userId, "status" => $newStatus]);
        }

        // Change role
        if (isset($data["role"])) {
            $newRole = $data["role"];
            if (!in_array($newRole, ["customer", "admin"])) {
                response(false, "Invalid role value", null, 422);
            }

            if ($userId === $adminId && $newRole !== "admin") {
                response(false, "You cannot remove your own admin privileges", null, 400);
            }

            $stmt = $pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
            $stmt->execute([$newRole, $userId]);

            response(true, "User role updated to '$newRole'", ["id" => $userId, "role" => $newRole]);
        }

        // General profile update
        $name = trim($data["name"] ?? "");
        $phone = trim($data["phone"] ?? "");
        if ($name === "") {
            response(false, "User name is required", null, 422);
        }

        $stmt = $pdo->prepare("UPDATE users SET name = ?, phone = ? WHERE id = ?");
        $stmt->execute([$name, $phone, $userId]);

        response(true, "User details updated successfully", ["id" => $userId, "name" => $name, "phone" => $phone]);

    } catch (PDOException $e) {
        error_log("Admin Users Update Error: " . $e->getMessage());
        response(false, "Failed to update user", null, 500);
    }
}

if ($method === "DELETE") {
    $data = json_decode(file_get_contents("php://input"), true);
    $userId = isset($data["id"]) ? (int) $data["id"] : (int) ($_GET["id"] ?? 0);

    if ($userId <= 0) {
        response(false, "Valid User ID is required", null, 422);
    }

    if ($userId === $adminId) {
        response(false, "You cannot delete your own administrator account", null, 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);

        response(true, "User deleted successfully");

    } catch (PDOException $e) {
        error_log("Admin Users Delete Error: " . $e->getMessage());
        response(false, "Failed to delete user: " . $e->getMessage(), null, 500);
    }
}

response(false, "Method not allowed", null, 405);
