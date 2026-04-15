const { Reward, sequelize } = require('./models');

const seedRewards = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    await Reward.destroy({ where: {} });
    console.log('🧹 Old rewards removed');

    const API_URL = process.env.API_URL || 'https://habitquest-fhyd.onrender.com';

    const items = [
      {
        name: 'HQ Sticker Pack',
        description: 'Эксклюзивные стикеры от HQ',
        xp_cost: 150,
        category: 'general',
        image: `${API_URL}/uploads/sticker.jpeg`,
      },
      {
        name: 'SDU Legend Skin',
        description: 'Особый стиль профиля',
        xp_cost: 1000,
        category: 'general',
        image: `${API_URL}/uploads/aura.jpeg`,
      },
      {
        name: 'Coffee Boost',
        description: 'Энергия для новых привычек',
        xp_cost: 300,
        category: 'general',
        image: `${API_URL}/uploads/coffee.jpeg`,
      },
    ];

    await Reward.bulkCreate(items);
    console.log('✅ Rewards seeded successfully');

    const rewards = await Reward.findAll();
    console.log('📦 Current rewards count:', rewards.length);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedRewards();