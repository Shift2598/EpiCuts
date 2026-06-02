<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/header.php';

$pdo = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (isset($_POST['delete'], $_POST['id'])) {
    $pdo->prepare("DELETE FROM gallery_images WHERE id = ?")->execute([(int)$_POST['id']]);
    header('Location: gallery.php');
    exit;
  }

  $title = trim($_POST['title'] ?? '');
  $subtitle = trim($_POST['subtitle'] ?? '');
  $image_url = trim($_POST['image_url'] ?? '');
  $url = $image_url;

  if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../../uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $filename = 'gallery-' . time() . '.' . $ext;
    move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $filename);
    $url = '/uploads/' . $filename;
  }

  if (isset($_POST['id']) && $_POST['id'] > 0) {
    $id = (int)$_POST['id'];
    if ($url) {
      $pdo->prepare("UPDATE gallery_images SET title=?, subtitle=?, image_url=? WHERE id=?")->execute([$title, $subtitle, $url, $id]);
    } else {
      $pdo->prepare("UPDATE gallery_images SET title=?, subtitle=? WHERE id=?")->execute([$title, $subtitle, $id]);
    }
  } elseif ($title && $url) {
    $max = $pdo->query("SELECT COALESCE(MAX(sort_order),0) as m FROM gallery_images")->fetch();
    $pdo->prepare("INSERT INTO gallery_images (title, subtitle, image_url, sort_order) VALUES (?,?,?,?)")->execute([$title, $subtitle, $url, ($max['m']??0)+1]);
  }
  header('Location: gallery.php');
  exit;
}

adminHeader('Gallery', 'gallery');

$editImage = null;
if (isset($_GET['edit'])) {
  $stmt = $pdo->prepare("SELECT * FROM gallery_images WHERE id = ?");
  $stmt->execute([(int)$_GET['edit']]);
  $editImage = $stmt->fetch();
}

$images = $pdo->query("SELECT * FROM gallery_images ORDER BY sort_order ASC")->fetchAll();
?>
<div class="top-bar"><h1>Gallery</h1></div>

<div class="form-card" style="margin-bottom:32px">
  <h3 style="font-family:Oswald,sans-serif;color:var(--gold);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px"><?=$editImage?'Edit Image':'Add Image'?></h3>
  <form method="POST" enctype="multipart/form-data">
    <?php if ($editImage): ?><input type="hidden" name="id" value="<?=$editImage['id']?>"><?php endif; ?>
    <div class="form-group"><label>Title</label><input type="text" name="title" value="<?=htmlspecialchars($editImage['title']??'')?>" required></div>
    <div class="form-group"><label>Subtitle</label><input type="text" name="subtitle" value="<?=htmlspecialchars($editImage['subtitle']??'')?>"></div>
    <div class="form-group"><label>Image URL</label><input type="text" name="image_url" value="<?=htmlspecialchars($editImage['image_url']??'')?>" placeholder="https://..."></div>
    <div class="form-group"><label>Or Upload</label><input type="file" name="image" accept="image/*"></div>
    <button type="submit" class="btn btn-primary"><?=$editImage?'Update':'Add'?></button>
    <?php if ($editImage): ?><a href="gallery.php" class="btn btn-sm" style="margin-left:8px;color:var(--text-muted)">Cancel</a><?php endif; ?>
  </form>
</div>

<div class="gallery-grid">
  <?php foreach ($images as $img): ?>
  <div class="gallery-card">
    <img src="<?=htmlspecialchars($img['image_url'])?>" alt="<?=htmlspecialchars($img['title'])?>" loading="lazy">
    <div class="info"><h3><?=htmlspecialchars($img['title'])?></h3><p><?=htmlspecialchars($img['subtitle'])?></p></div>
    <div class="actions">
      <a href="gallery.php?edit=<?=$img['id']?>" class="btn btn-sm btn-primary">Edit</a>
      <form method="POST" style="display:inline"><input type="hidden" name="id" value="<?=$img['id']?>"><button type="submit" name="delete" class="btn btn-sm btn-danger" onclick="return confirm('Delete?')">Delete</button></form>
    </div>
  </div>
  <?php endforeach; ?>
</div>
</div></body></html>
