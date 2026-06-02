const express = require('express');
const db = require('../database');

const router = express.Router();

router.get('/', (req, res) => {
  const content = db.prepare('SELECT * FROM content ORDER BY section, id').all();
  res.json(content);
});

router.get('/:section', (req, res) => {
  const content = db.prepare('SELECT * FROM content WHERE section = ?').all(req.params.section);
  res.json(content);
});

module.exports = router;
