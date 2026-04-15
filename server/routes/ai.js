const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authFile = require('../middleware/auth'); 

// Умная защита: находим функцию авторизации, даже если это объект
let authMiddleware = (req, res, next) => next(); 
if (typeof authFile === 'function') {
    authMiddleware = authFile;
} else if (authFile && typeof authFile.auth === 'function') {
    authMiddleware = authFile.auth;
} else if (authFile && typeof authFile.verifyToken === 'function') {
    authMiddleware = authFile.verifyToken;
}

// Теперь передаем 100% функции
router.post('/chat', authMiddleware, aiController.getChatResponse);

module.exports = router;