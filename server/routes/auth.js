// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, upload.single('avatar'), updateProfile);
router.put('/password', authenticate, changePassword);

module.exports = router;