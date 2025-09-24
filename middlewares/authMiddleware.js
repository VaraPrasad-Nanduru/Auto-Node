const jwt = require('jsonwebtoken');
const blacklistedTokens = require('../config/blacklist'); 

module.exports = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    if (blacklistedTokens.has(token)) return res.status(401).json({ error: 'Token has been logged out' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    });
};
