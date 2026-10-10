<?php
require_once __DIR__ . '/config.php';

function userPayload(PDO $pdo, string $userId): array {
    $userStmt = $pdo->prepare('SELECT id, name, email FROM food_users WHERE id = ?');
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch();
    if (!$user) {
        respondJson(['status' => 'error', 'message' => 'Sessão inválida.'], 401);
    }

    $restaurantStmt = $pdo->prepare('SELECT r.id, r.name, r.city, m.role FROM food_restaurants r INNER JOIN food_restaurant_memberships m ON m.restaurant_id = r.id WHERE m.user_id = ? ORDER BY r.created_at');
    $restaurantStmt->execute([$userId]);

    return ['user' => $user, 'restaurants' => $restaurantStmt->fetchAll()];
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET' && $action === 'session') {
    $userId = currentUserId();
    if (!$userId) respondJson(['status' => 'unauthenticated']);
    respondJson(['status' => 'authenticated', ...userPayload($pdo, $userId)]);
}

if ($method !== 'POST') {
    respondJson(['status' => 'error', 'message' => 'Método não permitido.'], 405);
}

$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) respondJson(['status' => 'error', 'message' => 'Dados inválidos.'], 400);
$action = $payload['action'] ?? '';

if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    respondJson(['status' => 'success']);
}

$email = strtolower(trim((string)($payload['email'] ?? '')));
$password = (string)($payload['password'] ?? '');
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
    respondJson(['status' => 'error', 'message' => 'Informe e-mail válido e senha com ao menos 8 caracteres.'], 422);
}

if ($action === 'register') {
    $name = trim((string)($payload['name'] ?? ''));
    $restaurantName = trim((string)($payload['restaurant_name'] ?? ''));
    $city = trim((string)($payload['restaurant_city'] ?? ''));
    if ($name === '' || $restaurantName === '') {
        respondJson(['status' => 'error', 'message' => 'Informe seu nome e o nome do restaurante.'], 422);
    }

    try {
        $pdo->beginTransaction();
        $userId = bin2hex(random_bytes(16));
        $restaurantId = 'rest-' . bin2hex(random_bytes(8));
        $userStmt = $pdo->prepare('INSERT INTO food_users (id, name, email, password_hash) VALUES (?, ?, ?, ?)');
        $userStmt->execute([$userId, $name, $email, password_hash($password, PASSWORD_DEFAULT)]);
        $restaurantStmt = $pdo->prepare('INSERT INTO food_restaurants (id, name, city) VALUES (?, ?, ?)');
        $restaurantStmt->execute([$restaurantId, $restaurantName, $city]);
        $membershipStmt = $pdo->prepare("INSERT INTO food_restaurant_memberships (restaurant_id, user_id, role) VALUES (?, ?, 'gerente')");
        $membershipStmt->execute([$restaurantId, $userId]);
        $pdo->commit();
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        respondJson(['status' => 'authenticated', ...userPayload($pdo, $userId)], 201);
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        if ((string)$error->getCode() === '23000') respondJson(['status' => 'error', 'message' => 'Este e-mail já está cadastrado.'], 409);
        error_log('Sistema Food registration error: ' . $error->getMessage());
        respondJson(['status' => 'error', 'message' => 'Não foi possível criar a conta.'], 500);
    }
}

if ($action === 'login') {
    $stmt = $pdo->prepare('SELECT id, password_hash FROM food_users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password_hash'])) {
        respondJson(['status' => 'error', 'message' => 'E-mail ou senha inválidos.'], 401);
    }
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    respondJson(['status' => 'authenticated', ...userPayload($pdo, $user['id'])]);
}

respondJson(['status' => 'error', 'message' => 'Ação inválida.'], 400);
