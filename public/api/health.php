<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $stmt = $pdo->query("SELECT 1 as connected, NOW() as server_time");
    $result = $stmt->fetch();

    echo json_encode([
        'status' => 'online',
        'database' => 'connected',
        'database_name' => $db_name,
        'server_time' => $result['server_time'],
        'official_domain' => 'https://sistemafoods.xll.com.br'
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'offline',
        'database' => 'error',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
