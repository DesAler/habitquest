const { Habit, HabitLog } = require('../models');
const { Op } = require('sequelize');

const getHabits = async (req, res) => {
  try {
    const habits = await Habit.findAll({
      where: { user_id: req.user.id, is_active: true },
      order: [['createdAt', 'DESC']],
    });

    // Add today's completion status to each habit
    const today = new Date().toISOString().split('T')[0];
    const habitsWithStatus = await Promise.all(habits.map(async (habit) => {
      const todayLog = await HabitLog.findOne({
        where: { habit_id: habit.id, date: today },
      });
      return {
        ...habit.toJSON(),
        completedToday: !!todayLog?.completed,
        todayLog: todayLog || null,
      };
    }));

    res.json({ habits: habitsWithStatus });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
};

const getHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ association: 'logs', limit: 30, order: [['date', 'DESC']] }],
    });

    if (!habit) return res.status(404).json({ error: 'Habit not found' });
    res.json({ habit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habit' });
  }
};

const createHabit = async (req, res) => {
  try {
    const { name, description, category, deadline, frequency, xp_reward, color, icon } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const habit = await Habit.create({
      user_id: req.user.id,
      name,
      description,
      category,
      deadline: deadline || null,
      frequency: frequency || 'daily',
      xp_reward: xp_reward || 10,
      color: color || '#6366f1',
      icon: icon || '⭐',
    });

    res.status(201).json({ message: 'Habit created', habit });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
};

const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const { name, description, category, deadline, frequency, xp_reward, color, icon } = req.body;
    await habit.update({ name, description, category, deadline, frequency, xp_reward, color, icon });

    res.json({ message: 'Habit updated', habit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update habit' });
  }
};

const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    await habit.update({ is_active: false });
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete habit' });
  }
};

const getHabitCalendar = async (req, res) => {
  try {
    const { year, month } = req.query;
    const habit = await Habit.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const logs = await HabitLog.findAll({
      where: {
        habit_id: habit.id,
        date: { [Op.between]: [startDate, endDate] },
      },
    });

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
};

module.exports = { getHabits, getHabit, createHabit, updateHabit, deleteHabit, getHabitCalendar };