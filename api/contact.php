<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  jsonResponse(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$phone = trim($input['phone'] ?? '');
$message = trim($input['message'] ?? '');

if (!$name || !$email || !$message) {
  jsonResponse(['error' => 'Name, email, and message are required'], 400);
}

try {
  $pdo = getDB();
  $stmt = $pdo->prepare("INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)");
  $stmt->execute([$name, $email, $phone, $message]);
  jsonResponse(['success' => true, 'message' => "Message sent! We'll get back to you soon."]);
} catch (Exception $e) {
  jsonResponse(['error' => 'Failed to send message'], 500);
}
