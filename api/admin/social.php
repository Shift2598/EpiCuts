<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/header.php';

$pdo = getDB();
$saved = isset($_GET['saved']);

if (isset($_POST['instagram'], $_POST['facebook'], $_POST['tiktok'])) {
  $keys = ['instagram', 'facebook', 'tiktok'];
  $stmt = $pdo->prepare("INSERT INTO content (section, `key`, value) VALUES ('social', ?, ?) ON DUPLICATE KEY UPDATE value = ?");
  foreach ($keys as $k) {
    $stmt->execute([$k, $_POST[$k], $_POST[$k]]);
  }
  header('Location: social.php?saved=1');
  exit;
}

adminHeader('Social Links', 'social');

$stmt = $pdo->query("SELECT * FROM content WHERE section = 'social'");
$social = [];
foreach ($stmt->fetchAll() as $row) {
  $social[$row['key']] = $row['value'];
}
?>
<div class="top-bar"><h1>Social Links</h1></div>
<?php if ($saved): ?><div class="success">Social links saved!</div><?php endif; ?>
<div class="form-card">
  <form method="POST">
    <div class="form-group"><label>Instagram URL</label><input type="url" name="instagram" value="<?=htmlspecialchars($social['instagram']??'#')?>" placeholder="https://instagram.com/yourpage"></div>
    <div class="form-group"><label>Facebook URL</label><input type="url" name="facebook" value="<?=htmlspecialchars($social['facebook']??'#')?>" placeholder="https://facebook.com/yourpage"></div>
    <div class="form-group"><label>TikTok URL</label><input type="url" name="tiktok" value="<?=htmlspecialchars($social['tiktok']??'#')?>" placeholder="https://tiktok.com/@yourpage"></div>
    <button type="submit" class="btn btn-primary">Save Links</button>
  </form>
</div>
</div></body></html>
