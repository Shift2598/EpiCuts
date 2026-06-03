<?php
require_once __DIR__ . '/config.php';
$pdo = getDB();
$items = [
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
foreach ($items as $row) $stmt->execute($row);
echo "Migrated: added " . count($items) . " content fields.<br>";
echo 'Now <a href="/api/admin/content.php">go to admin Content</a> to edit them.';
