const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { User } = require('../models');

router.use(authenticate);
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'avatar', 'xp', 'level'],
      order: [['xp', 'DESC']],
      limit: 20,
    });
    res.json({ users });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;