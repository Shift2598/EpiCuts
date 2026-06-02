const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    message TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(section, key)
  );

  CREATE TABLE IF NOT EXISTS gallery_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS email_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host TEXT DEFAULT 'smtp.gmail.com',
    port INTEGER DEFAULT 465,
    user TEXT DEFAULT '',
    pass TEXT DEFAULT '',
    notify_email TEXT DEFAULT '',
    enabled INTEGER DEFAULT 0
  );
`);

// Migrate: add confirmation_token and notified columns if missing
const cols = db.prepare("PRAGMA table_info(bookings)").all().map(c => c.name);
if (!cols.includes('confirmation_token')) {
  db.exec("ALTER TABLE bookings ADD COLUMN confirmation_token TEXT DEFAULT ''");
}
if (!cols.includes('notified')) {
  db.exec("ALTER TABLE bookings ADD COLUMN notified INTEGER DEFAULT 0");
}

// Migrate: add sendgrid columns to email_config if missing
const emailCols = db.prepare("PRAGMA table_info(email_config)").all().map(c => c.name);
if (!emailCols.includes('sendgrid_api_key')) {
  db.exec("ALTER TABLE email_config ADD COLUMN sendgrid_api_key TEXT DEFAULT ''");
}
if (!emailCols.includes('sendgrid_from_email')) {
  db.exec("ALTER TABLE email_config ADD COLUMN sendgrid_from_email TEXT DEFAULT ''");
}
if (!emailCols.includes('resend_api_key')) {
  db.exec("ALTER TABLE email_config ADD COLUMN resend_api_key TEXT DEFAULT ''");
  db.exec("ALTER TABLE email_config ADD COLUMN resend_from_email TEXT DEFAULT ''");
}

// Seed default email config if not exists
const emailConfigExists = db.prepare('SELECT id FROM email_config').get();
if (!emailConfigExists) {
  db.prepare('INSERT INTO email_config (enabled) VALUES (0)').run();
}

// Seed default admin if not exists
const adminExists = db.prepare('SELECT id FROM admin WHERE username = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admin (username, password) VALUES (?, ?)').run('admin', hash);
  console.log('Default admin created: admin / admin123');
}

// Seed default content
const defaultContent = [
  ['hero', 'tagline', 'Where faith meets fades. Crafting confidence through precision cuts for over a decade.'],
  ['hero', 'subtext', 'Be the next pogi in town'],
  ['about', 'title', 'More Than a Haircut.'],
  ['about', 'subtitle', 'It\'s an Experience.'],
  ['about', 'text', 'At EpiCuts, every snip is intentional, every fade is precise, and every client leaves feeling sharper than they walked in. We blend traditional barbering with modern techniques to give you a cut that speaks confidence.'],
  ['about', 'feature1', '10+ Years Experience'],
  ['about', 'feature2', 'Certified Barbers'],
  ['about', 'feature3', 'Premium Products Only'],
  ['about', 'feature4', 'Walk-ins Welcome'],
  ['gallery', 'title', 'Our Work'],
  ['gallery', 'subtitle', 'Every cut tells a story'],
  ['contact', 'title', 'Get in Touch'],
  ['contact', 'subtitle', 'Ready for a fresh cut? Book your appointment or just walk in.'],
];

const insertContent = db.prepare('INSERT OR IGNORE INTO content (section, key, value) VALUES (?, ?, ?)');
const insertMany = db.transaction((items) => {
  for (const [section, key, value] of items) {
    insertContent.run(section, key, value);
  }
});
insertMany(defaultContent);

// Seed default gallery images
const existingImages = db.prepare('SELECT COUNT(*) as count FROM gallery_images').get().count;
if (existingImages === 0) {
  const defaultImages = [
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
  const insertImage = db.prepare('INSERT INTO gallery_images (title, subtitle, image_url, sort_order) VALUES (?, ?, ?, ?)');
  for (const [title, subtitle, url, order] of defaultImages) {
    insertImage.run(title, subtitle, url, order);
  }
}

module.exports = db;
