const { Pool } = require('pg');
require('dotenv').config();

const config = {
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.PG_SSL_CERT.replace(/\\n/g, '\n'),
  },
};

const pool = new Pool(config);


pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('connected to Postgres');
  }
});

module.exports = pool;