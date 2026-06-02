<?php
require_once __DIR__ . '/config.php';
$pdo = getDB();
$items = [
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
