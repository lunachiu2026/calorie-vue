<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/../config/database.php';
$db = database();
$files = [
    __DIR__ . '/../../src/data/foods.json',
    __DIR__ . '/foods-additional.json',
    __DIR__ . '/foods-expanded.json',
];
$insert = $db->prepare('INSERT INTO foods (name, aliases, category, weight_g, calories, protein_g, fat_g, carbs_g, source, source_id, description)
    SELECT ?, ?, ?, 100, ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = ?)');
$updateAliases = $db->prepare("UPDATE foods SET aliases = ? WHERE name = ? AND (aliases IS NULL OR aliases = '')");
$added = 0;
$db->beginTransaction();
try {
    foreach ($files as $file) {
        $foods = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
        foreach ($foods as $food) {
            foreach (['calories', 'protein_g', 'fat_g', 'carbs_g'] as $key) {
                if (!isset($food[$key]) || !is_numeric($food[$key]) || $food[$key] < 0) throw new RuntimeException('Invalid nutrition: ' . $food['name']);
            }
            $aliases = isset($food['aliases']) && is_string($food['aliases']) ? trim($food['aliases']) : '';
            if ($aliases === '' && str_contains($food['name'], '優格')) $aliases = '發酵乳,優酪乳';
            $aliases = $aliases === '' ? null : $aliases;
            $insert->execute([$food['name'], $aliases, $food['category'], $food['calories'], $food['protein_g'], $food['fat_g'], $food['carbs_g'],
                $food['source'] ?? '原有專案 foods.json（來源未標示）', $food['source_id'] ?? null, $food['description'] ?? null, $food['name']]);
            $added += $insert->rowCount();
            if ($aliases !== null) $updateAliases->execute([$aliases, $food['name']]);
        }
    }
    $db->commit();
    echo '新增 ' . $added . ' 筆食物；目前共 ' . $db->query('SELECT COUNT(*) FROM foods')->fetchColumn() . " 筆\n";
} catch (Throwable $error) {
    $db->rollBack();
    throw $error;
}
