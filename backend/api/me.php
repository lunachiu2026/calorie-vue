<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

requireMethod('GET');
$userId = (int) ($_SESSION['user_id'] ?? 0);
if ($userId <= 0) {
    respond(['ok' => true, 'authenticated' => false]);
}

$user = findUserById(database(), $userId);
if (!$user) {
    $_SESSION = [];
    session_destroy();
    respond(['ok' => true, 'authenticated' => false]);
}

respond([
    'ok' => true,
    'authenticated' => true,
    'user' => publicUser($user),
    'csrfToken' => csrfToken(),
]);
