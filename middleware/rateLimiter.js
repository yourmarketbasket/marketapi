const mongoose = require('mongoose');
const RequestLog = require('../models/requestLog'); // Path to the RequestLog model

// Store timestamps in memory
const requestMemoryLog = {}; // Stores timestamps for each IP within the window

const requestLimit = 200; // Maximum requests allowed within `windowMs`
const windowMs = 60 * 1000; // 1-minute window
const minInterval = 10; // Minimum interval between requests in ms

const customLimiter = async (req, res, next) => {
    const ip = req.ip;
    const currentTime = Date.now();

    // Initialize log for new IP
    if (!requestMemoryLog[ip]) {
        requestMemoryLog[ip] = [];
    }

    // Filter out timestamps older than the time window
    requestMemoryLog[ip] = requestMemoryLog[ip].filter(timestamp => currentTime - timestamp < windowMs);

    // Check if the IP is making requests too quickly
    let interval = null;
    if (requestMemoryLog[ip].length > 0) {
        interval = currentTime - requestMemoryLog[ip][requestMemoryLog[ip].length - 1];
        if (interval < minInterval) {
            const logEntry = new RequestLog({
                ip,
                route: req.originalUrl,
                method: req.method,
                interval,
                status: 'blocked',
                message: 'Requests too frequent',
            });
            await logEntry.save();
            return res.status(429).json({ message: 'Too many requests. Please wait before trying again.' });
        }
    }

    // Add the current timestamp to the memory log
    requestMemoryLog[ip].push(currentTime);

    // Check if the IP has exceeded the request limit within the window
    if (requestMemoryLog[ip].length > requestLimit) {
        const logEntry = new RequestLog({
            ip,
            route: req.originalUrl,
            method: req.method,
            interval,
            status: 'blocked',
            message: 'Too many requests',
        });
        await logEntry.save();
        return res.status(429).json({ message: 'Too many requests. Try again after a minute.' });
    }

    // Log the request as allowed
    const logEntry = new RequestLog({
        ip,
        route: req.originalUrl,
        method: req.method,
        interval,
        status: 'allowed',
    });
    await logEntry.save();

    // Continue to the next middleware or route handler
    next();
};

module.exports = customLimiter;
