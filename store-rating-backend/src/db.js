// src/db.js
    const { Pool } = require('pg');
    require('dotenv').config(); // This loads the variables from .env
    
    // Create a new pool instance.
    // The Pool will automatically read the environment variables
    // (DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME)
    // that you set in the .env file.
    const pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
    
    // We'll export a simple 'query' function that will
    // be used to run all our database queries.
    module.exports = {
      query: (text, params) => pool.query(text, params),
    };