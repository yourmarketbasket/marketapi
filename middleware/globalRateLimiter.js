const rateLimit = require('express-rate-limit');
const RequestLog = require('../models/requestLog'); // Adjust the path as necessary

// Store timestamps for request intervals
const requestTimestamps = {};

// Middleware to log request details and apply rate limiting
const logAndLimitRequests = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2000, // Limit total requests to 2000 per minute
  message: 'Too many requests, please try again later.',
  
  // Custom IP-based key generator to avoid X-Forwarded-For issues
  keyGenerator: (req) => req.ip, 

  handler: async (req, res) => {
    const ip = req.ip;
    const requestLog = new RequestLog({
      ip,
      route: req.originalUrl,
      method: req.method,
      interval: null, // No interval for blocked requests
      status: 'blocked',
      message: 'Request blocked due to rate limit',
    });

    // Save the log for the blocked request
    await requestLog.save();
    res.status(429).json({ message: 'Too many requests. Try again later.' });
  },
});

// Middleware to log allowed requests and store the interval
const logRequest = async (req, res, next) => {
  const currentTime = Date.now();
  const ip = req.ip;

  // Calculate interval from the previous request
  const previousTimestamp = requestTimestamps[ip] || currentTime;
  const interval = currentTime - previousTimestamp;
  requestTimestamps[ip] = currentTime; // Update the timestamp for the current request

  // Create a log entry with request details
  const requestLog = new RequestLog({
    ip,
    route: req.originalUrl,
    method: req.method,
    interval,
    status: 'allowed',
    message: null, // No message for allowed requests
  });

  // Log request details after response is sent
  res.on('finish', async () => {
    try {
      await requestLog.save();
    } catch (error) {
      console.error('Error logging request:', error);
    }
  });

  next();
};

// Combine both middleware for use
const combinedMiddleware = (req, res, next) => {
  // First, apply the global rate limit
  logAndLimitRequests(req, res, async () => {
    // If not blocked, log the request
    await logRequest(req, res, next);
  });
};

module.exports = combinedMiddleware;
