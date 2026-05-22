const express = require('express');
const router = express.Router();
const { getSchedule, syncMatches } = require('../controllers/scheduleController');

router.get('/schedule', getSchedule);
router.post('/schedule/sync', syncMatches);

module.exports = router;
