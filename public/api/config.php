<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_name('sistema_food_session');
session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Lax',
    'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
]);
session_start();

$localConfigPaths = [__DIR__ . '/config.local.php'];
for ($level = 1; $level <= 6; $level++) {
    $localConfigPaths[] = dirname(__DIR__, $level) . '/config/config.local.php';
}
$localConfigPath = null;
foreach ($localConfigPaths as $candidatePath) {
    if (is_file($candidatePath)) {
        $localConfigPath = $candidatePath;
        break;
    }
}
if (!$localConfigPath) {
    respondJson(['status' => 'error', 'message' => 'Configuração do banco não encontrada.'], 500);
}

$databaseConfig = require $localConfigPath;
$db_host = $databaseConfig['host'] ?? '';
$db_name = $databaseConfig['name'] ?? '';
$db_user = $databaseConfig['user'] ?? '';
$db_pass = $databaseConfig['password'] ?? '';

if ($db_host === '' || $db_name === '' || $db_user === '' || $db_pass === '') {
    respondJson(['status' => 'error', 'message' => 'Configuração do banco está incompleta.'], 500);
}

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (Throwable $e) {
    error_log('Sistema Food database connection error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Falha ao conectar com o banco de dados. Consulte o log de erros da hospedagem.'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

function respondJson(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit();
}

function currentUserId(): ?string {
    return isset($_SESSION['user_id']) && is_string($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
}

function requireAuthenticatedUser(): string {
    $userId = currentUserId();
    if (!$userId) {
        respondJson(['status' => 'error', 'message' => 'Autenticação obrigatória.'], 401);
    }
    return $userId;
}

function requireRestaurantMembership(PDO $pdo, string $userId, string $restaurantId): string {
    $stmt = $pdo->prepare('SELECT role FROM food_restaurant_memberships WHERE restaurant_id = ? AND user_id = ?');
    $stmt->execute([$restaurantId, $userId]);
    $role = $stmt->fetchColumn();
    if (!$role) {
        respondJson(['status' => 'error', 'message' => 'Acesso não autorizado para este restaurante.'], 403);
    }
    return $role;
}
