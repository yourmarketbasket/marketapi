const jwt = require('jsonwebtoken');

const authenticator = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];

  // Log the current route where the request is being made
  const currentRoute = req.originalUrl;

  // Check if the Authorization header is set
  if (!authHeader) {
    console.log(`Access denied for ${currentRoute}. No token provided.`);
    return res.status(401).json({ message: `Access denied for ${currentRoute}. No token provided.` });
  }

  // The token is usually passed as 'Bearer <token>', so we split it
  const token = authHeader.split(' ')[1];

  // Check if there is a token after 'Bearer'
  if (!token) {
    console.log(`Access denied for ${currentRoute}. Invalid token. No token provided.`);
    return res.status(401).json({ message: `Access denied for ${currentRoute}. Invalid token. No token provided.` });
  }

  // Verify the token using the secret key
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user information to the request object
    req.user = decoded;

    // Call next() to pass control to the next middleware or route handler
    next();
  } catch (error) {
    console.log(`Access denied for ${currentRoute}. Invalid or expired token.`);
    
    // If token is invalid or expired
    return res.status(403).json({ message: `Access denied for ${currentRoute}. Invalid or expired token.` });
  }
};

module.exports = authenticator;
