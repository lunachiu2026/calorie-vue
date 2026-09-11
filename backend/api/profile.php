<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

requireMethod('GET', 'PATCH');
$userId = requireUserId();
$db = database();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
    $user = findUserById($db, $userId);
    respond(['ok' => true, 'user' => publicUser($user), 'csrfToken' => csrfToken()]);
}

requireCsrf();
$payload = requestJson();
$currentUser = findUserById($db, $userId);

$fullName = trim((string) ($payload['fullName'] ?? $currentUser['full_name']));
$email = strtolower(trim((string) ($payload['email'] ?? $currentUser['email'])));
$phone = preg_replace('/\D+/', '', (string) ($payload['phone'] ?? $currentUser['phone']));

if (mb_strlen($fullName) < 2 || mb_strlen($fullName) > 100) {
    respond(['ok' => false, 'message' => '請輸入完整姓名'], 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(['ok' => false, 'message' => '請輸入有效的電子郵件地址'], 422);
}
if (!preg_match('/^09\d{8}$/', $phone)) {
    respond(['ok' => false, 'message' => '請輸入有效的台灣手機號碼'], 422);
}

$duplicateCheck = $db->prepare('SELECT id FROM users WHERE email = :email AND id <> :id LIMIT 1');
$duplicateCheck->execute(['email' => $email, 'id' => $userId]);
if ($duplicateCheck->fetch()) {
    respond(['ok' => false, 'message' => '此電子郵件已被其他帳號使用'], 409);
}

$height = $currentUser['height'];
$weight = $currentUser['weight'];
$bmi = $currentUser['bmi'];
$sex = $currentUser['sex'];
$birthDate = $currentUser['birth_date'];
$activity = $currentUser['activity'];
$bmr = $currentUser['bmr'];
$dailyCalories = $currentUser['daily_calories'];

$hasBmiFields = array_key_exists('height', $payload)
    || array_key_exists('weight', $payload)
    || array_key_exists('sex', $payload)
    || array_key_exists('birthDate', $payload)
    || array_key_exists('activity', $payload);

if ($hasBmiFields) {
    $height = filter_var($payload['height'] ?? null, FILTER_VALIDATE_FLOAT);
    $weight = filter_var($payload['weight'] ?? null, FILTER_VALIDATE_FLOAT);
    $sex = (string) ($payload['sex'] ?? '');
    $birthDate = (string) ($payload['birthDate'] ?? '');
    $activity = filter_var($payload['activity'] ?? null, FILTER_VALIDATE_FLOAT);

    if ($height === false || $height < 100 || $height > 250) {
        respond(['ok' => false, 'message' => '請輸入 100-250 公分之間的有效身高'], 422);
    }
    if ($weight === false || $weight < 20 || $weight > 300) {
        respond(['ok' => false, 'message' => '請輸入 20-300 公斤之間的有效體重'], 422);
    }
    if (!in_array($sex, ['male', 'female'], true)) {
        respond(['ok' => false, 'message' => '請選擇生理性別'], 422);
    }
    if (!in_array((float) $activity, [1.4, 1.6, 1.8, 2.0, 2.2], true)) {
        respond(['ok' => false, 'message' => '請選擇有效的日常活動程度'], 422);
    }

    $birth = DateTimeImmutable::createFromFormat('!Y-m-d', $birthDate);
    $birthErrors = DateTimeImmutable::getLastErrors();
    if (!$birth || ($birthErrors !== false && ($birthErrors['warning_count'] > 0 || $birthErrors['error_count'] > 0))) {
        respond(['ok' => false, 'message' => '請輸入有效的出生日期'], 422);
    }

    $today = new DateTimeImmutable('today');
    $age = $birth->diff($today)->y;
    if ($birth > $today || $age < 18 || $age > 100) {
        respond(['ok' => false, 'message' => '此估算功能僅適用於 18-100 歲成人'], 422);
    }

    $bmi = round($weight / (($height / 100) ** 2), 1);
    $sexAdjustment = $sex === 'male' ? 5 : -161;
    $bmr = (int) round(10 * $weight + 6.25 * $height - 5 * $age + $sexAdjustment);
    $dailyCalories = (int) round($bmr * $activity);
}

try {
    $statement = $db->prepare(
        'UPDATE users
         SET full_name = :full_name, email = :email, phone = :phone, height = :height, weight = :weight,
             bmi = :bmi, sex = :sex, birth_date = :birth_date, activity = :activity, bmr = :bmr,
             daily_calories = :daily_calories
         WHERE id = :id'
    );
    $statement->execute([
        'full_name' => $fullName,
        'email' => $email,
        'phone' => $phone,
        'height' => $height,
        'weight' => $weight,
        'bmi' => $bmi,
        'sex' => $sex,
        'birth_date' => $birthDate ?: null,
        'activity' => $activity,
        'bmr' => $bmr,
        'daily_calories' => $dailyCalories,
        'id' => $userId,
    ]);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        respond(['ok' => false, 'message' => '此電子郵件已被其他帳號使用'], 409);
    }
    throw $error;
}

$user = findUserById($db, $userId);
respond(['ok' => true, 'user' => publicUser($user), 'csrfToken' => csrfToken()]);
