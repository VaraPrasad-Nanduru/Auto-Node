const express = require('express');
require('dotenv').config();
const connectMongo = require('./config/mongo');
const db = require('./config/db');  // Import MySQL
const routes = require('./routes');  // Centralized routes import
const cors = require('cors');       // ✅ Import CORS

const app = express();
app.use(express.json());

// ✅ Enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // use your deployed frontend URL
    credentials: true,
}));

// Connect to MongoDB
connectMongo()
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// ✅ Test MySQL Connection
(async () => {
    try {
        const [rows] = await db.query('SELECT 1');
        console.log('MySQL connected successfully');
    } catch (err) {
        console.error('MySQL connection error:', err);
    }
})();

// ------------------ TEST ROUTES ------------------

// Simple health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running!' });
});

// Test MySQL connection
app.get('/api/test-mysql', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 AS test');
        res.json({ success: true, rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Test MongoDB connection
app.get('/api/test-mongo', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const collections = await mongoose.connection.db.listCollections().toArray();
        res.json({ success: true, collections });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Test SMTP email sending
app.get('/api/test-email', async (req, res) => {
    const nodemailer = require('nodemailer');
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        let info = await transporter.sendMail({
            from: `"Test Server" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: "SMTP Test Email",
            text: "This is a test email from your deployed server."
        });

        res.json({ success: true, info });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Mount API routes
app.use('/api', routes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
