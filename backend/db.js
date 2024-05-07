require('dotenv').config({ path: '../.env' });

const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: 'localhost',
    database: 'partee',
    password: process.env.DB_PASS,
    port: 5432,
});

module.exports = pool;
