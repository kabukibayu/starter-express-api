const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const initQuery = fs.readFileSync('./src/config/init.sql', 'utf-8');

const db = new Pool(process.env.POSTGRES_CONNECTION_TYPE === "url"
    ? {
        connectionString: process.env.POSTGRES_URL + "?sslmode=require",
    }
    : {
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DATABASE,
        password: process.env.POSTGRES_PASSWORD,
        port: parseInt(process.env.POSTGRES_PORT, 10),
    }
);

module.exports = { db, initQuery };