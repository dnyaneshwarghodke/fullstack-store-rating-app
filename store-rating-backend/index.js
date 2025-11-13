// index.js
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const db = require('./src/db');

// --- Import Routes ---
const authRoutes = require('./src/routes/auth');
const storeRoutes = require('./src/routes/store');
const ratingRoutes = require('./src/routes/rating');
const userRoutes = require('./src/routes/user');
const dashboardRoutes = require('./src/routes/dashboard'); // <-- 1. IMPORT NEW ROUTES

const app = express();
const PORT = process.env.PORT || 3001; 

// --- Middleware ---
app.use(cors()); 
app.use(express.json()); 

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Store Rating API is running!');
});

app.get('/db-test', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT NOW()');
    res.status(200).json({
      message: 'Database connection successful!',
      time: rows[0].now,
    });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({
      message: 'Database connection failed',
      error: err.message,
    });
  }
});

// --- Use Auth Routes ---
app.use('/auth', authRoutes);
app.use('/stores', storeRoutes);
app.use('/ratings', ratingRoutes);
app.use('/users', userRoutes);
app.use('/dashboard', dashboardRoutes); // <-- 2. PLUG IN NEW ROUTES

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});