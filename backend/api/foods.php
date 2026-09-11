<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';
requireMethod('GET');
session_write_close();
function searchParam(string $key, int $max): string {
    $value = $_GET[$key] ?? '';
    if (!is_string($value) || mb_strlen($value) > $max) respond(['ok' => false, 'message' => '搜尋參數格式錯誤'], 422);
    return trim($value);
}
$q = searchParam('q', 100);
$category = searchParam('category', 50);
$after = filter_var($_GET['after'] ?? 0, FILTER_VALIDATE_INT);
if ($after === false || $after < 0) respond(['ok' => false, 'message' => '分頁參數格式錯誤'], 422);
$db = database();
$fields = 'id, name, category, weight_g, calories, protein_g, fat_g, carbs_g, source, source_id, description';
$where = ['id > ?'];
$params = [$after];
if ($q !== '') {
    $pattern = '%' . strtr($q, ['!' => '!!', '%' => '!%', '_' => '!_']) . '%';
    $where[] = "(name LIKE ? ESCAPE '!' OR aliases LIKE ? ESCAPE '!')";
    $params[] = $pattern;
    $params[] = $pattern;
}
if ($category !== '') { $where[] = 'category = ?'; $params[] = $category; }
$query = $db->prepare('SELECT ' . $fields . ' FROM foods WHERE ' . implode(' AND ', $where) . ' ORDER BY id LIMIT 21');
$query->execute($params);
$foods = $query->fetchAll();
$hasMore = count($foods) > 20;
$foods = array_slice($foods, 0, 20);
function numericFoods(array $foods): array {
    foreach ($foods as &$food) {
        $food['id'] = (int) $food['id'];
        foreach (['weight_g', 'calories', 'protein_g', 'fat_g', 'carbs_g'] as $key) $food[$key] = (float) $food[$key];
    }
    return $foods;
}
$result = ['ok' => true, 'foods' => numericFoods($foods), 'hasMore' => $hasMore,
    'nextCursor' => $hasMore ? (int) $foods[count($foods) - 1]['id'] : null];
if (($_GET['meta'] ?? '') === '1') {
    $result['categories'] = $db->query('SELECT DISTINCT category FROM foods ORDER BY category')->fetchAll(PDO::FETCH_COLUMN);
    $recommended = $db->prepare('SELECT ' . $fields . ' FROM foods WHERE name IN (?, ?, ?)');
    $recommended->execute(['雞胸肉(去皮)', '鮭魚', '牛排(沙朗)']);
    $result['recommendations'] = numericFoods($recommended->fetchAll());
}
respond($result);
