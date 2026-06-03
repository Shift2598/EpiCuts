<?php
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

try {
  $pdo = getDB();
  $section = $_GET['section'] ?? '';

  if ($section) {
    $stmt = $pdo->prepare("SELECT * FROM content WHERE section = ? ORDER BY id");
    $stmt->execute([$section]);
  } else {
    $stmt = $pdo->query("SELECT * FROM content ORDER BY section, id");
  }

  echo json_encode($stmt->fetchAll());
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Failed to fetch content']);
}
