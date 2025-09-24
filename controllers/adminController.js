const db = require('../config/db');

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name AS username, email, role FROM users');
        res.json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.promoteUser = async (req, res) => {
    const { userId } = req.body;

    try {
        await db.query('UPDATE users SET role = "admin" WHERE id = ?', [userId]);
        res.json({ message: 'User promoted to admin' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.demoteAdmin = async (req, res) => {
    const { userId } = req.body;

    try {
        await db.query('UPDATE users SET role = "user" WHERE id = ?', [userId]);
        res.json({ message: 'Admin demoted to user' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
