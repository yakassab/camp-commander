const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { protect } = require('../middleware/auth');

// Get weekly schedule - default (current week) and with specific date
router.get('/week', protect, scheduleController.getWeeklySchedule);
router.get('/week/:startDate', protect, scheduleController.getWeeklySchedule);

// Get daily schedule - default (today) and with specific date
router.get('/day', protect, scheduleController.getDailySchedule);
router.get('/day/:date', protect, scheduleController.getDailySchedule);

// Get count of activities for a specific day
router.get('/day/:date/count', protect, scheduleController.getCountForDay);

// Create new scheduled activity
router.post('/', protect, scheduleController.createScheduledActivity);

// Update scheduled activity
router.put('/:id', protect, scheduleController.updateScheduledActivity);

// Delete scheduled activity
router.delete('/:id', protect, scheduleController.deleteScheduledActivity);

// Get materials needed for a time period
router.get('/materials/needed', protect, scheduleController.getMaterialsNeeded);

module.exports = router;