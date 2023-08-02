const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const initQuery = fs.readFileSync('./src/config/init.sql', 'utf-8');

const db = new Pool({
        connectionString: process.env.POSTGRES_URL + "?sslmode=require",
    }
);

module.exports = { db, initQuery };