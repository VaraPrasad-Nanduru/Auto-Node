const express = require('express');
const { requestOtp, verifyOtpAndSignup, login, requestPasswordReset, resetPassword, logout } = require('./controllers/authController');
const { getUsers } = require('./controllers/adminController');
const { getProfile } = require('./controllers/profileController');
const authMiddleware = require('./middlewares/authMiddleware');
const roleMiddleware = require('./middlewares/roleMiddleware');
const otpLimiter = require('./middlewares/otpLimiter');

const router = express.Router();

// OTP Routes
router.post('/auth/request-otp', otpLimiter, requestOtp);
router.post('/auth/verify-otp-signup', verifyOtpAndSignup);

// Auth routes
router.post('/auth/login', login);
router.post('/auth/request-password-reset', requestPasswordReset);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/logout', authMiddleware, logout);

// Admin routes
router.get('/admin/users', authMiddleware, roleMiddleware(['admin', 'superadmin']), getUsers);

// Profile route
router.get('/profile', authMiddleware, getProfile);


module.exports = router;
