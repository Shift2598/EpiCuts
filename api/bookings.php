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
    jsonResponse(['error' => 'All required fields must be filled'], 400);
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

    // Send email notification (include confirmation/decline links)
    require_once __DIR__ . '/mail.php';
    $emailed = sendBookingNotification($booking, getBaseUrl());

    if ($emailed) {
      $pdo->prepare("UPDATE bookings SET notified = 1 WHERE id = ?")->execute([$booking['id']]);
    }

    jsonResponse([
      'success' => true,
      'message' => $emailed
        ? 'Booking request sent! Check your email for confirmation.'
        : 'Booking received! We\'ll confirm shortly.'
    ]);
  } catch (Exception $e) {
    http_response_code(500);
    jsonResponse(['error' => 'Failed to create booking']);
  }
}

// GET: list all bookings (for admin)
$method === 'GET' && jsonResponse([]);
