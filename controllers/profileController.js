const db = require('../config/db');
const ActivityLog = require('../models/ActivityLog');

exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username AS username, email FROM users WHERE id = ?', [req.userId]);

        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        await new ActivityLog({ userId: req.userId.toString(), action: 'Profile viewed' }).save();
        res.json({ user: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
