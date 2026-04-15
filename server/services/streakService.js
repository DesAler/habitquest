const { HabitLog } = require('../models');
const { Op } = require('sequelize');

const updateStreak = async (habit) => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const recentLogs = await HabitLog.findAll({
    where: {
      habit_id: habit.id,
      completed: true,
      date: { [Op.lte]: today },
    },
    order: [['date', 'DESC']],
    limit: 365,
  });

  if (recentLogs.length === 0) {
    await habit.update({ current_streak: 0 });
    return { current_streak: 0, longest_streak: habit.longest_streak };
  }

  // Calculate consecutive streak going back from today
  let streak = 0;
  let checkDate = today;

  for (const log of recentLogs) {
    if (log.date === checkDate) {
      streak++;
      const prevDate = new Date(new Date(checkDate).getTime() - 86400000);
      checkDate = prevDate.toISOString().split('T')[0];
    } else {
      break;
    }
  }

  const longestStreak = Math.max(streak, habit.longest_streak);
  await habit.update({ current_streak: streak, longest_streak: longestStreak });

  return { current_streak: streak, longest_streak: longestStreak };
};

const checkAndResetStreaks = async (userId) => {
  const { Habit } = require('../models');
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const habits = await Habit.findAll({
    where: { user_id: userId, is_active: true, current_streak: { [Op.gt]: 0 } },
  });

  for (const habit of habits) {
    const yesterdayLog = await HabitLog.findOne({
      where: { habit_id: habit.id, date: yesterday, completed: true },
    });

    if (!yesterdayLog) {
      await habit.update({ current_streak: 0 });
    }
  }
};

module.exports = { updateStreak, checkAndResetStreaks };