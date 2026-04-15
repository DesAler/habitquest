const express = require('express');
const router = express.Router();
const { getRewards, purchaseReward, getPurchaseHistory } = require('../controllers/rewardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getRewards);
router.post('/purchase', purchaseReward);
router.get('/purchases', getPurchaseHistory);

module.exports = router;