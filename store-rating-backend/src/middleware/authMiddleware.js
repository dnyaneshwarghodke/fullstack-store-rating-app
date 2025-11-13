// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate a user's token.
 * This is our main "gatekeeper".
 */
const authenticateToken = (req, res, next) => {
  // Get the 'Authorization' header from the request
  // It's expected to be in the format: "Bearer YOUR_TOKEN_HERE"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Get just the token part

  // If no token was provided, send a 401 Unauthorized error
  if (token == null) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Try to verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // If the token is invalid (expired, wrong secret), send a 403 Forbidden error
    if (err) {
      return res.status(403).json({ message: 'Token is invalid or expired' });
    }

    // --- SUCCESS ---
    // The token is valid!
    // We attach the user's details (from the token payload) to the 'req' object.
    // Now, any *following* route handler can access 'req.user' to see who is logged in.
    req.user = user;
    
    // Call 'next()' to pass the request on to the *next* function in the chain (the actual route)
    next();
  });
};

/**
 * Middleware to authorize based on user role.
 * This is our "VIP list checker".
 * It MUST run *after* authenticateToken.
 */
const authorizeRole = (requiredRole) => {
  // This is a "higher-order function" - it returns the actual middleware function
  return (req, res, next) => {
    // We check the user's role (which we attached in 'authenticateToken')
    if (req.user.role !== requiredRole) {
      // If their role doesn't match, send a 403 Forbidden error
      return res.status(403).json({ 
        message: `Access denied. You must be an '${requiredRole}' to perform this action.` 
      });
    }

    // --- SUCCESS ---
    // The user has the correct role.
    // Call 'next()' to pass them on to the route handler.
    next();
  };
};

// Export both functions so we can use them in other files
module.exports = {
  authenticateToken,
  authorizeRole,
};