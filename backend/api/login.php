<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

requireMethod('POST');
$payload = requestJson();
$username = trim((string) ($payload['username'] ?? ''));
$password = (string) ($payload['password'] ?? '');
$remember = filter_var($payload['remember'] ?? false, FILTER_VALIDATE_BOOLEAN);

if ($username === '' || $password === '') {
    respond(['ok' => false, 'message' => '請輸入帳號與密碼'], 422);
}

$db = database();
$statement = $db->prepare(
    'SELECT id, username, email, password_hash, full_name, phone, height, weight, bmi, sex,
            birth_date, activity, bmr, daily_calories
     FROM users
     WHERE username = :username
     LIMIT 1'
);
$statement->execute(['username' => $username]);
$user = $statement->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    respond(['ok' => false, 'message' => '帳號或密碼錯誤'], 401);
}

establishSession((int) $user['id'], $remember);
unset($user['password_hash']);

respond(['ok' => true, 'user' => publicUser($user), 'csrfToken' => csrfToken()]);
