const { Friend, User, Habit, HabitLog } = require('../models');
const { Op } = require('sequelize');

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ users: [] });

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
        ],
        id: { [Op.ne]: req.user.id },
      },
      attributes: ['id', 'username', 'avatar', 'level', 'xp'],
      limit: 10,
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const { friend_id } = req.body;

    if (friend_id === req.user.id) {
      return res.status(400).json({ error: 'Cannot add yourself' });
    }

    const friendUser = await User.findByPk(friend_id);
    if (!friendUser) return res.status(404).json({ error: 'User not found' });

    const existing = await Friend.findOne({
      where: {
        [Op.or]: [
          { user_id: req.user.id, friend_id },
          { user_id: friend_id, friend_id: req.user.id },
        ],
      },
    });
    if (existing) return res.status(409).json({ error: 'Friend request already exists' });

    const friendship = await Friend.create({
      user_id: req.user.id,
      friend_id,
      status: 'pending',
    });

    res.status(201).json({ message: 'Friend request sent', friendship });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send friend request' });
  }
};

const respondToRequest = async (req, res) => {
  try {
    const { friendship_id, action } = req.body;
    const friendship = await Friend.findOne({
      where: { id: friendship_id, friend_id: req.user.id, status: 'pending' },
    });

    if (!friendship) return res.status(404).json({ error: 'Friend request not found' });

    if (action === 'accept') {
      await friendship.update({ status: 'accepted' });
      res.json({ message: 'Friend request accepted' });
    } else {
      await friendship.destroy();
      res.json({ message: 'Friend request declined' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to respond to request' });
  }
};

const getFriends = async (req, res) => {
  try {
    const friendships = await Friend.findAll({
      where: {
        [Op.or]: [
          { user_id: req.user.id, status: 'accepted' },
          { friend_id: req.user.id, status: 'accepted' },
        ],
      },
    });

    const friendIds = friendships.map(f =>
      f.user_id === req.user.id ? f.friend_id : f.user_id
    );

    const friends = await User.findAll({
      where: { id: { [Op.in]: friendIds } },
      attributes: ['id', 'username', 'avatar', 'level', 'xp', 'bio'],
    });

    res.json({ friends });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const requests = await Friend.findAll({
      where: { friend_id: req.user.id, status: 'pending' },
    });

    const senderIds = requests.map(r => r.user_id);
    const senders = await User.findAll({
      where: { id: { [Op.in]: senderIds } },
      attributes: ['id', 'username', 'avatar', 'level'],
    });

    const result = requests.map(r => ({
      id: r.id,
      sender: senders.find(s => s.id === r.user_id),
      createdAt: r.createdAt,
    }));

    res.json({ requests: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'avatar', 'level', 'xp', 'bio', 'createdAt'],
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const habitCount = await Habit.count({ where: { user_id: user.id, is_active: true } });
    res.json({ user, habitCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

module.exports = {
  searchUsers, sendFriendRequest, respondToRequest,
  getFriends, getPendingRequests, getUserProfile,
};