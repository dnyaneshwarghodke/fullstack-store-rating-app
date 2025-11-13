// src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

/**
 * @route   GET /dashboard/my-store/summary
 * @desc    Get average rating and store info for the logged-in Store Owner
 * @access  Protected (Store Owner Only)
 */
router.get(
  '/my-store/summary',
  [authenticateToken, authorizeRole('OWNER')],
  async (req, res) => {
    // We get the user's ID from their token
    const { userId } = req.user;

    try {
      // This query finds the store linked to this owner
      // and uses a LEFT JOIN to calculate the average rating.
      const { rows } = await db.query(
        `SELECT 
          s."id" AS "store_id", 
          s."name", 
          s."address", 
          AVG(r."rating_value") AS "average_rating",
          COUNT(r."id") AS "total_ratings"
        FROM 
          "Store" s
        LEFT JOIN 
          "Rating" r ON s."id" = r."store_id"
        WHERE 
          s."owner_id" = $1
        GROUP BY 
          s."id"`,
        [userId]
      );

      // If the query returns no rows, it means this user doesn't own a store
      if (rows.length === 0) {
        return res.status(404).json({ message: 'No store found for this owner.' });
      }
      
      const storeData = rows[0];

      res.status(200).json({
        ...storeData,
        // The AVG function returns a string, so we parse it to a number
        // and format it to 1 decimal place.
        average_rating: storeData.average_rating ? parseFloat(storeData.average_rating).toFixed(1) : null,
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

/**
 * @route   GET /dashboard/my-store/raters
 * @desc    Get a list of users who have rated the logged-in Store Owner's store
 * @access  Protected (Store Owner Only)
 */
router.get(
  '/my-store/raters',
  [authenticateToken, authorizeRole('OWNER')],
  async (req, res) => {
    // We get the user's ID from their token
    const { userId } = req.user;

    try {
      // This query joins 3 tables: Store, Rating, and User
      // to get the details of everyone who rated the store
      // that belongs to this owner (userId).
      const { rows } = await db.query(
        `SELECT 
          u."name", 
          u."email", 
          u."address", 
          r."rating_value", 
          r."updated_at" AS "rated_at"
        FROM 
          "User" u
        JOIN 
          "Rating" r ON u."id" = r."user_id"
        JOIN 
          "Store" s ON r."store_id" = s."id"
        WHERE 
          s."owner_id" = $1
        ORDER BY
          r."updated_at" DESC`, // Show most recent ratings first
        [userId]
      );

      // If no one has rated the store, this will just return an empty array []
      res.status(200).json(rows);

    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// --- NEW ADMIN ROUTE ---

/**
 * @route   GET /dashboard/admin-stats
 * @desc    Get dashboard stats for the System Administrator
 * @access  Protected (Admin Only)
 */
router.get(
  '/admin-stats',
  [authenticateToken, authorizeRole('ADMIN')],
  async (req, res) => {
    try {
      // We run 3 simple count queries in parallel
      // 
      const userCountPromise = db.query('SELECT COUNT(*) FROM "User"');
      const storeCountPromise = db.query('SELECT COUNT(*) FROM "Store"');
      const ratingCountPromise = db.query('SELECT COUNT(*) FROM "Rating"');

      // We wait for all of them to finish
      const [userResult, storeResult, ratingResult] = await Promise.all([
        userCountPromise,
        storeCountPromise,
        ratingCountPromise
      ]);

      // Extract the counts (and parse from string to number)
      const stats = {
        total_users: parseInt(userResult.rows[0].count, 10),
        total_stores: parseInt(storeResult.rows[0].count, 10),
        total_ratings: parseInt(ratingResult.rows[0].count, 10),
      };

      res.status(200).json(stats);

    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);


module.exports = router;