require('dotenv').config({ path: '../.env' });

const express = require('express');
const ansyncHandler = require('express-async-handler');
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Add a score
router.post('/', authenticateToken, ansyncHandler(async (req, res) => {
    const { date_played, score, course } = req.body;
    const userId = req.user.id;

    if (!date_played || !score || !course) {
        res.status(400).json({ message: 'Please provide all required fields' });
        return;
    }

    const result = await pool.query(
        'INSERT INTO scores (user_id, date_played, score, course) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, date_played, score, course]
    );

    res.status(201).json(result.rows[0]);
}));

module.exports = router;
        