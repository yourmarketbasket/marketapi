const jwt = require('jsonwebtoken');

const authenticator = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];

  // Check if the Authorization header is set
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // The token is usually passed as 'Bearer <token>', so we split it
  const token = authHeader.split(' ')[1];

  // Check if there is a token after 'Bearer'
  if (!token) {
    return res.status(401).json({ message: 'Access denied. Invalid token.' });
  }

  // Verify the token using the secret key
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user information to the request object
    req.user = decoded;

    // Call next() to pass control to the next middleware or route handler
    next();
  } catch (error) {
    // If token is invalid or expired
    return res.status(403).json({ message: 'Access denied. Invalid token.' });
  }
};

module.exports = authenticator;
