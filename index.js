const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: __dirname }),
  secret: 'gazake-secret-proto',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Serve static site
app.use(express.static(path.join(__dirname)));

// Setup DB
const DB_PATH = path.join(__dirname, 'database.sqlite');
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

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Erro ao sair' });
    res.clearCookie('connect.sid');
    return res.json({ ok: true });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
