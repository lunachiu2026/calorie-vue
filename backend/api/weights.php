<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';
requireMethod('GET', 'PUT', 'PATCH', 'DELETE');
$userId = requireUserId();
$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') requireCsrf();
$db = database();
if ($method === 'GET') {
    $query = $db->prepare('SELECT id, record_date, weight_kg FROM weight_records WHERE user_id = ? ORDER BY record_date');
    $query->execute([$userId]);
    $records = array_map(fn($r) => ['id' => (int) $r['id'], 'date' => $r['record_date'], 'weight' => (float) $r['weight_kg']], $query->fetchAll());
    $query = $db->prepare('SELECT target_kg FROM weight_goals WHERE user_id = ?');
    $query->execute([$userId]);
    $target = $query->fetchColumn();
    respond(['ok' => true, 'records' => $records, 'target' => $target === false ? null : (float) $target]);
}
$payload = requestJson();
if ($method === 'DELETE') {
    $id = filter_var($payload['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id || $id < 1) respond(['ok' => false, 'message' => '請指定有效紀錄'], 422);
    $query = $db->prepare('DELETE FROM weight_records WHERE id = ? AND user_id = ?');
    $query->execute([$id, $userId]);
    if (!$query->rowCount()) respond(['ok' => false, 'message' => '找不到紀錄'], 404);
    respond(['ok' => true]);
}
$weight = filter_var($payload[$method === 'PATCH' ? 'target' : 'weight'] ?? null, FILTER_VALIDATE_FLOAT);
if ($weight === false || !is_finite($weight) || $weight < 20 || $weight > 300) {
    respond(['ok' => false, 'message' => '體重須為 20–300 kg 的有效數字'], 422);
}
if ($method === 'PATCH') {
    $query = $db->prepare('INSERT INTO weight_goals (user_id, target_kg) VALUES (?, ?) ON DUPLICATE KEY UPDATE target_kg = VALUES(target_kg)');
    $query->execute([$userId, round($weight, 2)]);
    respond(['ok' => true]);
}
$date = $payload['date'] ?? null;
$parsed = is_string($date) && preg_match('/^\d{4}-\d{2}-\d{2}$/D', $date) ? DateTimeImmutable::createFromFormat('!Y-m-d', $date) : false;
$today = (new DateTimeImmutable('now', new DateTimeZone('Asia/Taipei')))->format('Y-m-d');
if (!$parsed || $parsed->format('Y-m-d') !== $date || $date < '1900-01-01' || $date > $today) {
    respond(['ok' => false, 'message' => '請輸入有效且不晚於今天的日期'], 422);
}
$query = $db->prepare('INSERT INTO weight_records (user_id, record_date, weight_kg) VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), weight_kg = VALUES(weight_kg)');
$query->execute([$userId, $date, round($weight, 2)]);
respond(['ok' => true, 'id' => (int) $db->lastInsertId()]);
