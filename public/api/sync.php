<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$userId = requireAuthenticatedUser();

if ($method === 'GET') {
    $restaurant_id = isset($_GET['restaurant_id']) ? trim($_GET['restaurant_id']) : 'rest-demo';
    requireRestaurantMembership($pdo, $userId, $restaurant_id);

    try {
        $stmt = $pdo->prepare("SELECT data_key, data_json, updated_at FROM food_state WHERE restaurant_id = ?");
        $stmt->execute([$restaurant_id]);
        $rows = $stmt->fetchAll();

        $data = [];
        foreach ($rows as $row) {
            $data[$row['data_key']] = json_decode($row['data_json'], true);
        }

        echo json_encode([
            'status' => 'success',
            'restaurant_id' => $restaurant_id,
            'data' => $data,
            'server_timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

if ($method === 'POST') {
    $raw_input = file_get_contents('php://input');
    $payload = json_decode($raw_input, true);

    if (!$payload || !isset($payload['restaurant_id'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'restaurant_id é obrigatório'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $restaurant_id = trim($payload['restaurant_id']);
    requireRestaurantMembership($pdo, $userId, $restaurant_id);

    try {
        $pdo->beginTransaction();

        // 1. Atualizar ou inserir restaurante se veio na requisição
        if (isset($payload['restaurant_name'])) {
            $stmtRest = $pdo->prepare("INSERT INTO food_restaurants (id, name, city) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), city = VALUES(city)");
            $stmtRest->execute([$restaurant_id, $payload['restaurant_name'], $payload['restaurant_city'] ?? '']);
        }

        // 2. Gravar os dados de estado (chaves individuais ou batch)
        $itemsToSave = [];
        if (isset($payload['items']) && is_array($payload['items'])) {
            $itemsToSave = $payload['items'];
        } elseif (isset($payload['key']) && isset($payload['data'])) {
            $itemsToSave[$payload['key']] = $payload['data'];
        }

        $stmtState = $pdo->prepare("
            INSERT INTO food_state (restaurant_id, data_key, data_json, updated_at)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE data_json = VALUES(data_json), updated_at = NOW()
        ");

        foreach ($itemsToSave as $k => $v) {
            $jsonValue = json_encode($v, JSON_UNESCAPED_UNICODE);
            $stmtState->execute([$restaurant_id, $k, $jsonValue]);
        }

        $pdo->commit();

        echo json_encode([
            'status' => 'success',
            'restaurant_id' => $restaurant_id,
            'updated_keys' => array_keys($itemsToSave),
            'server_timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}
