<?php

declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';
requireMethod('GET', 'PUT', 'DELETE');
$userId = requireUserId();
$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') requireCsrf();
$db = database();

if ($method === 'GET') {
    $query = $db->prepare('SELECT r.id, r.meal_date, i.meal_type, i.food_name, i.weight_g, i.calories,
        i.protein_g, i.fat_g, i.carbs_g FROM meal_records r
        LEFT JOIN meal_items i ON i.record_id = r.id WHERE r.user_id = ? ORDER BY r.meal_date DESC, i.id');
    $query->execute([$userId]);
    $records = [];
    foreach ($query as $row) {
        $id = (int) $row['id'];
        if (!isset($records[$id])) {
            $records[$id] = ['id' => $id, 'mealDate' => $row['meal_date'],
                'savedAt' => $row['meal_date'] . 'T12:00:00', 'meals' => ['早餐' => [], '午餐' => [], '晚餐' => []]];
        }
        if ($row['meal_type'] === null) continue;
        $item = ['name' => $row['food_name']];
        foreach (['weight_g', 'calories', 'protein_g', 'fat_g', 'carbs_g'] as $key) $item[$key] = (float) $row[$key];
        $records[$id]['meals'][$row['meal_type']][] = $item;
    }
    respond(['ok' => true, 'records' => array_values($records)]);
}

$payload = requestJson();
if ($method === 'DELETE') {
    if (($payload['all'] ?? false) === true) {
        $query = $db->prepare('DELETE FROM meal_records WHERE user_id = ?');
        $query->execute([$userId]);
    } else {
        $id = filter_var($payload['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || $id < 1) respond(['ok' => false, 'message' => '請指定有效紀錄'], 422);
        $query = $db->prepare('DELETE FROM meal_records WHERE id = ? AND user_id = ?');
        $query->execute([$id, $userId]);
        if (!$query->rowCount()) respond(['ok' => false, 'message' => '找不到紀錄'], 404);
    }
    respond(['ok' => true]);
}

$date = $payload['mealDate'] ?? null;
$parsed = is_string($date) && preg_match('/^\d{4}-\d{2}-\d{2}$/D', $date)
    ? DateTimeImmutable::createFromFormat('!Y-m-d', $date) : false;
if (!$parsed || $parsed->format('Y-m-d') !== $date || $date < '1900-01-01'
    || $date > (new DateTimeImmutable('now', new DateTimeZone('Asia/Taipei')))->format('Y-m-d')) {
    respond(['ok' => false, 'message' => '請選擇有效且不晚於今天的飲食日期'], 422);
}
$meals = $payload['meals'] ?? null;
if (!is_array($meals) || array_diff(array_keys($meals), ['早餐', '午餐', '晚餐'])) {
    respond(['ok' => false, 'message' => '餐別資料格式錯誤'], 422);
}
// Recalculate nutrition from the same catalog used by the frontend.
$names = [];
foreach ($meals as $entries) {
    if (!is_array($entries) || !array_is_list($entries) || count($entries) > 100) respond(['ok' => false, 'message' => '每餐最多可儲存 100 項食物'], 422);
    foreach ($entries as $entry) {
        if (!is_array($entry) || !is_string($entry['name'] ?? null) || mb_strlen($entry['name']) > 100) respond(['ok' => false, 'message' => '食物資料格式錯誤'], 422);
        $names[] = $entry['name'];
    }
}
$names = array_values(array_unique($names));
if (!$names) respond(['ok' => false, 'message' => '請至少加入一項食物'], 422);
$query = $db->prepare('SELECT name, calories, protein_g, fat_g, carbs_g FROM foods WHERE name IN (' . implode(',', array_fill(0, count($names), '?')) . ')');
$query->execute($names);
$catalog = $query->fetchAll();
$foods = array_column($catalog, null, 'name');
$items = [];
foreach (['早餐', '午餐', '晚餐'] as $type) {
    $entries = $meals[$type] ?? [];
    if (!is_array($entries) || !array_is_list($entries) || count($entries) > 100) {
        respond(['ok' => false, 'message' => '每餐最多可儲存 100 項食物'], 422);
    }
    foreach ($entries as $entry) {
        if (!is_array($entry) || !is_string($entry['name'] ?? null)) respond(['ok' => false, 'message' => '食物資料格式錯誤'], 422);
        $food = $foods[$entry['name']] ?? null;
        $weight = filter_var($entry['weight_g'] ?? null, FILTER_VALIDATE_FLOAT);
        if (!$food || $weight === false || !is_finite($weight) || $weight < 0.01 || $weight > 10000) {
            respond(['ok' => false, 'message' => '請選擇清單中的食物，重量須介於 0.01–10000 克'], 422);
        }
        $weight = round($weight, 2);
        $ratio = $weight / 100;
        $items[] = [$type, $food['name'], $weight, round($food['calories'] * $ratio),
            round($food['protein_g'] * $ratio, 1), round($food['fat_g'] * $ratio, 1), round($food['carbs_g'] * $ratio, 1)];
    }
}
if (!$items) respond(['ok' => false, 'message' => '請至少加入一項食物'], 422);

$db->beginTransaction();
try {
    $query = $db->prepare('INSERT INTO meal_records (user_id, meal_date) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), updated_at = CURRENT_TIMESTAMP');
    $query->execute([$userId, $date]);
    $id = (int) $db->lastInsertId();
    $db->prepare('DELETE FROM meal_items WHERE record_id = ?')->execute([$id]);
    $insert = $db->prepare('INSERT INTO meal_items (record_id, meal_type, food_name, weight_g, calories, protein_g, fat_g, carbs_g)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    foreach ($items as $item) $insert->execute([$id, ...$item]);
    $db->commit();
} catch (Throwable $error) {
    $db->rollBack();
    throw $error;
}
respond(['ok' => true, 'id' => $id]);
