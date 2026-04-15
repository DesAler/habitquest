const { HabitLog, Habit, User } = require('../models');
const { Op } = require('sequelize');
const { calculateLevel, getXpForNextLevel } = require('../utils/xpUtils');
const { updateStreak } = require('../services/streakService');

const completeHabit = async (req, res) => {
  try {
    const { habit_id, proof_type, proof_content } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const habit = await Habit.findOne({
      where: { id: habit_id, user_id: req.user.id, is_active: true },
    });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    // Check if already completed today
    const existingLog = await HabitLog.findOne({
      where: { habit_id, date: today },
    });
    if (existingLog?.completed) {
      return res.status(409).json({ error: 'Habit already completed today' });
    }

    if (!proof_type || (!proof_content && !req.file)) {
      return res.status(400).json({ error: 'Proof is required to complete a habit' });
    }

    const proofContent = req.file
      ? `/uploads/${req.file.filename}`
      : proof_content;

    // Create or update the log
    const [log] = await HabitLog.upsert({
      habit_id,
      date: today,
      completed: true,
      proof_type: req.file ? 'image' : proof_type,
      proof_content: proofContent,
      xp_earned: habit.xp_reward,
    });

    // Award XP to user
    const user = await User.findByPk(req.user.id);
    const newXp = user.xp + habit.xp_reward;
    const newLevel = calculateLevel(newXp);
    await user.update({ xp: newXp, level: newLevel });

    // Update streak
    const streakData = await updateStreak(habit);

    res.json({
      message: 'Habit completed!',
      log,
      xp_earned: habit.xp_reward,
      total_xp: newXp,
      level: newLevel,
      streak: streakData.current_streak,
      levelUp: newLevel > user.level,
    });
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({ error: 'Failed to complete habit' });
  }
};

const getAllLogs = async (req, res) => {
  try {
    const { start_date, end_date, habit_id } = req.query;

    // Get all habits for the user
    const habits = await Habit.findAll({
      where: { user_id: req.user.id, is_active: true },
      attributes: ['id'],
    });
    const habitIds = habits.map(h => h.id);

    const whereClause = {
      habit_id: { [Op.in]: habitIds },
    };

    if (start_date && end_date) {
      whereClause.date = { [Op.between]: [start_date, end_date] };
    }
    if (habit_id) {
      whereClause.habit_id = habit_id;
    }

    const logs = await HabitLog.findAll({
      where: whereClause,
      include: [{ association: 'habit', attributes: ['name', 'icon', 'color', 'category'] }],
      order: [['date', 'DESC']],
    });

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

const getCalendarData = async (req, res) => {
  try {
    const { year, month } = req.query;
    const y = parseInt(year);
    const m = parseInt(month);

    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;

    const habits = await Habit.findAll({
      where: { user_id: req.user.id, is_active: true },
    });
    const habitIds = habits.map(h => h.id);

    const logs = await HabitLog.findAll({
      where: {
        habit_id: { [Op.in]: habitIds },
        date: { [Op.between]: [startDate, endDate] },
      },
      include: [{ association: 'habit', attributes: ['name', 'icon', 'color'] }],
    });

    // Group logs by date
    const calendarData = {};
    for (let day = 1; day <= lastDay; day++) {
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayLogs = logs.filter(l => l.date === dateStr);
      calendarData[dateStr] = {
        total: habitIds.length,
        completed: dayLogs.filter(l => l.completed).length,
        logs: dayLogs,
      };
    }

    res.json({ calendarData, habitCount: habitIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
};

module.exports = { completeHabit, getAllLogs, getCalendarData };