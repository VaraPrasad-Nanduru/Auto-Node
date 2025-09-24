const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 min
    max: 3,
    message: "Too many OTP requests from this IP. Please try again later."
});
