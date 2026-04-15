const { Reward, Purchase, User } = require('../models');

const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.findAll({
      where: { is_available: true },
      order: [['xp_cost', 'ASC']],
    });
    res.json({ rewards });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
};

const purchaseReward = async (req, res) => {
  try {
    const { reward_id } = req.body;
    const user = await User.findByPk(req.user.id);
    const reward = await Reward.findByPk(reward_id);

    if (!reward || !reward.is_available) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    if (user.xp < reward.xp_cost) {
      return res.status(400).json({ error: 'Not enough XP', needed: reward.xp_cost - user.xp });
    }

    // Deduct XP and create purchase
    await user.update({ xp: user.xp - reward.xp_cost });
    const purchase = await Purchase.create({
      user_id: user.id,
      reward_id: reward.id,
      xp_spent: reward.xp_cost,
      status: 'completed',
    });

    res.json({
      message: 'Reward purchased!',
      purchase,
      remaining_xp: user.xp - reward.xp_cost,
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Failed to purchase reward' });
  }
};

const getPurchaseHistory = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      where: { user_id: req.user.id },
      include: [{ association: 'reward' }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ purchases });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase history' });
  }
};

module.exports = { getRewards, purchaseReward, getPurchaseHistory };