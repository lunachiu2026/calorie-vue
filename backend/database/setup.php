<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$configPath = __DIR__ . '/../config/local.php';
if (!is_file($configPath)) {
    fwrite(STDERR, "找不到 backend/config/local.php\n");
    exit(1);
}

$config = require $configPath;
$requiredKeys = ['host', 'port', 'username', 'password'];
foreach ($requiredKeys as $key) {
    if (!array_key_exists($key, $config)) {
        fwrite(STDERR, "資料庫設定缺少 {$key}\n");
        exit(1);
    }
}

try {
    $dsn = sprintf('mysql:host=%s;port=%d;charset=utf8mb4', $config['host'], $config['port']);
    $db = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $schema = file_get_contents(__DIR__ . '/schema.sql');
    if ($schema === false) {
        throw new RuntimeException('無法讀取 schema.sql');
    }
    $db->exec($schema);
    $hasAliases = $db->query("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'foods' AND column_name = 'aliases'")->fetchColumn();
    if (!$hasAliases) $db->exec('ALTER TABLE foods ADD COLUMN aliases VARCHAR(255) NULL AFTER name');
    $db->exec("UPDATE foods SET name = REPLACE(name, '發酵乳', '優格'), aliases = '發酵乳,優酪乳' WHERE name LIKE '%發酵乳%'");
    $hasIndex = $db->query("SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'foods' AND index_name = 'foods_category_id'")->fetchColumn();
    if (!$hasIndex) $db->exec('CREATE INDEX foods_category_id ON foods (category, id)');
    require __DIR__ . '/seed-foods.php';
    fwrite(STDOUT, "calorie_db 初始化完成\n");
} catch (Throwable $error) {
    fwrite(STDERR, "資料庫初始化失敗：{$error->getMessage()}\n");
    exit(1);
}
