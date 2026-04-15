/**
 * XP and Level calculation utilities
 * Level thresholds grow exponentially
 */

const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  900,    // Level 5
  1400,   // Level 6
  2000,   // Level 7
  2800,   // Level 8
  3800,   // Level 9
  5000,   // Level 10
  6500,   // Level 11
  8500,   // Level 12
  11000,  // Level 13
  14000,  // Level 14
  18000,  // Level 15
  23000,  // Level 16
  29000,  // Level 17
  36000,  // Level 18
  45000,  // Level 19
  55000,  // Level 20
];

const calculateLevel = (xp) => {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
};

const getXpForLevel = (level) => {
  return LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)];
};

const getXpForNextLevel = (level) => {
  return LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)];
};

const getLevelProgress = (xp, level) => {
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForNextLevel(level);
  if (nextLevelXp === currentLevelXp) return 100;
  return Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100);
};

const LEVEL_TITLES = [
  'Novice', 'Apprentice', 'Explorer', 'Seeker', 'Achiever',
  'Champion', 'Master', 'Grand Master', 'Legend', 'Mythic',
  'Divine', 'Transcendent', 'Immortal', 'Ancient', 'Cosmic',
  'Eternal', 'Infinite', 'Celestial', 'Omnipotent', 'Godlike',
];

const getLevelTitle = (level) => {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
};

module.exports = { calculateLevel, getXpForNextLevel, getLevelProgress, getLevelTitle };