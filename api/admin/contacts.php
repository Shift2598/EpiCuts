<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/header.php';

$pdo = getDB();

if (isset($_POST['delete'], $_POST['id'])) {
  $pdo->prepare("DELETE FROM contacts WHERE id = ?")->execute([(int)$_POST['id']]);
  header('Location: contacts.php');
  exit;
}

adminHeader('Messages', 'contacts');

$contacts = $pdo->query("SELECT * FROM contacts ORDER BY created_at DESC")->fetchAll();
?>
<div class="top-bar"><h1>Messages</h1></div>
<table>
  <tr><th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th><th>Actions</th></tr>
  <?php foreach ($contacts as $c): ?>
  <tr><td><?=htmlspecialchars($c['name'])?></td><td><?=htmlspecialchars($c['email'])?></td><td><?=htmlspecialchars($c['phone'])?></td><td style="max-width:300px;word-break:break-word"><?=htmlspecialchars($c['message'])?></td><td><?=htmlspecialchars($c['created_at'])?></td>
    <td><form method="POST"><input type="hidden" name="id" value="<?=$c['id']?>"><button type="submit" name="delete" class="btn btn-sm btn-danger">Delete</button></form></td>
  </tr>
  <?php endforeach; ?>
  <?php if (empty($contacts)): ?><tr><td colspan="6" style="color:#666;text-align:center;padding:32px">No messages</td></tr><?php endif; ?>
</table>
</div></body></html>
