// src/routes/store.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

/**
 * @route   POST /stores
 * @desc    Admin: Add a new store
 * @access  Protected (Admin Only)
 */
router.post(
  '/',
  [authenticateToken, authorizeRole('ADMIN')],
  async (req, res) => {
    // ... (This code is unchanged)
    const adminUserId = req.user.userId;
    const { name, email, address, owner_id } = req.body;
    try {
      const { rows } = await db.query(
        'INSERT INTO "Store" ("name", "email", "address", "owner_id") VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, address, owner_id]
      );
      res.status(201).json({ 
        message: `Store added successfully by Admin (ID: ${adminUserId})`, 
        store: rows[0] 
      });
    } catch (err) {
      console.error(err.message);
      if (err.code === '23505') {
        return res.status(400).json({ message: 'A store with this name already exists.' });
      }
      res.status(500).json({ message: 'Server error', error: err.message }); 
    }
  }
);

/**
 * @route   GET /stores
 * @desc    Normal User: Get a list of all stores with ratings and search
 * @access  Protected (All Logged-in Users)
 */
router.get(
  '/',
  authenticateToken, 
  async (req, res) => {
    // ... (This code is unchanged)
    const { userId } = req.user;
    const { search } = req.query;
    let sql = `
      SELECT 
        s."id", s."name", s."address", s."email",
        (SELECT AVG(r."rating_value") FROM "Rating" r WHERE r."store_id" = s."id") AS "overall_rating",
        (SELECT r."rating_value" FROM "Rating" r WHERE r."store_id" = s."id" AND r."user_id" = $1) AS "user_rating"
      FROM "Store" s
    `;
    let queryParams = [userId];
    if (search) {
      sql += ` WHERE s."name" ILIKE $2 OR s."address" ILIKE $2`;
      queryParams.push(`%${search}%`);
    }
    try {
      const { rows } = await db.query(sql, queryParams);
      const stores = rows.map(store => ({
        ...store,
        overall_rating: store.overall_rating ? parseFloat(store.overall_rating).toFixed(1) : null,
        user_rating: store.user_rating ? parseInt(store.user_rating, 10) : null
      }));
      res.status(200).json(stores);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// --- NEW ADMIN ROUTE ---

/**
 * @route   GET /stores/admin-list
 * @desc    Admin: Get a list of all stores with filters
 * @access  Protected (Admin Only)
 */
router.get(
  '/admin-list',
  [authenticateToken, authorizeRole('ADMIN')],
  async (req, res) => {
    const { name, email, address } = req.query;

    // This query is similar to the user one, but simpler:
    // It only gets the overall_rating and has more filters.
    // 
    let baseQuery = `
      SELECT 
        s."id", 
        s."name", 
        s."email", 
        s."address",
        (
          SELECT AVG(r."rating_value") 
          FROM "Rating" r 
          WHERE r."store_id" = s."id"
        ) AS "overall_rating"
      FROM 
        "Store" s
    `;
    
    let conditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Build the WHERE clause dynamically
    if (name) {
      conditions.push(`s."name" ILIKE $${paramIndex}`);
      queryParams.push(`%${name}%`);
      paramIndex++;
    }
    if (email) {
      conditions.push(`s."email" ILIKE $${paramIndex}`);
      queryParams.push(`%${email}%`);
      paramIndex++;
    }
    if (address) {
      conditions.push(`s."address" ILIKE $${paramIndex}`);
      queryParams.push(`%${address}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    baseQuery += ' ORDER BY s."id" ASC';

    try {
      const { rows } = await db.query(baseQuery, queryParams);
      // Clean up the rating number
      const stores = rows.map(store => ({
        ...store,
        overall_rating: store.overall_rating ? parseFloat(store.overall_rating).toFixed(1) : null,
      }));
      res.status(200).json(stores);

    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);


module.exports = router;