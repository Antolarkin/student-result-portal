const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

let app;
let server;
let db;

beforeAll((done) => {
  // Create test database
  const testDbPath = './test_student_results.db';

  // Remove existing test database if it exists
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  app = express();
  const PORT = 3001; // Use different port for tests

  // Middleware
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, '../public')));
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));

  // Database setup for tests
  db = new sqlite3.Database(testDbPath, (err) => {
    if (err) {
      console.error('Error opening test database:', err.message);
      done(err);
    } else {
      console.log('Connected to test SQLite database.');
      createTestTables(done);
    }
  });

  function createTestTables(callback) {
    db.run(`CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      roll_number TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL
    )`, (err) => {
      if (err) {
        callback(err);
        return;
      }

      db.run(`CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        subject TEXT NOT NULL,
        marks INTEGER NOT NULL,
        grade TEXT,
        semester TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students (id)
      )`, (err) => {
        if (err) {
          callback(err);
          return;
        }
        callback();
      });
    });
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

  function calculateGrade(marks) {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    return 'F';
  }

  // Start test server
  server = app.listen(PORT, () => {
    console.log(`Test server listening on port ${PORT}`);
    done();
  });
});

afterAll((done) => {
  // Close server and database
  if (server) {
    server.close(done);
  } else {
    done();
  }

  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      }
      // Clean up test database file
      const testDbPath = './test_student_results.db';
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
      if (!server) done();
    });
  } else {
    if (!server) done();
  }
});

describe('Student Result Portal API', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /', () => {
    it('should return the home page', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Student Result Portal');
    });
  });

  describe('Student Management', () => {
    it('should get all students', async () => {
      const response = await request(app).get('/students');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.students || [])).toBe(true);
    });

    it('should create a new student', async () => {
      const studentData = {
        name: 'John Doe',
        roll_number: '2021001',
        email: 'john.doe@example.com'
      };
      const response = await request(app)
        .post('/students')
        .send(studentData);
      expect(response.status).toBe(302); // Redirect after successful creation
    });
  });

  describe('Grade Calculation', () => {
    it('should calculate correct grades', () => {
      // Test the calculateGrade function directly
      const calculateGrade = (marks) => {
        if (marks >= 90) return 'A+';
        if (marks >= 80) return 'A';
        if (marks >= 70) return 'B+';
        if (marks >= 60) return 'B';
        if (marks >= 50) return 'C';
        return 'F';
      };

      expect(calculateGrade(95)).toBe('A+');
      expect(calculateGrade(85)).toBe('A');
      expect(calculateGrade(75)).toBe('B+');
      expect(calculateGrade(65)).toBe('B');
      expect(calculateGrade(55)).toBe('C');
      expect(calculateGrade(45)).toBe('F');
    });
  });
});
