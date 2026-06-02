<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/header.php';
adminHeader('Dashboard', 'dashboard');

$pdo = getDB();
$totalBookings = $pdo->query("SELECT COUNT(*) as c FROM bookings")->fetch()['c'];
$pendingBookings = $pdo->query("SELECT COUNT(*) as c FROM bookings WHERE status='pending'")->fetch()['c'];
$confirmedBookings = $pdo->query("SELECT COUNT(*) as c FROM bookings WHERE status='confirmed'")->fetch()['c'];
$totalContacts = $pdo->query("SELECT COUNT(*) as c FROM contacts")->fetch()['c'];
$todayBookings = $pdo->query("SELECT COUNT(*) as c FROM bookings WHERE date = CURDATE()")->fetch()['c'];
$recentBookings = $pdo->query("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5")->fetchAll();
$recentContacts = $pdo->query("SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5")->fetchAll();
?>
<div class="top-bar"><h1>Dashboard</h1></div>
<div class="card-grid">
  <div class="stat-card"><div class="num"><?=$totalBookings?></div><div class="label">Total Bookings</div></div>
  <div class="stat-card"><div class="num"><?=$pendingBookings?></div><div class="label">Pending</div></div>
  <div class="stat-card"><div class="num"><?=$confirmedBookings?></div><div class="label">Confirmed</div></div>
  <div class="stat-card"><div class="num"><?=$totalContacts?></div><div class="label">Messages</div></div>
  <div class="stat-card"><div class="num"><?=$todayBookings?></div><div class="label">Today</div></div>
</div>

<h2 style="font-family:Oswald,sans-serif;font-size:1.2rem;color:#fff;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">Recent Bookings</h2>
<table>
  <tr><th>Name</th><th>Service</th><th>Date</th><th>Status</th></tr>
  <?php foreach ($recentBookings as $b): ?>
  <tr><td><?=htmlspecialchars($b['name'])?></td><td><?=htmlspecialchars($b['service'])?></td><td><?=htmlspecialchars($b['date'])?></td><td><span class="tag tag-<?=$b['status']?>"><?=$b['status']?></span></td></tr>
  <?php endforeach; ?>
  <?php if (empty($recentBookings)): ?><tr><td colspan="4" style="color:#666">No bookings yet</td></tr><?php endif; ?>
</table>
</div></body></html>
