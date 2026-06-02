<?php
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
  $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
  $name = trim($input['name'] ?? '');
  $email = trim($input['email'] ?? '');
  $phone = trim($input['phone'] ?? '');
  $service = trim($input['service'] ?? '');
  $date = trim($input['date'] ?? '');
  $time = trim($input['time'] ?? '');
  $message = trim($input['message'] ?? '');

  if (!$name || !$email || !$phone || !$service || !$date || !$time) {
    header('Location: /?error=missing_fields');
    exit;
  }

  try {
    $pdo = getDB();
    $token = bin2hex(random_bytes(16));
    $stmt = $pdo->prepare("INSERT INTO bookings (name, email, phone, service, date, time, message, confirmation_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $phone, $service, $date, $time, $message, $token]);

    $id = $pdo->lastInsertId();
    $stmt = $pdo->prepare("SELECT * FROM bookings WHERE id = ?");
    $stmt->execute([$id]);
    $booking = $stmt->fetch();

    require_once __DIR__ . '/mail.php';
    $emailed = sendBookingNotification($booking, getBaseUrl());

    if ($emailed) {
      $pdo->prepare("UPDATE bookings SET notified = 1 WHERE id = ?")->execute([$booking['id']]);
    }

    header('Location: /?success=1');
    exit;
  } catch (Exception $e) {
    header('Location: /?error=server');
    exit;
  }
} else if ($_GET['debug'] ?? false) {
  // Debug: check email config
  require_once __DIR__ . '/mail.php';
  $config = getEmailConfig();
  echo '<pre>';
  echo 'Enabled: ' . ($config['enabled'] ?? 'not set') . "\n";
  echo 'Notify Email: ' . ($config['notify_email'] ?? 'not set') . "\n";
  echo 'SMTP User: ' . ($config['user'] ?? 'not set') . "\n";
  echo 'mail() available: ' . (function_exists('mail') ? 'yes' : 'no') . "\n";
  echo '</pre>';
} else {
  // GET: return empty array
  header('Content-Type: application/json');
  echo '[]';
}
