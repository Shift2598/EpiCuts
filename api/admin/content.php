<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/header.php';
adminHeader('Content', 'content');

$pdo = getDB();

if (isset($_POST['id'], $_POST['value'])) {
  $pdo->prepare("UPDATE content SET value = ?, updated_at = NOW() WHERE id = ?")->execute([$_POST['value'], (int)$_POST['id']]);
  header('Location: content.php');
  exit;
}

$content = $pdo->query("SELECT * FROM content ORDER BY section, id")->fetchAll();
$grouped = [];
foreach ($content as $item) {
  $grouped[$item['section']][] = $item;
}
?>
<div class="top-bar"><h1>Content</h1></div>
<?php foreach ($grouped as $section => $items): ?>
<div style="margin-bottom:32px">
  <h2 style="font-family:Oswald,sans-serif;font-size:1.2rem;color:var(--gold);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px"><?=htmlspecialchars(ucfirst($section))?></h2>
  <?php foreach ($items as $item): ?>
  <div class="form-card" style="margin-bottom:12px">
    <form method="POST">
      <input type="hidden" name="id" value="<?=$item['id']?>">
      <div class="form-group">
        <label style="text-transform:none;letter-spacing:0"><?=htmlspecialchars($item['key'])?></label>
        <?php if (strlen($item['value']) > 100): ?>
          <textarea name="value"><?=htmlspecialchars($item['value'])?></textarea>
        <?php else: ?>
          <input type="text" name="value" value="<?=htmlspecialchars($item['value'])?>">
        <?php endif; ?>
        <button type="submit" class="btn btn-sm btn-primary" style="margin-top:8px">Save</button>
      </div>
    </form>
  </div>
  <?php endforeach; ?>
</div>
<?php endforeach; ?>
</div></body></html>
