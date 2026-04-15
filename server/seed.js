require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Habit, Reward, HabitLog } = require('../models');

const seed = async () => {
  await sequelize.sync({ force: true });
  console.log('🌱 Seeding database...');

  // Users
  const password = await bcrypt.hash('password123', 12);
  const alice = await User.create({
    email: 'alice@example.com', username: 'alice', password,
    xp: 340, level: 4, bio: 'Building better habits every day 🌱',
  });
  const bob = await User.create({
    email: 'bob@example.com', username: 'bob', password,
    xp: 120, level: 2, bio: 'Fitness enthusiast 💪',
  });

  // Habits for alice
  const habits = await Habit.bulkCreate([
    { user_id: alice.id, name: 'Morning Meditation', category: 'mindfulness', icon: '🧘', color: '#8b5cf6', xp_reward: 15, deadline: '2025-12-31' },
    { user_id: alice.id, name: 'Read 30 Minutes', category: 'education', icon: '📚', color: '#3b82f6', xp_reward: 10 },
    { user_id: alice.id, name: 'Exercise', category: 'fitness', icon: '🏋️', color: '#22c55e', xp_reward: 20, deadline: '2025-06-30' },
    { user_id: alice.id, name: 'Drink 8 Glasses of Water', category: 'health', icon: '💧', color: '#06b6d4', xp_reward: 5 },
    { user_id: alice.id, name: 'Journal Writing', category: 'mindfulness', icon: '✍️', color: '#f59e0b', xp_reward: 10 },
    { user_id: bob.id, name: 'Morning Run', category: 'fitness', icon: '🏃', color: '#ef4444', xp_reward: 20 },
    { user_id: bob.id, name: 'Learn Spanish', category: 'education', icon: '🇪🇸', color: '#f97316', xp_reward: 15 },
  ]);

  // Seed some logs for past 14 days
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const shouldComplete = Math.random() > 0.2;

    for (const habit of habits.slice(0, 5)) {
      if (shouldComplete) {
        await HabitLog.create({
          habit_id: habit.id,
          date: dateStr,
          completed: true,
          proof_type: 'text',
          proof_content: 'Completed! Feeling great.',
          xp_earned: habit.xp_reward,
        });
      }
    }
  }

  // Update streaks for seeded habits
  for (const habit of habits) {
    await habit.update({ current_streak: Math.floor(Math.random() * 10) + 1, longest_streak: Math.floor(Math.random() * 20) + 5 });
  }

  // Rewards
  await Reward.bulkCreate([
    { name: 'Achievement Sticker Pack', description: 'A set of 10 exclusive digital achievement stickers', image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400', category: 'digital', xp_cost: 50 },
    { name: 'HabitQuest Mug', description: 'Premium ceramic mug with HabitQuest branding', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400', category: 'merchandise', xp_cost: 200 },
    { name: 'Classic T-Shirt', description: 'Comfortable 100% cotton HabitQuest t-shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', category: 'merchandise', xp_cost: 350 },
    { name: 'Premium Badge', description: 'Exclusive gold profile badge', image: 'https://images.unsplash.com/photo-1567364816519-cbc9f5e9dc8d?w=400', category: 'digital', xp_cost: 100 },
    { name: 'Motivational Poster', description: 'High-quality printable motivational poster', image: 'https://images.unsplash.com/photo-1552508744-1696d4464960?w=400', category: 'digital', xp_cost: 75 },
    { name: 'HabitQuest Hoodie', description: 'Cozy premium hoodie — perfect for morning routines', image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400', category: 'merchandise', xp_cost: 500 },
    { name: 'Enamel Pin Set', description: '5-piece motivational enamel pin set', image: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=400', category: 'merchandise', xp_cost: 150 },
    { name: 'Dark Mode Theme', description: 'Unlock the exclusive midnight dark theme', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400', category: 'digital', xp_cost: 80 },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('👤 Test accounts:');
  console.log('   alice@example.com / password123');
  console.log('   bob@example.com / password123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });