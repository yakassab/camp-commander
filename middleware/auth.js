// Basic authentication middleware for Camp Commander application

/**
 * Middleware to protect routes requiring authentication
 * In a production app, this would verify JWT tokens or session data
 */
exports.protect = (req, res, next) => {
  try {
    // For development, we'll just add a mock user to the request
    // In production, you would verify tokens/sessions here
    req.user = {
      username: 'camp_director',
      role: 'director'
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param {Array} roles - Array of roles allowed to access the route
 */
exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to perform this action'
      });
    }
    
    next();
  };
};
