const { Habit, HabitLog, User } = require('../models');
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const habits = await Habit.findAll({
      where: { user_id: userId, is_active: true },
    });
    const habitIds = habits.map(h => h.id);

    // Today's completions
    const todayLogs = await HabitLog.findAll({
      where: {
        habit_id: { [Op.in]: habitIds },
        date: today,
        completed: true,
      },
    });

    // This week's data
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const weekLogs = await HabitLog.findAll({
      where: {
        habit_id: { [Op.in]: habitIds },
        date: { [Op.between]: [weekStartStr, today] },
        completed: true,
      },
    });

    // This month's data
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    const monthLogs = await HabitLog.findAll({
      where: {
        habit_id: { [Op.in]: habitIds },
        date: { [Op.between]: [monthStartStr, today] },
        completed: true,
      },
    });

    // Build weekly chart data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en', { weekday: 'short' });
      const count = weekLogs.filter(l => l.date === dateStr).length;
      weeklyData.push({ date: dateStr, day: dayName, completed: count, total: habitIds.length });
    }

    // Best streaks
    const streaks = habits.map(h => ({ name: h.name, streak: h.current_streak, icon: h.icon }));
    streaks.sort((a, b) => b.streak - a.streak);

    const user = await User.findByPk(userId, { attributes: ['xp', 'level'] });

    res.json({
      today: {
        completed: todayLogs.length,
        total: habitIds.length,
        rate: habitIds.length > 0 ? Math.round((todayLogs.length / habitIds.length) * 100) : 0,
      },
      week: {
        completed: weekLogs.length,
        total: habitIds.length * 7,
        rate: habitIds.length > 0 ? Math.round((weekLogs.length / (habitIds.length * 7)) * 100) : 0,
      },
      month: {
        completed: monthLogs.length,
        total: habitIds.length * new Date().getDate(),
        rate: habitIds.length > 0
          ? Math.round((monthLogs.length / (habitIds.length * new Date().getDate())) * 100) : 0,
      },
      weeklyData,
      streaks: streaks.slice(0, 5),
      totalHabits: habitIds.length,
      xp: user.xp,
      level: user.level,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = { getDashboardStats };