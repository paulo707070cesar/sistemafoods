<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $sql = file_get_contents(__DIR__ . '/schema.sql');
    if (!$sql) {
        throw new Exception("Arquivo schema.sql não encontrado.");
    }

    $pdo->exec($sql);

    echo json_encode([
        'status' => 'success',
        'message' => 'Tabelas criadas/verificadas com sucesso no banco u940098558_sistemafoods!',
        'tables' => ['food_restaurants', 'food_users', 'food_restaurant_memberships', 'food_state', 'food_transactions', 'food_orders']
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erro ao inicializar tabelas: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
