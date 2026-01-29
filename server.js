const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const app = express();

// Configuration from env (easy to override on panels)
const PORT = process.env.PORT || 3000;
const SESS_DB = process.env.SESS_DB || 'sessions.sqlite';
const USERS_DB = process.env.USERS_DB || 'database.sqlite';
const SESSION_SECRET = process.env.SESSION_SECRET || 'gazake-secret-proto';
const TRUST_PROXY = process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true';
const COOKIE_SECURE = process.env.COOKIE_SECURE === '1' || process.env.COOKIE_SECURE === 'true';
const ADMIN_KEY = process.env.ADMIN_KEY || null;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// If behind a reverse proxy (like EasyPanel), enable trust proxy when configured
if (TRUST_PROXY) app.set('trust proxy', 1);

app.use(session({
  store: new SQLiteStore({ db: SESS_DB, dir: __dirname }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, secure: COOKIE_SECURE }
}));

// Serve static site
app.use(express.static(path.join(__dirname)));

// Setup DB (users)
const DB_PATH = path.join(__dirname, USERS_DB);
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) return console.error('DB open error', err);
  console.log('Connected to SQLite DB:', DB_PATH);
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);
});

// Signup
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Campos faltando' });
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro interno' });
    if (row) return res.status(400).json({ error: 'Usuário já existe' });
    const hash = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (name, email, password) VALUES (?,?,?)', [name, email, hash], function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao criar usuário' });
      return res.json({ ok: true });
    });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Campos faltando' });
  db.get('SELECT id, name, email, password FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro interno' });
    if (!row) return res.status(401).json({ error: 'Credenciais inválidas' });
    const match = bcrypt.compareSync(password, row.password);
    if (!match) return res.status(401).json({ error: 'Credenciais inválidas' });
    req.session.user = { id: row.id, email: row.email, name: row.name };
    return res.json({ ok: true, user: req.session.user });
  });
});

// Current user
app.get('/api/me', (req, res) => {
  if (req.session && req.session.user) return res.json({ user: req.session.user });
  return res.json({ user: null });
});

// Admin: list users (protected)
function checkAdmin(req) {
  const provided = (req.headers['x-admin-key'] || (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.query.admin_key || '');
  return ADMIN_KEY && provided && provided === ADMIN_KEY;
}

app.get('/admin/users', (req, res) => {
  if (!ADMIN_KEY) return res.status(403).json({ error: 'Admin key not configured' });
  if (!checkAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  db.all('SELECT id, name, email FROM users ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro interno' });
    return res.json({ users: rows });
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Erro ao sair' });
    res.clearCookie('connect.sid');
    return res.json({ ok: true });
  });
});

app.listen(PORT, () => console.log(`Server running on http://0.0.0.0:${PORT}`));
