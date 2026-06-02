<?php
require_once __DIR__ . '/../../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $username = $_POST['username'] ?? '';
  $password = $_POST['password'] ?? '';

  $pdo = getDB();
  $stmt = $pdo->prepare("SELECT * FROM admin WHERE username = ?");
  $stmt->execute([$username]);
  $admin = $stmt->fetch();

  if ($admin && password_verify($password, $admin['password'])) {
    $_SESSION['admin_id'] = $admin['id'];
    header('Location: index.php');
    exit;
  }

  $error = 'Invalid username or password';
}

$error = $error ?? null;
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Admin Login - EpiCuts</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#050505;color:#e0e0e0;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#111;border:1px solid #1e1e1e;padding:48px;width:400px;text-align:center}
h1{font-family:Oswald,sans-serif;font-size:1.5rem;color:#fff;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px}
h1 span{color:#d4a843}
p{color:#999;font-size:0.85rem;margin-bottom:32px}
.error{background:rgba(192,57,43,0.2);border:1px solid #c0392b;color:#c0392b;padding:12px;margin-bottom:24px;font-size:0.85rem}
.form-group{margin-bottom:20px;text-align:left}
.form-group label{display:block;font-size:0.75rem;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:8px}
.form-group input{width:100%;padding:12px 16px;background:#0a0a0a;border:1px solid #1e1e1e;color:#fff;font-size:0.9rem;outline:none}
.form-group input:focus{border-color:#d4a843}
.btn{padding:14px 32px;font-family:Oswald,sans-serif;font-size:0.9rem;text-transform:uppercase;letter-spacing:2px;border:none;cursor:pointer;background:#d4a843;color:#000;font-weight:600;width:100%}
.btn:hover{background:#e8c36a}
</style>
</head>
<body>
<div class="card">
  <h1>EPI <span>CUTS</span></h1>
  <p>Admin Panel</p>
  <?php if ($error): ?><div class="error"><?=htmlspecialchars($error)?></div><?php endif; ?>
  <form method="POST">
    <div class="form-group"><label>Username</label><input type="text" name="username" required></div>
    <div class="form-group"><label>Password</label><input type="password" name="password" required></div>
    <button type="submit" class="btn">Login</button>
  </form>
</div>
</body>
</html>
