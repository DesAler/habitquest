// routes/logs.js
const express = require('express');
const router = express.Router();
const { completeHabit, getAllLogs, getCalendarData } = require('../controllers/logController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(authenticate);
router.post('/complete', upload.single('proof_image'), completeHabit);
router.get('/', getAllLogs);
router.get('/calendar', getCalendarData);

module.exports = router;