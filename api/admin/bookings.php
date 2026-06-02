<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/header.php';

$pdo = getDB();

if (isset($_POST['action'], $_POST['id'])) {
  $id = (int)$_POST['id'];
  if ($_POST['action'] === 'delete') {
    $pdo->prepare("DELETE FROM bookings WHERE id = ?")->execute([$id]);
  } else {
    $pdo->prepare("UPDATE bookings SET status = ? WHERE id = ?")->execute([$_POST['action'], $id]);
  }
  header('Location: bookings.php');
  exit;
}

adminHeader('Bookings', 'bookings');

$status = $_GET['status'] ?? '';
if ($status) {
  $stmt = $pdo->prepare("SELECT * FROM bookings WHERE status = ? ORDER BY date DESC");
  $stmt->execute([$status]);
} else {
  $stmt = $pdo->query("SELECT * FROM bookings ORDER BY date DESC");
}
$bookings = $stmt->fetchAll();
?>
<div class="top-bar"><h1>Bookings</h1></div>
<div class="filter-bar">
  <a href="bookings.php" class="<?=$status===''?'active':''?>">All</a>
  <a href="bookings.php?status=pending" class="<?=$status==='pending'?'active':''?>">Pending</a>
  <a href="bookings.php?status=confirmed" class="<?=$status==='confirmed'?'active':''?>">Confirmed</a>
  <a href="bookings.php?status=cancelled" class="<?=$status==='cancelled'?'active':''?>">Cancelled</a>
</div>
<table>
  <tr><th>Name</th><th>Email</th><th>Phone</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr>
  <?php foreach ($bookings as $b): ?>
  <tr><td><?=htmlspecialchars($b['name'])?></td><td><?=htmlspecialchars($b['email'])?></td><td><?=htmlspecialchars($b['phone'])?></td><td><?=htmlspecialchars($b['service'])?></td><td><?=htmlspecialchars($b['date'])?></td><td><?=htmlspecialchars($b['time'])?></td><td><span class="tag tag-<?=$b['status']?>"><?=$b['status']?></span></td>
    <td>
      <form method="POST" style="display:inline">
        <input type="hidden" name="id" value="<?=$b['id']?>">
        <?php if ($b['status'] !== 'confirmed'): ?><button type="submit" name="action" value="confirmed" class="btn btn-sm btn-success">Confirm</button><?php endif; ?>
        <?php if ($b['status'] !== 'cancelled'): ?><button type="submit" name="action" value="cancelled" class="btn btn-sm btn-danger">Cancel</button><?php endif; ?>
        <button type="submit" name="action" value="delete" class="btn btn-sm btn-danger" onclick="return confirm('Delete?')">Delete</button>
      </form>
    </td>
  </tr>
  <?php endforeach; ?>
  <?php if (empty($bookings)): ?><tr><td colspan="8" style="color:#666;text-align:center;padding:32px">No bookings found</td></tr><?php endif; ?>
</table>
</div></body></html>
