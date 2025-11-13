// src/routes/user.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { validatePasswordChange, validateAdminCreateUser } = require('../middleware/validation');

/**
 * @route   PUT /users/password
 * @desc    Update a user's own password
 * @access  Protected (Any logged-in user)
 */
router.put(
  '/password',
  [authenticateToken, validatePasswordChange],
  async (req, res) => {
    // ... (This code is unchanged)
    const { userId } = req.user;
    const { newPassword } = req.body;
    try {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);
      await db.query(
        'UPDATE "User" SET "password_hash" = $1 WHERE "id" = $2',
        [passwordHash, userId]
      );
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

/**
 * @route   POST /users
 * @desc    Admin: Create a new user (of any role)
 * @access  Protected (Admin Only)
 */
router.post(
  '/',
  [authenticateToken, authorizeRole('ADMIN'), validateAdminCreateUser],
  async (req, res) => {
    // ... (This code is unchanged)
    const { name, email, address, password, role } = req.body;
    try {
      const userCheck = await db.query('SELECT "id" FROM "User" WHERE "email" = $1', [email]);
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const { rows } = await db.query(
        'INSERT INTO "User" ("name", "email", "password_hash", "address", "role") VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, email, passwordHash, address, role]
      );
      const newUser = rows[0];
      delete newUser.password_hash;
      res.status(201).json({
        message: `User (${role}) created successfully`,
        user: newUser,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

/**
 * @route   GET /users
 * @desc    Admin: Get a list of all users with filters AND SORTING
 * @access  Protected (Admin Only)
 */
router.get(
  '/',
  [authenticateToken, authorizeRole('ADMIN')],
  async (req, res) => {
    // Get optional filter queries from the URL
    const { role, name, email, address } = req.query;
    
    // --- 1. NEW SORTING LOGIC ---
    const { sortBy, order } = req.query; // e.g., sortBy='name', order='DESC'
    
    // Whitelist of allowed sort columns (CRITICAL for security)
    // We use the *exact* quoted names from our database
    const allowedSortColumns = {
      'id': '"id"',
      'name': '"name"',
      'email': '"email"',
      'address': '"address"',
      'role': '"role"'
    };
    
    // Default sort
    let sortColumn = allowedSortColumns['id']; // Default to '"id"'
    let sortOrder = 'ASC'; // Default to Ascending

    // Validate and set sort column
    if (sortBy && allowedSortColumns[sortBy]) {
      sortColumn = allowedSortColumns[sortBy];
    }
    
    // Validate and set sort order
    if (order && (order.toUpperCase() === 'ASC' || order.toUpperCase() === 'DESC')) {
      sortOrder = order.toUpperCase();
    }
    // --- END OF SORTING LOGIC ---

    let baseQuery = 'SELECT "id", "name", "email", "address", "role" FROM "User"';
    let conditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // ... (Filter logic is unchanged)
    if (role) {
      conditions.push(`"role" = $${paramIndex}`);
      queryParams.push(role);
      paramIndex++;
    }
    if (name) {
      conditions.push(`"name" ILIKE $${paramIndex}`);
      queryParams.push(`%${name}%`);
      paramIndex++;
    }
    if (email) {
      conditions.push(`"email" ILIKE $${paramIndex}`);
      queryParams.push(`%${email}%`);
      paramIndex++;
    }
    if (address) {
      conditions.push(`"address" ILIKE $${paramIndex}`);
      queryParams.push(`%${address}%`);
      paramIndex++;
    }
    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    // --- 2. NEW DYNAMIC ORDER BY ---
    // We removed the hardcoded "ORDER BY" and add our dynamic one
    baseQuery += ` ORDER BY ${sortColumn} ${sortOrder}`;

    try {
      const { rows } = await db.query(baseQuery, queryParams);
      res.status(200).json(rows);

    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

/**
 * @route   GET /users/:id
 * @desc    Admin: Get details for a single user
 * @access  Protected (Admin Only)
 */
router.get(
  '/:id',
  [authenticateToken, authorizeRole('ADMIN')],
  async (req, res) => {
    // ... (This code is unchanged)
    const { id } = req.params;
    try {
      const userResult = await db.query('SELECT "id", "name", "email", "address", "role" FROM "User" WHERE "id" = $1', [id]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      let userDetails = userResult.rows[0];
      if (userDetails.role === 'OWNER') {
        const storeResult = await db.query(
          `SELECT 
            s."id" AS "store_id", s."name" AS "store_name",
            AVG(r."rating_value") AS "average_rating"
          FROM "Store" s
          LEFT JOIN "Rating" r ON s."id" = r."store_id"
          WHERE s."owner_id" = $1
          GROUP BY s."id"`,
          [id]
        );
        if (storeResult.rows.length > 0) {
          const storeInfo = storeResult.rows[0];
          userDetails.store_info = {
            ...storeInfo,
            average_rating: storeInfo.average_rating ? parseFloat(storeInfo.average_rating).toFixed(1) : null
          };
        }
      }
      res.status(200).json(userDetails);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

module.exports = router;