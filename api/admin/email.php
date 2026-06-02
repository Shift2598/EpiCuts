<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/header.php';

$pdo = getDB();
$success = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $host = $_POST['host'] ?? 'smtp.gmail.com';
  $port = (int)($_POST['port'] ?? 587);
  $user = $_POST['user'] ?? '';
  $pass = $_POST['pass'] ?? '';
  $notify_email = $_POST['notify_email'] ?? '';
  $enabled = isset($_POST['enabled']) ? 1 : 0;

  $stmt = $pdo->prepare("SELECT id FROM email_config WHERE id = 1");
  if ($stmt->fetch()) {
    $pdo->prepare("UPDATE email_config SET host=?, port=?, `user`=?, `pass`=?, notify_email=?, enabled=? WHERE id=1")->execute([$host, $port, $user, $pass, $notify_email, $enabled]);
  } else {
    $pdo->prepare("INSERT INTO email_config (host, port, `user`, `pass`, notify_email, enabled) VALUES (?,?,?,?,?,?)")->execute([$host, $port, $user, $pass, $notify_email, $enabled]);
  }
  $success = 'Email settings saved!';
}

adminHeader('Email', 'email');

$config = $pdo->query("SELECT * FROM email_config WHERE id = 1")->fetch() ?: [];
?>
<div class="top-bar"><h1>Email Settings</h1></div>
<?php if ($success): ?><div class="success"><?=$success?></div><?php endif; ?>
<div class="form-card">
  <form method="POST">
    <div class="toggle-group">
      <input type="checkbox" name="enabled" value="1" <?=$config['enabled']?'checked':''?> id="emailToggle">
      <label for="emailToggle" style="margin:0;font-size:0.9rem;color:#fff">Enable Email Notifications</label>
    </div>
    <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:24px;padding:12px;background:var(--dark);border:1px solid var(--border)">
      <strong>SMTP setup:</strong> Use Gmail App Password for local. On Infinity Free, use PHP mail() or a transactional email service.
    </p>
    <div class="form-row" style="display:flex;gap:16px">
      <div class="form-group" style="flex:1"><label>SMTP Host</label><input type="text" name="host" value="<?=htmlspecialchars($config['host']?:'smtp.gmail.com')?>"></div>
      <div class="form-group" style="flex:1"><label>Port</label><input type="number" name="port" value="<?=htmlspecialchars($config['port']?:587)?>"></div>
    </div>
    <div class="form-group"><label>Email</label><input type="email" name="user" value="<?=htmlspecialchars($config['user']??'')?>" placeholder="your.email@gmail.com"></div>
    <div class="form-group"><label>Password</label><input type="password" name="pass" value="<?=htmlspecialchars($config['pass']??'')?>" placeholder="App Password"></div>
    <div class="form-group"><label>Notification Email</label><input type="email" name="notify_email" value="<?=htmlspecialchars($config['notify_email']??'')?>" placeholder="you@example.com"></div>
    <button type="submit" class="btn btn-primary">Save Settings</button>
  </form>
</div>
</div></body></html>
