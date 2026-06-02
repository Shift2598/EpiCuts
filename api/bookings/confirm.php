<?php
require_once __DIR__ . '/../../config.php';

$token = $_GET['token'] ?? basename($_SERVER['REQUEST_URI'], '/confirm');

$pdo = getDB();
$stmt = $pdo->prepare("SELECT * FROM bookings WHERE confirmation_token = ?");
$stmt->execute([$token]);
$booking = $stmt->fetch();

if (!$booking) {
  die("<h1>Invalid or expired link</h1>");
}

$pdo->prepare("UPDATE bookings SET status = 'confirmed' WHERE id = ?")->execute([$booking['id']]);

require_once __DIR__ . '/../mail.php';
sendCustomerConfirmation($booking);
?>
<html><body style="background:#050505;color:#e0e0e0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
  <div style="text-align:center;border:2px solid #d4a843;padding:48px;background:#111">
    <h1 style="color:#27ae60;font-family:Oswald,sans-serif;text-transform:uppercase">&#10003; Confirmed!</h1>
    <p style="margin-top:16px"><?=htmlspecialchars($booking['service'])?> on <?=htmlspecialchars($booking['date'])?> at <?=htmlspecialchars($booking['time'])?> for <?=htmlspecialchars($booking['name'])?>.</p>
    <p style="margin-top:8px;color:#999;font-size:0.85rem">A confirmation email has been sent to <strong><?=htmlspecialchars($booking['email'])?></strong>.</p>
  </div>
</body></html>
