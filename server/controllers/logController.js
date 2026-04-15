const { HabitLog, Habit, User } = require('../models');
const { Op } = require('sequelize');
const { calculateLevel } = require('../utils/xpUtils');
const { updateStreak } = require('../services/streakService');

const completeHabit = async (req, res) => {
  try {
    const { habit_id, proof_type, proof_content } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const habit = await Habit.findOne({
      where: { id: habit_id, user_id: req.user.id, is_active: true },
    });

    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const existingLog = await HabitLog.findOne({ where: { habit_id, date: today } });
    if (existingLog?.completed) {
      return res.status(409).json({ error: 'Habit already completed today' });
    }

    if (!proof_type || (!proof_content && !req.file)) {
      return res.status(400).json({ error: 'Proof is required to complete a habit' });
    }

    const proofContent = req.file ? `/uploads/${req.file.filename}` : proof_content;

    const [log, created] = await HabitLog.findOrCreate({
      where: { habit_id, date: today },
      defaults: {
        completed: true,
        proof_type: req.file ? 'image' : proof_type,
        proof_content: proofContent,
        xp_earned: habit.xp_reward,
      },
    });

    if (!created && !log.completed) {
      await log.update({ 
        completed: true, 
        proof_type: req.file ? 'image' : proof_type, 
        proof_content: proofContent, 
        xp_earned: habit.xp_reward 
      });
    }

    const user = await User.findByPk(req.user.id);
    const oldLevel = user.level;
    const newXp = user.xp + habit.xp_reward;
    const newLevel = calculateLevel(newXp);

    await user.update({ xp: newXp, level: newLevel });

    const streakData = await updateStreak(habit);

    res.json({
      message: 'Habit completed!',
      log,
      xp_earned: habit.xp_reward,
      total_xp: newXp,
      level: newLevel,
      streak: streakData.current_streak,
      levelUp: newLevel > oldLevel,
    });
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({ error: 'Failed to complete habit' });
  }
};

const getAllLogs = async (req, res) => {
  try {
    const { start_date, end_date, habit_id } = req.query;
    const habits = await Habit.findAll({ where: { user_id: req.user.id, is_active: true }, attributes: ['id'] });
    const habitIds = habits.map(h => h.id);

    if (habitIds.length === 0) return res.json({ logs: [] });

    const whereClause = { habit_id: { [Op.in]: habitIds } };
    if (start_date && end_date) whereClause.date = { [Op.between]: [start_date, end_date] };
    if (habit_id) whereClause.habit_id = habit_id;

    const logs = await HabitLog.findAll({
      where: whereClause,
      include: [{ association: 'habit', attributes: ['name', 'icon', 'color', 'category'] }],
      order: [['date', 'DESC']],
    });

    res.json({ logs });
  } catch (error) {
    console.error('getAllLogs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

const getCalendarData = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ error: 'year and month are required' });

    const y = parseInt(year), m = parseInt(month);
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const habits = await Habit.findAll({ where: { user_id: req.user.id, is_active: true } });
    const habitIds = habits.map(h => h.id);

    const calendarData = {};
    for (let day = 1; day <= lastDay; day++) {
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      calendarData[dateStr] = { total: habitIds.length, completed: 0, logs: [] };
    }

    if (habitIds.length === 0) return res.json({ calendarData, habitCount: 0 });

    const logs = await HabitLog.findAll({
      where: { habit_id: { [Op.in]: habitIds }, date: { [Op.between]: [startDate, endDate] } },
      include: [{ association: 'habit', attributes: ['name', 'icon', 'color'] }],
    });

    for (const log of logs) {
      if (calendarData[log.date]) {
        calendarData[log.date].logs.push(log.toJSON());
        if (log.completed) calendarData[log.date].completed++;
      }
    }

    res.json({ calendarData, habitCount: habitIds.length });
  } catch (error) {
    console.error('getCalendarData error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
};

module.exports = { completeHabit, getAllLogs, getCalendarData };