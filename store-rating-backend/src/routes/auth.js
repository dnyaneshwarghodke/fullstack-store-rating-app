// src/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateSignup } = require('../middleware/validation');

/**
 * @route   POST /auth/signup
 * @desc    Register a new (Normal) user
 * @access  Public
 */
router.post('/signup', validateSignup, async (req, res) => {
  const { name, email, address, password } = req.body;

  try {
    // 1. Check if user already exists
    // Using "User" and "email" with quotes to match the case-sensitive table
    const userCheck = await db.query('SELECT * FROM "User" WHERE "email" = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insert new user with "NORMAL" role by default
    // Using "User" and quoted columns to match the case-sensitive table
    const { rows } = await db.query(
      'INSERT INTO "User" ("name", "email", "password_hash", "address", "role") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, passwordHash, address, 'NORMAL']
    );

    const newUser = rows[0];
    delete newUser.password_hash; // Don't send the hash back

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


/**
 * @route   POST /auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    // Using "User" and "email" with quotes
    const { rows } = await db.query('SELECT * FROM "User" WHERE "email" = $1', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials (email)' });
    }
    const user = rows[0];

    // 2. Check if password matches
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials (password)' });
    }

    // 3. Create JWT Payload
    const payload = {
      userId: user.id,
      role: user.role,
      name: user.name
    };

    // 4. Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3h' }, // Token expires in 3 hours
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          message: 'Login successful',
          token: token,
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    // --- THIS IS THE CORRECTED LINE ---
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;