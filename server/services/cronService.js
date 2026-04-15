const cron = require('node-cron');
const { User, Habit, HabitLog } = require('../models');
const { Op } = require('sequelize');
const { sendDeadlineReminder, sendMissedHabitAlert } = require('./emailService');

const startCronJobs = () => {
  // Reset streaks at midnight — runs at 00:05 every day
  cron.schedule('5 0 * * *', async () => {
    console.log('🕐 Running streak reset job...');
    try {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const habits = await Habit.findAll({
        where: { is_active: true, current_streak: { [Op.gt]: 0 } },
      });

      for (const habit of habits) {
        const yesterdayLog = await HabitLog.findOne({
          where: { habit_id: habit.id, date: yesterday, completed: true },
        });
        if (!yesterdayLog) {
          await habit.update({ current_streak: 0 });
        }
      }
      console.log(`✅ Streak reset job completed for ${habits.length} habits`);
    } catch (error) {
      console.error('Streak reset job error:', error);
    }
  });

  // Deadline reminders — runs at 09:00 every day
  cron.schedule('0 9 * * *', async () => {
    console.log('🕐 Running deadline reminder job...');
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const deadlineStr = threeDaysFromNow.toISOString().split('T')[0];

      const habits = await Habit.findAll({
        where: { deadline: deadlineStr, is_active: true },
        include: [{ association: 'user', attributes: ['email', 'username'] }],
      });

      for (const habit of habits) {
        await sendDeadlineReminder(habit.user, habit);
      }
      console.log(`✅ Sent ${habits.length} deadline reminders`);
    } catch (error) {
      console.error('Deadline reminder job error:', error);
    }
  });

  // Missed habit alerts — runs at 20:00 every day
  cron.schedule('0 20 * * *', async () => {
    console.log('🕐 Running missed habit alert job...');
    try {
      const today = new Date().toISOString().split('T')[0];
      const users = await User.findAll({ attributes: ['id', 'email', 'username'] });

      for (const user of users) {
        const habits = await Habit.findAll({
          where: { user_id: user.id, is_active: true },
        });

        const missedHabits = [];
        for (const habit of habits) {
          const log = await HabitLog.findOne({
            where: { habit_id: habit.id, date: today, completed: true },
          });
          if (!log) missedHabits.push(habit);
        }

        if (missedHabits.length > 0) {
          await sendMissedHabitAlert(user, missedHabits);
        }
      }
    } catch (error) {
      console.error('Missed habit alert job error:', error);
    }
  });

  console.log('✅ Cron jobs registered');
};

module.exports = { startCronJobs };