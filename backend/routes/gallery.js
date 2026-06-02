const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../database');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `gallery-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', (req, res) => {
  const images = db.prepare('SELECT * FROM gallery_images ORDER BY sort_order ASC').all();
  res.json(images);
});

router.post('/', upload.single('image'), (req, res) => {
  const { title, subtitle, image_url } = req.body;
  let url = image_url;
  if (req.file) {
    url = '/uploads/' + req.file.filename;
  }
  if (!title || !url) {
    return res.status(400).json({ error: 'Title and image are required' });
  }
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as m FROM gallery_images').get().m;
  db.prepare('INSERT INTO gallery_images (title, subtitle, image_url, sort_order) VALUES (?, ?, ?, ?)')
    .run(title, subtitle || '', url, maxOrder + 1);
  res.json({ success: true });
});

router.put('/:id', upload.single('image'), (req, res) => {
  const { title, subtitle, image_url } = req.body;
  let url = image_url;
  if (req.file) {
    url = '/uploads/' + req.file.filename;
  }
  if (url) {
    db.prepare('UPDATE gallery_images SET title = ?, subtitle = ?, image_url = ? WHERE id = ?')
      .run(title, subtitle || '', url, req.params.id);
  } else {
    db.prepare('UPDATE gallery_images SET title = ?, subtitle = ? WHERE id = ?')
      .run(title, subtitle || '', req.params.id);
  }
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM gallery_images WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.post('/reorder', (req, res) => {
  const { ids } = req.body;
  if (Array.isArray(ids)) {
    ids.forEach((id, index) => {
      db.prepare('UPDATE gallery_images SET sort_order = ? WHERE id = ?').run(index + 1, id);
    });
  }
  res.json({ success: true });
});

module.exports = router;
