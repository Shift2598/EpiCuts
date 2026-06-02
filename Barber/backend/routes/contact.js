const express = require('express');
const db = require('../database');

const router = express.Router();

router.post('/', (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  try {
    db.prepare(`
      INSERT INTO contacts (name, email, phone, message)
      VALUES (?, ?, ?, ?)
    `).run(name, email, phone || '', message);

    res.json({ success: true, message: 'Message sent! We\'ll get back to you soon.' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
