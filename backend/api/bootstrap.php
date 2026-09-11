<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

ini_set('session.use_strict_mode', '1');
ini_set('session.gc_maxlifetime', (string) (60 * 60 * 24 * 30));

$isSecureRequest = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $isSecureRequest,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

function respond(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

set_exception_handler(function (Throwable $error): never {
    error_log((string) $error);
    respond(['ok' => false, 'message' => '伺服器暫時無法處理請求'], 500);
});

function requireMethod(string ...$allowedMethods): void
{
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if (!in_array($method, $allowedMethods, true)) {
        header('Allow: ' . implode(', ', $allowedMethods));
        respond(['ok' => false, 'message' => '不支援的請求方式'], 405);
    }
}

function requestJson(): array
{
    $rawBody = file_get_contents('php://input');
    if ($rawBody === false || trim($rawBody) === '') {
        return [];
    }

    $payload = json_decode($rawBody, true);
    if (!is_array($payload) || json_last_error() !== JSON_ERROR_NONE) {
        respond(['ok' => false, 'message' => '請求內容必須是有效的 JSON'], 400);
    }

    return $payload;
}

function csrfToken(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function requireCsrf(): void
{
    $submittedToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if ($submittedToken === '' || !hash_equals(csrfToken(), $submittedToken)) {
        respond(['ok' => false, 'message' => '安全驗證已失效，請重新整理後再試'], 419);
    }
}

function requireUserId(): int
{
    $userId = (int) ($_SESSION['user_id'] ?? 0);
    if ($userId <= 0) {
        respond(['ok' => false, 'message' => '請先登入'], 401);
    }

    return $userId;
}

function findUserById(PDO $db, int $userId): ?array
{
    $statement = $db->prepare(
        'SELECT id, username, email, full_name, phone, height, weight, bmi, sex,
                birth_date, activity, bmr, daily_calories
         FROM users
         WHERE id = :id'
    );
    $statement->execute(['id' => $userId]);
    $user = $statement->fetch();

    return $user ?: null;
}

function publicUser(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'fullName' => $user['full_name'],
        'phone' => $user['phone'],
        'height' => $user['height'] === null ? '' : (float) $user['height'],
        'weight' => $user['weight'] === null ? '' : (float) $user['weight'],
        'bmi' => $user['bmi'] === null ? '' : (float) $user['bmi'],
        'sex' => $user['sex'] ?? '',
        'birthDate' => $user['birth_date'] ?? '',
        'activity' => $user['activity'] === null ? '' : (float) $user['activity'],
        'bmr' => $user['bmr'] === null ? '' : (int) $user['bmr'],
        'dailyCalories' => $user['daily_calories'] === null ? '' : (int) $user['daily_calories'],
    ];
}

function establishSession(int $userId, bool $remember = false): void
{
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

    if (!$remember) {
        return;
    }

    $cookie = session_get_cookie_params();
    setcookie(session_name(), session_id(), [
        'expires' => time() + (60 * 60 * 24 * 30),
        'path' => $cookie['path'],
        'domain' => $cookie['domain'],
        'secure' => $cookie['secure'],
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}
