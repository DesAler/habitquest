const express = require('express');
const router = express.Router();
const { searchUsers, sendFriendRequest, respondToRequest, getFriends, getPendingRequests, getUserProfile } = require('../controllers/socialController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/search', searchUsers);
router.get('/friends', getFriends);
router.get('/requests', getPendingRequests);
router.get('/users/:id', getUserProfile);
router.post('/friends/request', sendFriendRequest);
router.post('/friends/respond', respondToRequest);

module.exports = router;