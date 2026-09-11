<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

requireMethod('POST');
requireUserId();
requireCsrf();

$_SESSION = [];
$cookie = session_get_cookie_params();
setcookie(session_name(), '', [
    'expires' => time() - 42000,
    'path' => $cookie['path'],
    'domain' => $cookie['domain'],
    'secure' => $cookie['secure'],
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_destroy();

respond(['ok' => true]);
