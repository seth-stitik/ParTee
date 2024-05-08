require('dotenv').config({ path: '../.env' });

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Register a new user
router.post('/signup', asyncHandler(async (req, res) => {
    const {
        username,
        email,
        password,
        bio,
        favorite_course,
        handicap
    } = req.body;

    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Please fill out all fields');
    }
    
// Check if user already exists
const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
if (userExists.rows.length > 0) {
    res.status(400);
    throw new Error('User already exists');
}

// Hash password
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Insert user into database
const newUser = await pool.query(
    'INSERT INTO users (username, email, password, bio, favorite_course, handicap) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [username, email, hashedPassword, bio, favorite_course, handicap]
);

res.status(201).json(newUser.rows[0]);
}));

// User login
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please fill out all fields');
    }

    // Check for user by email
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
        //Create token
        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET,
            { expiresIn: '30d', }
        );

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            token: token
        });
    } else {
        res.status(400);
        throw new Error('Invalid Credentials');
    }
}));

// Protected route: Get user profile
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.id;  // The JWT must include 'id'

    const { rows } = await pool.query('SELECT username, email, bio, favorite_course, handicap FROM users WHERE id = $1', [userId]);
    if (rows.length > 0) {
        res.json(rows[0]);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
}));

module.exports = router;