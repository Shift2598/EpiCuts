<?php
session_start();

define('DB_HOST', 'sql308.infinityfree.com');
define('DB_NAME', 'if0_42074968_epicuts');
define('DB_USER', 'if0_42074968');
define('DB_PASS', 'QO5JCJOX7B7fQk');

function getDB() {
  static $pdo = null;
  if ($pdo === null) {
    try {
      $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
      ]);
    } catch (PDOException $e) {
      http_response_code(500);
      die(json_encode(['error' => 'Database connection failed']));
    }
  }
  return $pdo;
}

function jsonResponse($data, $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json');
  echo json_encode($data);
  exit;
}

function isAdmin() {
  return isset($_SESSION['admin_id']);
}

function requireAdmin() {
  if (!isAdmin()) {
    if (strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
      jsonResponse(['error' => 'Unauthorized'], 401);
    }
    header('Location: /api/admin/login.php');
    exit;
  }
}

function getBaseUrl() {
  $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
  return $proto . '://' . $_SERVER['HTTP_HOST'];
}
