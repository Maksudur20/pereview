const express = require('express');
const router = express.Router();
const { register, login, googleAuth, googleRedirect, googleCallback, getMe, updateProfile, toggleFavorite } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/google/redirect', googleRedirect);
router.get('/google/callback', googleCallback);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.post('/favorites/:perfumeId', protect, toggleFavorite);

module.exports = router;
