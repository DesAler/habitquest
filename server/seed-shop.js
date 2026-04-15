const { Reward } = require('./models');

const seedRewards = async () => {
  try {
    // 🧹 ШАГ 1: Полностью очищаем витрину перед новым завозом
    await Reward.destroy({ where: {} });
    console.log('🧹 Старые товары удалены.');

    // 📦 ШАГ 2: Завозим новые товары
    const items = [
      { 
        name: 'HQ Sticker Pack', 
        description: 'Эксклюзивные стикеры от HQ', 
        xp_cost: 150, 
        category: 'stickers',
        image: 'http://localhost:5000/uploads/sticker.jpeg' 
      },
      { 
        name: 'SDU Legend Skin', 
        description: 'Особый стиль профиля', 
        xp_cost: 1000, 
        category: 'visual',
        image: 'http://localhost:5000/uploads/aura.jpeg' 
      },
      { 
        name: 'Coffee Boost', 
        description: 'Энергия для новых привычек', 
        xp_cost: 300, 
        category: 'powerup',
        image: 'http://localhost:5000/uploads/coffee.jpeg' 
      }
    ];
    
    await Reward.bulkCreate(items);
    console.log('✅ Магазин успешно заряжен товарами!');
    process.exit();
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
};

seedRewards();