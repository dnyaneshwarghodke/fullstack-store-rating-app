// src/routes/rating.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { validateRating } = require('../middleware/validation');

/**
 * @route   POST /ratings
 * @desc    Submit or Modify a rating for a store
 * @access  Protected (Normal User Only)
 */
router.post(
  '/',
  // We protect this route:
  // 1. Must be logged in (authenticateToken)
  // 2. Must be a 'NORMAL' user (authorizeRole)
  // 3. Input must be valid (validateRating)
  [authenticateToken, authorizeRole('NORMAL'), validateRating],
  async (req, res) => {
    // We get the user's ID from the token (thanks to authMiddleware)
    const { userId } = req.user;
    
    // We get the store ID and rating from the request body
    const { store_id, rating_value } = req.body;

    try {
      // This is an "UPSERT" query (UPDATE or INSERT)
      // It uses ON CONFLICT to be "smart"
      // We must use "Rating" and "user_id", etc. with quotes
      // to match our case-sensitive database tables
      const { rows } = await db.query(
        `INSERT INTO "Rating" ("user_id", "store_id", "rating_value") 
         VALUES ($1, $2, $3)
         ON CONFLICT ("user_id", "store_id") 
         DO UPDATE SET "rating_value" = $3, "updated_at" = NOW()
         RETURNING *`, // Return the row that was inserted or updated
        [userId, store_id, rating_value]
      );
      
      // We check if the 'created_at' and 'updated_at' times are the same.
      // This tells us if it was a new rating (INSERT) or a modified one (UPDATE).
      const rating = rows[0];
      const wasCreated = rating.created_at.getTime() === rating.updated_at.getTime();

      if (wasCreated) {
        res.status(201).json({ message: 'Rating submitted successfully', rating });
      } else {
        res.status(200).json({ message: 'Rating modified successfully', rating });
      }

    } catch (err) {
      console.error(err.message);
      // This is the "404 Not Found" error I was talking about before
      // It happens if the 'store_id' doesn't exist
      if (err.code === '23503') { // Foreign key violation
        return res.status(404).json({ message: 'Store not found.' });
      }
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

module.exports = router;