const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { calculateLevel } = require('../utils/xpUtils');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret_change_me', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password)
      return res.status(400).json({ error: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existingEmail = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingEmail) return res.status(409).json({ error: 'Email already registered' });

    const existingUsername = await User.findOne({ where: { username: username.trim() } });
    if (existingUsername) return res.status(409).json({ error: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase().trim(),
      username: username.trim(),
      password: hashedPassword,
      xp: 0,
      level: 1,
    });

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json({ message: 'Account created successfully', token, user: userWithoutPassword });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json({ message: 'Login successful', token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// --- ОБНОВЛЕННАЯ ФУНКЦИЯ ДЛЯ CLOUDINARY ---
const updateProfile = async (req, res) => {
  try {
    const { username, bio, language, timezone } = req.body;
    const updateData = {};
    
    if (username) updateData.username = username.trim();
    if (bio !== undefined) updateData.bio = bio;
    if (language) updateData.language = language;
    if (timezone) updateData.timezone = timezone;
    
    // Если пришел файл, сохраняем ссылку из Cloudinary
    if (req.file && req.file.path) {
      // req.file.path теперь содержит полную ссылку https://res.cloudinary.com/...
      updateData.avatar = req.file.path;
    }

    await User.update(updateData, { where: { id: req.user.id } });
    
    const updatedUser = await User.findByPk(req.user.id, { 
      attributes: { exclude: ['password'] } 
    });
    
    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(400).json({ error: 'Current password is incorrect' });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await User.update({ password: hashed }, { where: { id: req.user.id } });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };