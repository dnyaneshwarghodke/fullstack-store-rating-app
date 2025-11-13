// src/middleware/validation.js
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// --- Our existing user validation ---
const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters long'),
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('address')
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must be a maximum of 400 characters'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter and one special character'),
  
  handleValidationErrors
];

// --- Our existing rating validation ---
const validateRating = [
  body('store_id')
    .isInt({ min: 1 })
    .withMessage('store_id must be a valid number'),
  body('rating_value')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating value must be an integer between 1 and 5'),
  
  handleValidationErrors
];

// --- Our existing password change validation ---
const validatePasswordChange = [
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('New password must contain at least one uppercase letter and one special character'),

  handleValidationErrors
];

// --- NEW ADMIN USER CREATION VALIDATION ---
const validateAdminCreateUser = [
  // We re-use the same validation rules from validateSignup
  ...validateSignup,
  // And we add a new rule to validate the 'role'
  body('role')
    .trim()
    .isIn(['NORMAL', 'ADMIN', 'OWNER'])
    .withMessage("Role must be one of: 'NORMAL', 'ADMIN', 'OWNER'"),
  
  // Note: We don't need to call handleValidationErrors again,
  // as it's already included in the validateSignup array
];


module.exports = {
  validateSignup,
  validateRating,
  validatePasswordChange,
  validateAdminCreateUser // <-- Export the new function
};