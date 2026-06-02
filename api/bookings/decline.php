<?php
require_once __DIR__ . '/../../config.php';

$token = $_GET['token'] ?? basename($_SERVER['REQUEST_URI'], '/decline');

$pdo = getDB();
$stmt = $pdo->prepare("SELECT * FROM bookings WHERE confirmation_token = ?");
$stmt->execute([$token]);
$booking = $stmt->fetch();

if (!$booking) {
  die("<h1>Invalid or expired link</h1>");
}

$pdo->prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?")->execute([$booking['id']]);

require_once __DIR__ . '/../mail.php';
sendCustomerDecline($booking);
?>
<html><body style="background:#050505;color:#e0e0e0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
  <div style="text-align:center;border:2px solid #d4a843;padding:48px;background:#111">
    <h1 style="color:#c0392b;font-family:Oswald,sans-serif;text-transform:uppercase">Declined</h1>
    <p style="margin-top:16px">Booking for <?=htmlspecialchars($booking['name'])?> has been cancelled.</p>
    <p style="margin-top:8px;color:#999;font-size:0.85rem">A notification has been sent to <strong><?=htmlspecialchars($booking['email'])?></strong>.</p>
  </div>
</body></html>
