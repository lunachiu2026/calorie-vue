<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

requireMethod('POST');
$payload = requestJson();

$username = trim((string) ($payload['username'] ?? ''));
$password = (string) ($payload['password'] ?? '');
$email = strtolower(trim((string) ($payload['email'] ?? '')));
$fullName = trim((string) ($payload['fullName'] ?? ''));
$phone = preg_replace('/\D+/', '', (string) ($payload['phone'] ?? ''));
$acceptedTerms = ($payload['acceptedTerms'] ?? false) === true;

if (!preg_match('/^[A-Za-z0-9_]{4,20}$/', $username)) {
    respond(['ok' => false, 'message' => '帳號須為 4-20 位英文字母、數字或底線'], 422);
}
if (str_contains($password, "\0") || strlen($password) > 72) {
    respond(['ok' => false, 'message' => '密碼不可超過 72 bytes'], 422);
}
if (strlen($password) < 8 || !preg_match('/[A-Za-z]/', $password) || !preg_match('/\d/', $password)) {
    respond(['ok' => false, 'message' => '密碼至少 8 個字元，且須包含英文字母與數字'], 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(['ok' => false, 'message' => '請輸入有效的電子郵件地址'], 422);
}
if (mb_strlen($fullName) < 2 || mb_strlen($fullName) > 100) {
    respond(['ok' => false, 'message' => '請輸入完整姓名'], 422);
}
if (!preg_match('/^09\d{8}$/', $phone)) {
    respond(['ok' => false, 'message' => '請輸入有效的台灣手機號碼'], 422);
}
if (!$acceptedTerms) {
    respond(['ok' => false, 'message' => '請先同意會員使用條款與隱私權政策'], 422);
}

$db = database();
$duplicateCheck = $db->prepare('SELECT username, email FROM users WHERE username = :username OR email = :email LIMIT 1');
$duplicateCheck->execute(['username' => $username, 'email' => $email]);
$existingUser = $duplicateCheck->fetch();
if ($existingUser) {
    $message = strcasecmp($existingUser['username'], $username) === 0 ? '此帳號已被使用' : '此電子郵件已註冊';
    respond(['ok' => false, 'message' => $message], 409);
}

try {
    $statement = $db->prepare(
        'INSERT INTO users (username, email, password_hash, full_name, phone, terms_accepted_at)
         VALUES (:username, :email, :password_hash, :full_name, :phone, CURRENT_TIMESTAMP)'
    );
    $statement->execute([
        'username' => $username,
        'email' => $email,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'full_name' => $fullName,
        'phone' => $phone,
    ]);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        respond(['ok' => false, 'message' => '帳號或電子郵件已被使用'], 409);
    }
    throw $error;
}

$userId = (int) $db->lastInsertId();
establishSession($userId);
$user = findUserById($db, $userId);

respond(['ok' => true, 'user' => publicUser($user), 'csrfToken' => csrfToken()], 201);
