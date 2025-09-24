const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const ActivityLog = require('../models/ActivityLog');
const { generateOtp, verifyOtp } = require('../services/otpService');

// Request OTP
exports.requestOtp = async (req, res) => {
    const { email, phone, otpMethod } = req.body;

    try {
        const otp = await generateOtp(email, phone, otpMethod);

        res.json({ message: `OTP sent successfully via ${otpMethod}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate OTP' });
    }
};

// Verify OTP and Signup
exports.verifyOtpAndSignup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, phone, otpMethod, otp, username, password } = req.body;

    try {
        const isValidOtp = await verifyOtp(email, phone, otpMethod, otp);
        if (!isValidOtp) return res.status(400).json({ error: 'Invalid or expired OTP' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
            [username, email, phone, hashedPassword, 'user']
        );

        const userId = result.insertId;
        await new ActivityLog({ userId: userId.toString(), action: 'User signed up with OTP' }).save();

        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.requestPasswordReset = async (req, res) => {
    const { email, phone, otpMethod } = req.body;

    try {
        await generateOtp(email, phone, otpMethod);
        res.json({ message: `OTP sent successfully via ${otpMethod}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

exports.resetPassword = async (req, res) => {
    console.log('Request Body:', req.body);  // Debug log

    const { email, phone, otpMethod, otp, newPassword } = req.body || {};

    if (!email || !otpMethod || !otp || !newPassword) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const isValidOtp = await verifyOtp(email, phone, otpMethod, otp);
        if (!isValidOtp) return res.status(400).json({ error: 'Invalid OTP' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE email = ? OR phone = ?', [hashedPassword, email, phone]);

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const blacklistedTokens = new Set();

exports.logout = (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    blacklistedTokens.add(token);
    res.json({ message: 'Logged out successfully' });
};

