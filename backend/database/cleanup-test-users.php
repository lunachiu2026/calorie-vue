<?php
// Only remove the exact randomly generated accounts from the integration test.
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/../config/database.php';
$names = json_decode(getenv('RECORDS_TEST_USERS') ?: '[]', true, 512, JSON_THROW_ON_ERROR);
$query = database()->prepare('DELETE FROM users WHERE username = ? AND email = ?');
foreach ($names as $name) {
    if (!is_string($name) || !preg_match('/^rt_[a-f0-9]{12}_[ab]$/', $name)) throw new RuntimeException('Invalid test account');
    $query->execute([$name, $name . '@example.com']);
}
