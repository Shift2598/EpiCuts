<?php
require_once __DIR__ . '/config.php';

try {
  $pdo = getDB();

  $pdo->exec("CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    service VARCHAR(200) NOT NULL,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    message TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'pending',
    confirmation_token VARCHAR(100) DEFAULT '',
    notified TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section VARCHAR(100) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(section, `key`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS gallery_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(200) DEFAULT '',
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS email_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    host VARCHAR(200) DEFAULT 'smtp.gmail.com',
    port INT DEFAULT 587,
    `user` VARCHAR(200) DEFAULT '',
    `pass` TEXT DEFAULT '',
    notify_email VARCHAR(200) DEFAULT '',
    enabled TINYINT DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  // Seed admin
  $stmt = $pdo->prepare("SELECT id FROM admin WHERE username = ?");
  $stmt->execute(['admin']);
  if (!$stmt->fetch()) {
    $hash = password_hash('admin123', PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO admin (username, password) VALUES (?, ?)");
    $stmt->execute(['admin', $hash]);
    echo "Default admin created: admin / admin123\n";
  }

  // Seed email config
  $stmt = $pdo->query("SELECT id FROM email_config");
  if (!$stmt->fetch()) {
    $pdo->exec("INSERT INTO email_config (enabled) VALUES (0)");
  }

  // Seed content
  $stmt = $pdo->query("SELECT COUNT(*) as c FROM content");
  $row = $stmt->fetch();
  if ($row['c'] == 0) {
    $content = [
      ['hero', 'tagline', 'Where faith meets fades. Crafting confidence through precision cuts for over a decade.'],
      ['hero', 'subtext', 'Be the next pogi in town'],
      ['about', 'title', 'More Than a Haircut.'],
      ['about', 'subtitle', "It's an Experience."],
      ['about', 'text', "At EpiCuts, every snip is intentional, every fade is precise, and every client leaves feeling sharper than they walked in. We blend traditional barbering with modern techniques to give you a cut that speaks confidence."],
      ['about', 'feature1', '10+ Years Experience'],
      ['about', 'feature2', 'Certified Barbers'],
      ['about', 'feature3', 'Premium Products Only'],
      ['about', 'feature4', 'Walk-ins Welcome'],
      ['gallery', 'title', 'Our Work'],
      ['gallery', 'subtitle', 'Every cut tells a story'],
      ['contact', 'title', 'Get in Touch'],
      ['contact', 'subtitle', 'Ready for a fresh cut? Book your appointment or just walk in.'],
      ['contact', 'address', '123 Main Street, Downtown'],
      ['contact', 'phone', '(555) 123-4567'],
      ['contact', 'email', 'hello@epicuts.com'],
      ['general', 'logo', 'EPI'],
      ['general', 'logo_accent', 'CUTS'],
      ['general', 'hours', 'Tue - Sat: 9AM - 7PM | Sun: 10AM - 4PM | Mon: Closed'],
    ];
    $stmt = $pdo->prepare("INSERT IGNORE INTO content (section, `key`, value) VALUES (?, ?, ?)");
    foreach ($content as $row) {
      $stmt->execute($row);
    }
  }

  // Seed gallery images
  $stmt = $pdo->query("SELECT COUNT(*) as c FROM gallery_images");
  $row = $stmt->fetch();
  if ($row['c'] == 0) {
    $images = [
      ['Mid Fade', 'clean & sharp', 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=450&fit=crop', 1],
      ['Skin Fade', 'always fresh', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=450&fit=crop', 2],
      ['Taper Fade', 'professional & clean', 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=450&fit=crop', 3],
      ['Beard Sculpt', 'a masterpiece', 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&h=450&fit=crop', 4],
      ['Hot Towel Shave', 'pure relaxation', 'https://images.unsplash.com/photo-1585747860019-024af2b58016?w=600&h=450&fit=crop', 5],
      ['Precision Cut', 'attention to detail', 'https://images.unsplash.com/photo-1503951914875-452cb2b3f721?w=600&h=450&fit=crop', 6],
      ['Line Up', 'crisp edges', 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=600&h=450&fit=crop', 7],
      ['Clipper Work', 'smooth fades', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600&h=450&fit=crop', 8],
      ['Scissor Cut', 'texture & flow', 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=450&fit=crop', 9],
    ];
    $stmt = $pdo->prepare("INSERT INTO gallery_images (title, subtitle, image_url, sort_order) VALUES (?, ?, ?, ?)");
    foreach ($images as $row) {
      $stmt->execute($row);
    }
  }

  echo "Database initialized successfully!\n";
  echo "Run this file only once, then delete it for security.\n";
} catch (Exception $e) {
  die("Error: " . $e->getMessage() . "\n");
}
