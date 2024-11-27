require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database');
});

// Routes

// 1. Add a new contact
app.post('/api/contact', (req, res) => {
    // console.log(req.body);
    const { name, email, phone, location, dob } = req.body;

    // validation
    if (!name || !email || !phone || !location || !dob) {
        return res.status(400).send('All fields are required');
    }

    // name validation
    if (name.length < 3) {
        return res.status(400).send('Name must be at least 3 characters long');
    }

    // email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send('Invalid email format');
    }

    // phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).send('Invalid phone number format');
    }

    // location validation
    if (location.length < 3) {
        return res.status(400).send('Location must be at least 3 characters long');
    }

    // dob validation
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dob)) {
        return res.status(400).send('Invalid date of birth format');
    }

    const sql = 'INSERT INTO contactForm (name, email, phone, location, dob) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, email, phone, location, dob], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to add contact');
        }
        console.log("Contact added successfully");
        res.status(201).send({ id: result.insertId, message: 'Contact added successfully' });
    });
});

// 2. Get all contacts
app.get('/api/contacts', (req, res) => {
    const sql = 'SELECT * FROM contactForm';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to fetch contacts');
        }
        res.send(results);
    });
});

// 3. Get a single contact by ID
app.get('/api/contact/:id', (req, res) => {
    const sql = 'SELECT * FROM contactForm WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to fetch contact');
        }
        if (result.length === 0) {
            return res.status(404).send('Contact not found');
        }
        res.send(result[0]);
    });
});

// 4. Update a contact
app.put('/api/contact/:id', (req, res) => {
    const { name, email, phone, location, dob } = req.body;
    const sql = 'UPDATE contactForm SET name = ?, email = ?, phone = ?, location = ?, dob = ? WHERE id = ?';
    db.query(sql, [name, email, phone, location, dob, req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to update contact');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Contact not found');
        }
        res.send('Contact updated successfully');
    });
});

// 5. Delete a contact
app.delete('/api/contact/:id', (req, res) => {
    const sql = 'DELETE FROM contactForm WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to delete contact');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Contact not found');
        }
        res.send('Contact deleted successfully');
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
