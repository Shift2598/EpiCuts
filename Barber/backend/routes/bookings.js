const express = require('express');
const crypto = require('crypto');
const db = require('../database');
const { sendBookingNotification, sendCustomerConfirmation, sendCustomerDecline } = require('../mail');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, phone, service, date, time, message } = req.body;

  if (!name || !email || !phone || !service || !date || !time) {
    return res.status(400).json({ error: 'All required fields must be filled' });
  }

  try {
    const token = crypto.randomBytes(16).toString('hex');
    const result = db.prepare(`
      INSERT INTO bookings (name, email, phone, service, date, time, message, confirmation_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, email, phone, service, date, time, message || '', token);

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const emailed = await sendBookingNotification(booking, baseUrl);

    if (emailed) {
      db.prepare('UPDATE bookings SET notified = 1 WHERE id = ?').run(booking.id);
    }

    res.json({
      success: true,
      message: emailed
        ? 'Booking request sent! Check your email for confirmation.'
        : 'Booking received! We\'ll confirm shortly.'
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.get('/:token/confirm', async (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE confirmation_token = ?').get(req.params.token);
  if (!booking) {
    return res.send('<h1>Invalid or expired link</h1>');
  }
  db.prepare("UPDATE bookings SET status = 'confirmed' WHERE id = ?").run(booking.id);
  await sendCustomerConfirmation(booking);
  res.send(`
    <html><body style="background:#050505;color:#e0e0e0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
      <div style="text-align:center;border:2px solid #d4a843;padding:48px;background:#111">
        <h1 style="color:#27ae60;font-family:Oswald,sans-serif;text-transform:uppercase">&#10003; Confirmed!</h1>
        <p style="margin-top:16px">${booking.service} on ${booking.date} at ${booking.time} for ${booking.name}.</p>
        <p style="margin-top:8px;color:#999;font-size:0.85rem">A confirmation email with calendar attachment has been sent to <strong>${booking.email}</strong>.</p>
        <div style="margin-top:24px;border:1px solid #333;padding:16px;font-size:0.8rem;color:#999">
          <p style="margin-bottom:4px">An .ics file was also attached to <strong>your</strong> email.</p>
          <p>Click the attachment to add to your calendar.</p>
        </div>
      </div>
    </body></html>
  `);
});

router.get('/:token/decline', async (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE confirmation_token = ?').get(req.params.token);
  if (!booking) {
    return res.send('<h1>Invalid or expired link</h1>');
  }
  db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(booking.id);
  await sendCustomerDecline(booking);
  res.send(`
    <html><body style="background:#050505;color:#e0e0e0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
      <div style="text-align:center;border:2px solid #d4a843;padding:48px;background:#111">
        <h1 style="color:#c0392b;font-family:Oswald,sans-serif;text-transform:uppercase">Declined</h1>
        <p style="margin-top:16px">Booking for ${booking.name} has been cancelled.</p>
        <p style="margin-top:8px;color:#999;font-size:0.85rem">A notification has been sent to <strong>${booking.email}</strong>.</p>
      </div>
    </body></html>
  `);
});

router.get('/', (req, res) => {
  const bookings = db.prepare('SELECT * FROM bookings ORDER BY date DESC').all();
  res.json(bookings);
});

module.exports = router;
