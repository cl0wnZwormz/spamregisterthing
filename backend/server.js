const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.txt');

const FRONTEND_PATH = path.join(__dirname, '..', 'frontend');

app.use(bodyParser.json());
app.use(cors());

app.use(express.static(FRONTEND_PATH));

app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).send('Failed to read users file');
        }

        const users = data ? data.split('\n').filter(line => line).map(line => JSON.parse(line)) : [];
        const userExists = users.some(user => user.username === username);

        if (userExists) {
            return res.status(400).send('User already exists');
        }

        const newUser = { username, password };
        fs.appendFile(USERS_FILE, JSON.stringify(newUser) + '\n', (err) => {
            if (err) {
                return res.status(500).send('Failed to save user');
            }
            res.status(200).send('User registered successfully');
        });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Failed to read users file');
        }

        const users = data.trim().split('\n').map(line => JSON.parse(line));
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            res.status(200).json({ message: 'Login successful', redirectUrl: 'https://www.youtube.com/watch?v=xvFZjo5PgG0' });
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
