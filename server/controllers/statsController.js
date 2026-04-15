const { Habit, HabitLog, User } = require('../models');
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const habits = await Habit.findAll({ where: { user_id: userId, is_active: true } });
    const habitIds = habits.map(h => h.id);

    // FIX: Guard empty habitIds to prevent SQLite crash
    if (habitIds.length === 0) {
      return res.json({
        today: { completed: 0, total: 0, rate: 0 },
        week: { completed: 0, total: 0, rate: 0 },
        month: { completed: 0, total: 0, rate: 0 },
        weeklyData: buildWeeklyData([], habitIds),
        streaks: [],
        totalHabits: 0,
        xp: req.user.xp,
        level: req.user.level,
      });
    }

    const todayLogs = await HabitLog.findAll({
      where: { habit_id: { [Op.in]: habitIds }, date: today, completed: true },
    });

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekLogs = await HabitLog.findAll({
      where: { habit_id: { [Op.in]: habitIds }, date: { [Op.between]: [weekStartStr, today] }, completed: true },
    });

    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthLogs = await HabitLog.findAll({
      where: { habit_id: { [Op.in]: habitIds }, date: { [Op.between]: [monthStartStr, today] }, completed: true },
    });

    const weeklyData = buildWeeklyData(weekLogs, habitIds);

    const streaks = habits
      .map(h => ({ name: h.name, streak: h.current_streak || 0, icon: h.icon }))
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5);

    const daysIntoMonth = new Date().getDate();

    res.json({
      today: { completed: todayLogs.length, total: habitIds.length, rate: habitIds.length > 0 ? Math.round((todayLogs.length / habitIds.length) * 100) : 0 },
      week: { completed: weekLogs.length, total: habitIds.length * 7, rate: habitIds.length > 0 ? Math.round((weekLogs.length / (habitIds.length * 7)) * 100) : 0 },
      month: { completed: monthLogs.length, total: habitIds.length * daysIntoMonth, rate: habitIds.length > 0 ? Math.round((monthLogs.length / (habitIds.length * daysIntoMonth)) * 100) : 0 },
      weeklyData,
      streaks,
      totalHabits: habitIds.length,
      xp: req.user.xp,
      level: req.user.level,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

function buildWeeklyData(weekLogs, habitIds) {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en', { weekday: 'short' });
    const count = weekLogs.filter(l => l.date === dateStr).length;
    data.push({ date: dateStr, day: dayName, completed: count, total: habitIds.length });
  }
  return data;
}

module.exports = { getDashboardStats };