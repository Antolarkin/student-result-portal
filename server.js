const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database setup
const db = new sqlite3.Database('./student_results.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    createTables();
  }
});

function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    roll_number TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    subject TEXT NOT NULL,
    marks INTEGER NOT NULL,
    grade TEXT,
    semester TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students (id)
  )`);
}

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.render('students', { students: rows });
  });
});

app.get('/students/new', (req, res) => {
  res.render('new-student');
});

app.post('/students', (req, res) => {
  const { name, roll_number, email } = req.body;
  db.run('INSERT INTO students (name, roll_number, email) VALUES (?, ?, ?)',
    [name, roll_number, email], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.redirect('/students');
  });
});

app.get('/students/:id/results', (req, res) => {
  const studentId = req.params.id;
  db.get('SELECT * FROM students WHERE id = ?', [studentId], (err, student) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    db.all('SELECT * FROM results WHERE student_id = ?', [studentId], (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.render('student-results', { student, results });
    });
  });
});

app.get('/students/:id/results/new', (req, res) => {
  const studentId = req.params.id;
  db.get('SELECT * FROM students WHERE id = ?', [studentId], (err, student) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.render('new-result', { student });
  });
});

app.post('/students/:id/results', (req, res) => {
  const studentId = req.params.id;
  const { subject, marks, semester } = req.body;
  const grade = calculateGrade(marks);
  db.run('INSERT INTO results (student_id, subject, marks, grade, semester) VALUES (?, ?, ?, ?, ?)',
    [studentId, subject, marks, grade, semester], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.redirect(`/students/${studentId}/results`);
  });
});

app.get('/api/students/:id/results', (req, res) => {
  const studentId = req.params.id;
  db.all('SELECT * FROM results WHERE student_id = ?', [studentId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// New endpoint to demonstrate Git workflow
app.get('/demo', (req, res) => {
  res.json({
    message: 'This is a demo endpoint added to demonstrate Git workflow',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    status: 'active'
  });
});

function calculateGrade(marks) {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B+';
  if (marks >= 60) return 'B';
  if (marks >= 50) return 'C';
  return 'F';
}

// Start server
app.listen(PORT, () => {
  console.log(`Student Result Portal listening on port ${PORT}`);
});

module.exports = app;
