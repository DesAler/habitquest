require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const { startCronJobs } = require('./services/cronService');

// Routes
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const logRoutes = require('./routes/logs');
const rewardRoutes = require('./routes/rewards');
const socialRoutes = require('./routes/social');
const statsRoutes = require('./routes/stats');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes); 

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});


// Initialize DB and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync();
    // АВТО-ЗАПОЛНЕНИЕ МАГАЗИНА
    const { Reward } = require('./models');
    const rewardCount = await Reward.count();
    if (rewardCount === 0) {
      await Reward.bulkCreate([
        { name: 'HQ Stickers', description: 'Эксклюзивные стикеры', xp_cost: 150, category: 'stickers', image: 'https://placehold.co/400x300/6366f1/white?text=Stickers' },
        { name: 'SDU Legend Skin', description: 'Особый стиль профиля', xp_cost: 1000, category: 'visual', image: 'https://placehold.co/400x300/fbbf24/white?text=SDU+Skin' },
        { name: 'Coffee Boost', description: 'Энергия для привычек', xp_cost: 300, category: 'powerup', image: 'https://placehold.co/400x300/ef4444/white?text=Coffee' }
      ]);
      console.log('✅ Магазин авто-заполнен!');

    }
    console.log('✅ Database synced');

    // Create uploads directory
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    startCronJobs();
    console.log('✅ Cron jobs started');

    app.listen(PORT, () => {
      console.log(`🚀 HabitQuest Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();