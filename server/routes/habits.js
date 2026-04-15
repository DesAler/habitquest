const express = require('express');
const router = express.Router();
const { getHabits, getHabit, createHabit, updateHabit, deleteHabit, getHabitCalendar } = require('../controllers/habitController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getHabits);
router.get('/:id', getHabit);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.get('/:id/calendar', getHabitCalendar);

module.exports = router;