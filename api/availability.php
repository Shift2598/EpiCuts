<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

$date = $_GET['date'] ?? '';
if (!$date) { echo json_encode([]); exit; }

$pdo = getDB();
$stmt = $pdo->prepare("SELECT time FROM bookings WHERE date = ? AND status != 'cancelled'");
$stmt->execute([$date]);
$booked = $stmt->fetchAll(PDO::FETCH_COLUMN);
echo json_encode($booked);
