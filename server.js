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
    origin: 'http://localhost:5173', // replace with your frontend URL
    credentials: true,               // if you plan to send cookies
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

// Mount all API routes under /api
app.use('/api', routes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
