<?php
header('Content-Type: application/json; charset=utf-8');

try {
    require_once __DIR__ . '/config.php';
    $stmt = $pdo->query("SELECT 1 as connected, NOW() as server_time");
    $result = $stmt->fetch();

    echo json_encode([
        'status' => 'online',
        'database' => 'connected',
        'database_name' => $db_name,
        'server_time' => $result['server_time'],
        'official_domain' => 'https://sistemafoods.xll.com.br'
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    error_log('Sistema Food health check error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'offline',
        'database' => 'error',
        'message' => 'Não foi possível verificar a conexão. Consulte o log de erros da hospedagem.'
    ], JSON_UNESCAPED_UNICODE);
}
