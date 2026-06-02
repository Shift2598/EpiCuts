<?php
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');

try {
  $pdo = getDB();

  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM gallery_images ORDER BY sort_order ASC");
    echo json_encode($stmt->fetchAll());
    exit;
  }

  // POST or PUT require admin
  requireAdmin();

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $subtitle = trim($_POST['subtitle'] ?? '');
    $image_url = trim($_POST['image_url'] ?? '');
    $url = $image_url;

    // Handle file upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
      $uploadDir = __DIR__ . '/../uploads/';
      if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
      $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
      $filename = 'gallery-' . time() . '.' . $ext;
      move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $filename);
      $url = '/uploads/' . $filename;
    }

    if (!$title || !$url) {
      jsonResponse(['error' => 'Title and image are required'], 400);
    }

    $max = $pdo->query("SELECT COALESCE(MAX(sort_order), 0) as m FROM gallery_images")->fetch();
    $stmt = $pdo->prepare("INSERT INTO gallery_images (title, subtitle, image_url, sort_order) VALUES (?, ?, ?, ?)");
    $stmt->execute([$title, $subtitle, $url, ($max['m'] ?? 0) + 1]);
    jsonResponse(['success' => true]);
  }

  if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = $_GET['id'] ?? '';
    if (!$id) jsonResponse(['error' => 'id required'], 400);

    $title = trim($_POST['title'] ?? '');
    $subtitle = trim($_POST['subtitle'] ?? '');
    $image_url = trim($_POST['image_url'] ?? '');
    $url = $image_url;

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
      $uploadDir = __DIR__ . '/../uploads/';
      if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
      $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
      $filename = 'gallery-' . time() . '.' . $ext;
      move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $filename);
      $url = '/uploads/' . $filename;
    }

    if ($url) {
      $stmt = $pdo->prepare("UPDATE gallery_images SET title = ?, subtitle = ?, image_url = ? WHERE id = ?");
      $stmt->execute([$title, $subtitle, $url, $id]);
    } else {
      $stmt = $pdo->prepare("UPDATE gallery_images SET title = ?, subtitle = ? WHERE id = ?");
      $stmt->execute([$title, $subtitle, $id]);
    }
    jsonResponse(['success' => true]);
  }

  if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) jsonResponse(['error' => 'id required'], 400);
    $pdo->prepare("DELETE FROM gallery_images WHERE id = ?")->execute([$id]);
    jsonResponse(['success' => true]);
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}
