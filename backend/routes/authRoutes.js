const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, verifyLogin, resendCode, forgotPassword, resetPassword, googleAuth, googleRedirect, googleCallback, getMe, updateProfile, toggleFavorite } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/verify-login', verifyLogin);
router.post('/resend-code', resendCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/google', googleAuth);
router.get('/google/redirect', googleRedirect);
router.get('/google/callback', googleCallback);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.post('/favorites/:perfumeId', protect, toggleFavorite);

module.exports = router;
