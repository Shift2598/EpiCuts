<?php
require_once __DIR__ . '/config.php';
$pdo = getDB();
$items = [
  ['hero', 'tagline', 'Where faith meets fades. Crafting confidence through precision cuts for over a decade.'],
  ['hero', 'subtext', 'Be the next pogi in town'],
  ['about', 'title', 'More Than a Haircut.'],
  ['about', 'subtitle', "It's an Experience."],
  ['about', 'text', "At EpiCuts, every snip is intentional, every fade is precise, and every client leaves feeling sharper than they walked in. We blend traditional barbering with modern techniques to give you a cut that speaks confidence."],
  ['about', 'feature1', '3+ Years Experience'],
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
  ['hero', 'stat_num1', '10+'],
  ['hero', 'stat_label1', 'Years Experience'],
  ['hero', 'stat_num2', '5K+'],
  ['hero', 'stat_label2', 'Happy Clients'],
  ['hero', 'stat_num3', '5.0'],
  ['hero', 'stat_label3', 'Star Rating'],
  ['services', 'section_label', 'What We Offer'],
  ['services', 'title', 'Our Services'],
  ['services', 'subtitle', 'Quality grooming at fair prices. No hidden fees, no surprises.'],
  ['services', 'svc1_name', 'Classic Haircut'],
  ['services', 'svc1_desc', 'Consultation, shampoo, precision cut, and style. The works.'],
  ['services', 'svc1_includes', 'Consultation|Shampoo & Cut|Hot Towel Finish'],
  ['services', 'svc2_name', 'Haircut + Beard'],
  ['services', 'svc2_desc', 'Our signature combo. Full haircut with beard sculpting and lineup.'],
  ['services', 'svc2_includes', 'Everything in Classic|Beard Sculpting|Edge & Line-Up'],
  ['services', 'svc2_badge', 'Most Popular'],
  ['services', 'svc3_name', 'Hot Towel Shave'],
  ['services', 'svc3_desc', 'Old-school straight razor shave. Pure relaxation.'],
  ['services', 'svc3_includes', 'Hot Towel Treatment|Straight Razor Shave|Moisturizer Finish'],
  ['services', 'svc4_name', 'Beard Trim'],
  ['services', 'svc4_desc', 'Shape, sculpt, and detail your beard to perfection.'],
  ['services', 'svc4_includes', 'Beard Shaping|Hot Oil Treatment|Edge Work'],
  ['services', 'dropdown_label', 'Select a Service'],
  ['services', 'dropdown_options', 'Haircut|Haircut + Beard|Hot Towel Shave|Beard Trim|Full Grooming Package'],

];
$stmt = $pdo->prepare("INSERT IGNORE INTO content (section, `key`, value) VALUES (?, ?, ?)");
foreach ($items as $row) $stmt->execute($row);
$pdo->exec("DELETE FROM content WHERE `key` = 'time_slots'");
echo "Migrated: added " . count($items) . " content fields.<br>";
echo 'Now <a href="/api/admin/content.php">go to admin Content</a> to edit them.';
