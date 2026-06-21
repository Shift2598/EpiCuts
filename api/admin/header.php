<?php
function adminHeader($title, $active) {
  requireAdmin();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title><?=$title?> - EpiCuts Admin</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--gold:#d4a843;--gold-light:#e8c36a;--dark:#0a0a0a;--darker:#050505;--card:#111;--text:#e0e0e0;--text-muted:#999;--border:#1e1e1e;--green:#27ae60;--red:#c0392b}
body{font-family:'Inter',sans-serif;background:var(--darker);color:var(--text)}
a{color:var(--gold);text-decoration:none}
.sidebar{position:fixed;left:0;top:0;width:240px;height:100vh;background:var(--card);border-right:2px solid var(--border);padding:32px 24px;display:flex;flex-direction:column}
.sidebar h2{font-family:Oswald,sans-serif;font-size:1.3rem;color:#fff;text-transform:uppercase;letter-spacing:2px;margin-bottom:32px}
.sidebar h2 span{color:var(--gold)}
.sidebar nav{display:flex;flex-direction:column;gap:4px}
.sidebar nav a{padding:12px 16px;color:var(--text-muted);font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;border-left:3px solid transparent;transition:all .3s}
.sidebar nav a:hover,.sidebar nav a.active{color:var(--gold);border-left-color:var(--gold);background:rgba(212,168,67,0.05)}
.sidebar .logout{margin-top:auto;padding-top:24px;border-top:1px solid var(--border)}
.main{margin-left:240px;padding:32px 40px}
.top-bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px}
.top-bar h1{font-family:Oswald,sans-serif;font-size:1.8rem;color:#fff;text-transform:uppercase;letter-spacing:2px}
.success{background:rgba(39,174,96,0.2);border:1px solid var(--green);color:var(--green);padding:12px 16px;margin-bottom:24px;font-size:0.85rem}
.card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:32px}
.stat-card{background:var(--card);border:1px solid var(--border);padding:24px}
.stat-card .num{font-family:Oswald,sans-serif;font-size:2rem;color:var(--gold)}
.stat-card .label{font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-top:4px}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--border)}
th{padding:12px 16px;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);border-bottom:1px solid var(--border)}
td{padding:12px 16px;font-size:0.85rem;border-bottom:1px solid var(--border)}
tr:hover{background:var(--dark)}
.tag{padding:4px 12px;font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;font-weight:600}
.tag-pending{background:rgba(243,156,18,0.2);color:#f39c12}
.tag-confirmed{background:rgba(39,174,96,0.2);color:#27ae60}
.tag-cancelled{background:rgba(192,57,43,0.2);color:#c0392b}
.btn{padding:10px 20px;font-family:Oswald,sans-serif;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;border:none;cursor:pointer;font-weight:600;display:inline-block}
.btn-primary{background:var(--gold);color:#000}
.btn-primary:hover{background:var(--gold-light)}
.btn-sm{padding:6px 12px;font-size:0.7rem}
.btn-danger{background:var(--red);color:#fff}
.btn-success{background:var(--green);color:#fff}
.form-card{background:var(--card);border:1px solid var(--border);padding:32px;max-width:600px}
.form-group{margin-bottom:20px}
.form-group label{display:block;font-size:0.75rem;text-transform:uppercase;letter-spacing:2px;color:var(--text-muted);margin-bottom:8px}
.form-group input,.form-group select,.form-group textarea{width:100%;padding:12px 16px;background:var(--dark);border:1px solid var(--border);color:#fff;font-family:'Inter',sans-serif;font-size:0.9rem;outline:none}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:var(--gold)}
.form-group textarea{min-height:100px;resize:vertical}
.toggle-group{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.toggle-group input[type="checkbox"]{width:20px;height:20px;accent-color:var(--gold)}
.btn-row{display:flex;gap:12px;margin-top:32px;align-items:center}
.gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px}
.gallery-card{background:var(--card);border:1px solid var(--border);overflow:hidden}
.gallery-card img{width:100%;height:150px;object-fit:cover}
.gallery-card .info{padding:12px}
.gallery-card .info h3{font-size:0.9rem;color:#fff;margin-bottom:4px}
.gallery-card .info p{font-size:0.75rem;color:var(--text-muted)}
.gallery-card .actions{padding:8px 12px;border-top:1px solid var(--border);display:flex;gap:8px}
.filter-bar{margin-bottom:24px}
.filter-bar a{display:inline-block;padding:8px 16px;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);border:1px solid var(--border);margin-right:4px}
.filter-bar a.active{color:var(--gold);border-color:var(--gold)}
</style>
</head>
<body>
<aside class="sidebar">
  <h2>EPI <span>CUTS</span></h2>
  <nav>
    <a href="index.php" class="<?=$active==='dashboard'?'active':''?>">Dashboard</a>
    <a href="bookings.php" class="<?=$active==='bookings'?'active':''?>">Bookings</a>

    <a href="gallery.php" class="<?=$active==='gallery'?'active':''?>">Gallery</a>
    <a href="content.php" class="<?=$active==='content'?'active':''?>">Content</a>
    <a href="social.php" class="<?=$active==='social'?'active':''?>">Social</a>
    <a href="email.php" class="<?=$active==='email'?'active':''?>">Email</a>
  </nav>
  <div class="logout"><a href="logout.php">Logout</a></div>
</aside>
<div class="main">
<?php } ?>
