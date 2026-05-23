const express = require('express');
const router = express.Router();
const { getSchedule, syncMatches, updateImages } = require('../controllers/scheduleController');

router.get('/schedule', getSchedule);
router.post('/schedule/sync', syncMatches);
router.post('/update-images', updateImages);

module.exports = router;
