const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize SQLite Database
const dbFile = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS harvests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fruit_name TEXT NOT NULL,
    variety TEXT,
    quantity_kg REAL,
    status TEXT,
    date_harvested TEXT
  )
`);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- CRUD API ROUTES ---

// 1. READ: Get all harvest records
app.get('/api/harvests', (req, res) => {
  db.all('SELECT * FROM harvests ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// 2. CREATE: Add a new harvest record
app.post('/api/harvests', (req, res) => {
  const { fruit_name, variety, quantity_kg, status, date_harvested } = req.body;
  const query = `INSERT INTO harvests (fruit_name, variety, quantity_kg, status, date_harvested) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [fruit_name, variety, quantity_kg, status, date_harvested], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, success: true });
  });
});

// 3. UPDATE: Modify an existing record
app.put('/api/harvests/:id', (req, res) => {
  const { id } = req.params;
  const { fruit_name, variety, quantity_kg, status, date_harvested } = req.body;
  const query = `UPDATE harvests SET fruit_name = ?, variety = ?, quantity_kg = ?, status = ?, date_harvested = ? WHERE id = ?`;
  db.run(query, [fruit_name, variety, quantity_kg, status, date_harvested, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// 4. DELETE: Remove a record
app.delete('/api/harvests/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM harvests WHERE id = ?', id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});