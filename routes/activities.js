const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.get('/', protect, activityController.getAllActivities);
router.post('/', protect, activityController.createActivity);
router.get('/count', protect, activityController.getActivityCount);
router.get('/:id', protect, activityController.getActivity);
router.put('/:id', protect, activityController.updateActivity);
router.delete('/:id', protect, activityController.deleteActivity);

module.exports = router;