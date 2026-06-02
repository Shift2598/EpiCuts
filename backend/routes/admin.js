const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `gallery-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/login', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin');
  res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', username);
    const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username);
    console.log('Admin found:', !!admin);
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.render('admin/login', { error: 'Invalid username or password' });
    }
    req.session.adminId = admin.id;
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.redirect('/admin');
    });
  } catch (err) {
    console.error('Login error:', err.message, err.stack);
    res.render('admin/login', { error: 'Server error: ' + err.message });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

router.get('/', requireAuth, (req, res) => {
  const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
  const pendingBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'").get().count;
  const confirmedBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'").get().count;
  const totalContacts = db.prepare('SELECT COUNT(*) as count FROM contacts').get().count;
  const todayBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE date = date('now')").get().count;

  const recentBookings = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5').all();
  const recentContacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5').all();

  res.render('admin/dashboard', {
    totalBookings,
    pendingBookings,
    confirmedBookings,
    totalContacts,
    todayBookings,
    recentBookings,
    recentContacts
  });
});

router.get('/bookings', requireAuth, (req, res) => {
  const status = req.query.status || '';
  let bookings;
  if (status) {
    bookings = db.prepare('SELECT * FROM bookings WHERE status = ? ORDER BY date DESC').all(status);
  } else {
    bookings = db.prepare('SELECT * FROM bookings ORDER BY date DESC').all();
  }
  res.render('admin/bookings', { bookings, currentStatus: status });
});

router.post('/bookings/:id/status', requireAuth, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
  res.redirect('/admin/bookings');
});

router.post('/bookings/:id/delete', requireAuth, (req, res) => {
  db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
  res.redirect('/admin/bookings');
});

router.get('/contacts', requireAuth, (req, res) => {
  const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
  res.render('admin/contacts', { contacts });
});

router.post('/contacts/:id/delete', requireAuth, (req, res) => {
  db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  res.redirect('/admin/contacts');
});

router.get('/content', requireAuth, (req, res) => {
  const content = db.prepare('SELECT * FROM content ORDER BY section, id').all();
  const grouped = {};
  content.forEach(item => {
    if (!grouped[item.section]) grouped[item.section] = [];
    grouped[item.section].push(item);
  });
  res.render('admin/content', { grouped });
});

router.post('/content/:id', requireAuth, (req, res) => {
  const { value } = req.body;
  db.prepare("UPDATE content SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(value, req.params.id);
  res.redirect('/admin/content');
});

router.get('/gallery', requireAuth, (req, res) => {
  const images = db.prepare('SELECT * FROM gallery_images ORDER BY sort_order ASC').all();
  res.render('admin/gallery', { images });
});

router.get('/gallery/add', requireAuth, (req, res) => {
  res.render('admin/gallery-form', { image: null, error: null });
});

router.post('/gallery/add', requireAuth, upload.single('image'), (req, res) => {
  const { title, subtitle, image_url } = req.body;
  let url = image_url;
  if (req.file) {
    url = '/uploads/' + req.file.filename;
  }
  if (!title || !url) {
    return res.render('admin/gallery-form', { image: null, error: 'Title and image are required' });
  }
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as m FROM gallery_images').get().m;
  db.prepare('INSERT INTO gallery_images (title, subtitle, image_url, sort_order) VALUES (?, ?, ?, ?)')
    .run(title, subtitle || '', url, maxOrder + 1);
  res.redirect('/admin/gallery');
});

router.get('/gallery/edit/:id', requireAuth, (req, res) => {
  const image = db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(req.params.id);
  if (!image) return res.redirect('/admin/gallery');
  res.render('admin/gallery-form', { image, error: null });
});

router.post('/gallery/edit/:id', requireAuth, upload.single('image'), (req, res) => {
  const { title, subtitle, image_url } = req.body;
  let url = image_url || null;
  if (req.file) {
    url = '/uploads/' + req.file.filename;
  }
  if (!title) {
    const img = db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(req.params.id);
    return res.render('admin/gallery-form', { image: img, error: 'Title is required' });
  }
  if (url) {
    db.prepare('UPDATE gallery_images SET title = ?, subtitle = ?, image_url = ? WHERE id = ?')
      .run(title, subtitle || '', url, req.params.id);
  } else {
    db.prepare('UPDATE gallery_images SET title = ?, subtitle = ? WHERE id = ?')
      .run(title, subtitle || '', req.params.id);
  }
  res.redirect('/admin/gallery');
});

router.post('/gallery/delete/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM gallery_images WHERE id = ?').run(req.params.id);
  res.redirect('/admin/gallery');
});

router.get('/email', requireAuth, (req, res) => {
  const config = db.prepare('SELECT * FROM email_config WHERE id = 1').get() || {};
  res.render('admin/email', { config, success: null });
});

router.post('/email', requireAuth, (req, res) => {
  const { host, port, user, pass, notify_email, enabled } = req.body;
  db.prepare('UPDATE email_config SET host=?, port=?, user=?, pass=?, notify_email=?, enabled=? WHERE id=1')
    .run(host || 'smtp.gmail.com', parseInt(port) || 587, user || '', pass || '', notify_email || '', enabled ? 1 : 0);
  const config = db.prepare('SELECT * FROM email_config WHERE id = 1').get() || {};
  res.render('admin/email', { config, success: 'Email settings saved!' });
});

router.post('/email/test', requireAuth, async (req, res) => {
  const config = db.prepare('SELECT * FROM email_config WHERE id = 1').get() || {};
  const nodemailer = require('nodemailer');
  try {
    const transporter = nodemailer.createTransport({
      host: config.host || 'smtp.gmail.com',
      port: config.port || 587,
      secure: (config.port || 587) == 465,
      auth: { user: config.user, pass: config.pass },
      connectionTimeout: 5000
    });
    await transporter.verify();
    res.json({ success: true, message: 'SMTP connection successful!' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;
