<?php
function getEmailConfig() {
  $pdo = getDB();
  $stmt = $pdo->query("SELECT * FROM email_config WHERE id = 1");
  return $stmt->fetch() ?: [];
}

function generateICS($booking) {
  $start = date('Ymd\THis\Z', strtotime($booking['date'] . ' ' . $booking['time']));
  $end = date('Ymd\THis\Z', strtotime($booking['date'] . ' ' . $booking['time'] . ' +1 hour'));
  return "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//EpiCuts//Booking//EN\r\nBEGIN:VEVENT\r\nDTSTART:{$start}\r\nDTEND:{$end}\r\nSUMMARY:{$booking['service']} - {$booking['name']}\r\nDESCRIPTION:Appointment at EpiCuts. Service: {$booking['service']}. Client: {$booking['name']}.\r\nSTATUS:CONFIRMED\r\nEND:VEVENT\r\nEND:VCALENDAR";
}

function smtpSend($to, $subject, $html, $ics = null) {
  $config = getEmailConfig();
  $host = $config['host'] ?: 'smtp.gmail.com';
  $port = (int)($config['port'] ?: 587);
  $user = $config['user'] ?? '';
  $pass = $config['pass'] ?? '';
  $from = $user ?: ($config['notify_email'] ?? 'noreply@epicuts.infinityfree.me');

  $errno = 0; $errstr = '';
  $fp = @stream_socket_client("tcp://{$host}:{$port}", $errno, $errstr, 15);
  if (!$fp) return false;

  $reads = function($fp) { $r = fgets($fp, 512); return $r; };
  $writes = function($fp, $cmd) { fwrite($fp, $cmd . "\r\n"); };

  $reads($fp); // banner

  $writes($fp, "EHLO epicuts");
  while ($line = $reads($fp)) { if ($line[3] === ' ') break; }

  $writes($fp, "STARTTLS");
  $reads($fp);
  stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);

  $writes($fp, "EHLO epicuts");
  while ($line = $reads($fp)) { if ($line[3] === ' ') break; }

  $writes($fp, "AUTH LOGIN");
  $reads($fp);
  $writes($fp, base64_encode($user));
  $reads($fp);
  $writes($fp, base64_encode($pass));
  $auth = $reads($fp);
  if ($auth[0] !== '2') { fclose($fp); return false; }

  $writes($fp, "MAIL FROM:<{$from}>");
  $reads($fp);
  $writes($fp, "RCPT TO:<{$to}>");
  $reads($fp);

  $boundary = md5(time());
  $headers = "From: EpiCuts Barber <{$from}>\r\nReply-To: {$from}\r\nSubject: {$subject}\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";
  $body = "--{$boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n{$html}\r\n\r\n";
  if ($ics) {
    $body .= "--{$boundary}\r\nContent-Type: text/calendar; method=REQUEST\r\nContent-Disposition: attachment; filename=\"appointment.ics\"\r\n\r\n{$ics}\r\n\r\n";
  }
  $body .= "--{$boundary}--";

  $writes($fp, "DATA");
  $reads($fp);
  $writes($fp, "{$headers}\r\n{$body}\r\n.");
  $res = $reads($fp);
  $writes($fp, "QUIT");
  fclose($fp);
  return $res[0] === '2';
}

function sendMail($to, $subject, $html, $ics = null) {
  $config = getEmailConfig();
  if (!$config || !$config['enabled']) return false;

  // Try SMTP if credentials are set
  if (!empty($config['user']) && !empty($config['pass'])) {
    $sent = smtpSend($to, $subject, $html, $ics);
    if ($sent) return true;
  }

  // Fallback: PHP mail()
  $from = $config['user'] ?: ($config['notify_email'] ?? 'noreply@epicuts.infinityfree.me');
  $boundary = md5(time());
  $headers = "From: EpiCuts Barber <{$from}>\r\nReply-To: {$from}\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=\"{$boundary}\"\r\nX-Mailer: PHP/" . phpversion() . "\r\n";
  $body = "--{$boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n{$html}\r\n\r\n";
  if ($ics) {
    $body .= "--{$boundary}\r\nContent-Type: text/calendar; method=REQUEST\r\nContent-Disposition: attachment; filename=\"appointment.ics\"\r\n\r\n{$ics}\r\n\r\n";
  }
  $body .= "--{$boundary}--";
  return mail($to, $subject, $body, $headers, "-f{$from}");
}

function sendBookingNotification($booking, $baseUrl) {
  $config = getEmailConfig();
  if (!$config || !$config['enabled'] || !$config['notify_email']) return false;

  $confirmUrl = "{$baseUrl}/api/bookings/confirm.php?token={$booking['confirmation_token']}";
  $declineUrl = "{$baseUrl}/api/bookings/decline.php?token={$booking['confirmation_token']}";
  $ics = generateICS($booking);

  $html = "<div style=\"font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#e0e0e0;border:2px solid #d4a843;padding:32px\">
    <h1 style=\"font-family:Oswald,sans-serif;color:#d4a843;text-transform:uppercase;letter-spacing:2px;margin-bottom:24px\">New Appointment Request</h1>
    <table style=\"width:100%;border-collapse:collapse\">
      <tr><td style=\"padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px\">Name</td><td style=\"padding:8px 0;color:#fff\">{$booking['name']}</td></tr>
      <tr><td style=\"padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px\">Email</td><td style=\"padding:8px 0;color:#fff\">{$booking['email']}</td></tr>
      <tr><td style=\"padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px\">Phone</td><td style=\"padding:8px 0;color:#fff\">{$booking['phone']}</td></tr>
      <tr><td style=\"padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px\">Service</td><td style=\"padding:8px 0;color:#fff\">{$booking['service']}</td></tr>
      <tr><td style=\"padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px\">Date</td><td style=\"padding:8px 0;color:#fff\">{$booking['date']}</td></tr>
      <tr><td style=\"padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px\">Time</td><td style=\"padding:8px 0;color:#fff\">{$booking['time']}</td></tr>
    </table>
    <div style=\"margin-top:32px;padding-top:24px;border-top:1px solid #333;text-align:center\">
      <a href=\"{$confirmUrl}\" style=\"display:inline-block;background:#27ae60;color:#fff;text-decoration:none;padding:14px 32px;margin-right:12px\">Confirm</a>
      <a href=\"{$declineUrl}\" style=\"display:inline-block;background:#c0392b;color:#fff;text-decoration:none;padding:14px 32px\">Decline</a>
    </div>
    <p style=\"text-align:center;margin-top:24px;font-size:0.75rem;color:#666\">EpiCuts Booking System</p>
  </div>";

  return sendMail($config['notify_email'], "New Booking: {$booking['service']} - {$booking['name']}", $html, $ics);
}

function sendCustomerConfirmation($booking) {
  $config = getEmailConfig();
  if (!$config || !$config['enabled']) return false;
  $ics = generateICS($booking);
  $html = "<div style=\"font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#e0e0e0;border:2px solid #d4a843;padding:32px\">
    <h1 style=\"font-family:Oswald,sans-serif;color:#27ae60;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px\">&#10003; Confirmed!</h1>
    <p style=\"color:#999;margin-bottom:24px\">Your appointment at <strong style=\"color:#d4a843\">EpiCuts</strong> is all set.</p>
    <table style=\"width:100%;border-collapse:collapse\"><tr><td style=\"padding:8px 0;color:#999\">Service</td><td style=\"padding:8px 0;color:#fff\">{$booking['service']}</td></tr>
      <tr><td style=\"padding:8px 0;color:#999\">Date</td><td style=\"padding:8px 0;color:#fff\">{$booking['date']}</td></tr>
      <tr><td style=\"padding:8px 0;color:#999\">Time</td><td style=\"padding:8px 0;color:#fff\">{$booking['time']}</td></tr></table>
    <p style=\"margin-top:24px;font-size:0.75rem;color:#666;text-align:center\">An .ics file is attached.</p>
  </div>";
  return sendMail($booking['email'], "Confirmed! Your {$booking['service']} on {$booking['date']}", $html, $ics);
}

function sendCustomerDecline($booking) {
  $config = getEmailConfig();
  if (!$config || !$config['enabled']) return false;
  $html = "<div style=\"font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#e0e0e0;border:2px solid #d4a843;padding:32px\">
    <h1 style=\"font-family:Oswald,sans-serif;color:#c0392b;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px\">Sorry, unavailable</h1>
    <p style=\"color:#999;margin-bottom:24px\">We couldn't accommodate your requested time at <strong style=\"color:#d4a843\">EpiCuts</strong>.</p>
    <table style=\"width:100%;border-collapse:collapse\"><tr><td style=\"padding:8px 0;color:#999\">Service</td><td style=\"padding:8px 0;color:#fff\">{$booking['service']}</td></tr>
      <tr><td style=\"padding:8px 0;color:#999\">Date</td><td style=\"padding:8px 0;color:#fff\">{$booking['date']}</td></tr>
      <tr><td style=\"padding:8px 0;color:#999\">Time</td><td style=\"padding:8px 0;color:#fff\">{$booking['time']}</td></tr></table>
  </div>";
  return sendMail($booking['email'], "Booking Update: {$booking['service']} on {$booking['date']}", $html);
}
