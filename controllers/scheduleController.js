const Schedule = require('../models/Schedule');
const Activity = require('../models/Activity');
const mongoose = require('mongoose');

// Get weekly schedule (Monday to Friday)
exports.getWeeklySchedule = async (req, res) => {
  try {
    // Get start date from query parameter or use current date
    let startDate = req.params.startDate ? new Date(req.params.startDate) : new Date();
    
    // Adjust to Monday of the week
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate = new Date(startDate.setDate(diff));
    startDate.setHours(0, 0, 0, 0);
    
    // Calculate end date (Friday)
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 4);
    endDate.setHours(23, 59, 59, 999);
    
    // Find schedules for the week
    const schedules = await Schedule.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('activity');
    
    // Format the response
    const response = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      activities: schedules.map(schedule => ({
        _id: schedule._id,
        name: schedule.activity.name,
        description: schedule.activity.description,
        date: schedule.date.toISOString().split('T')[0],
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        ageGroup: schedule.ageGroup,
        location: schedule.location,
        assignedCoach: schedule.assignedCoach,
        notes: schedule.notes,
        materialsRequired: schedule.materialsRequired
      }))
    };
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get daily schedule
exports.getDailySchedule = async (req, res) => {
  try {
    // Parse date or use current date
    const date = req.params.date ? new Date(req.params.date) : new Date();
    date.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find schedules for the day
    const schedules = await Schedule.find({
      date: {
        $gte: date,
        $lte: endOfDay
      }
    }).populate('activity').sort('startTime');
    
    // Group by age group
    const groupedByAgeGroup = {};
    
    schedules.forEach(schedule => {
      if (!groupedByAgeGroup[schedule.ageGroup]) {
        groupedByAgeGroup[schedule.ageGroup] = [];
      }
      
      groupedByAgeGroup[schedule.ageGroup].push({
        _id: schedule._id,
        name: schedule.activity.name,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        location: schedule.location,
        assignedCoach: schedule.assignedCoach,
        materialsRequired: schedule.materialsRequired,
        notes: schedule.notes
      });
    });
    
    res.json({
      date: date.toISOString().split('T')[0],
      dayOfWeek: date.getDay(),
      schedules: groupedByAgeGroup
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new scheduled activity
exports.createScheduledActivity = async (req, res) => {
  try {
    const { 
      activityId,
      date,
      startTime,
      endTime,
      ageGroup,
      location,
      assignedCoach,
      notes,
      materialsRequired
    } = req.body;
    
    // Validate activity exists
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    // Check for scheduling conflicts
    const scheduleDate = new Date(date);
    const conflict = await Schedule.findOne({
      date: {
        $gte: new Date(scheduleDate.setHours(0, 0, 0, 0)),
        $lte: new Date(scheduleDate.setHours(23, 59, 59, 999))
      },
      location: location,
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime }
        }
      ]
    });
    
    if (conflict) {
      return res.status(409).json({ 
        error: 'Scheduling conflict detected', 
        conflictingSchedule: conflict._id 
      });
    }
    
    // Create the new schedule
    const schedule = new Schedule({
      activity: activityId,
      date: new Date(date),
      startTime,
      endTime,
      ageGroup,
      location,
      assignedCoach,
      notes,
      materialsRequired,
      createdBy: req.user ? req.user.username : 'system'
    });
    
    await schedule.save();
    
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a scheduled activity
exports.updateScheduledActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Prevent updating the activity reference and createdAt
    delete updates.activity;
    delete updates.createdAt;
    delete updates.createdBy;
    
    // Check for scheduling conflicts if time or location changed
    if (updates.date || updates.startTime || updates.endTime || updates.location) {
      const currentSchedule = await Schedule.findById(id);
      const scheduleDate = new Date(updates.date || currentSchedule.date);
      
      const conflict = await Schedule.findOne({
        _id: { $ne: id }, // Exclude current schedule
        date: {
          $gte: new Date(scheduleDate.setHours(0, 0, 0, 0)),
          $lte: new Date(scheduleDate.setHours(23, 59, 59, 999))
        },
        location: updates.location || currentSchedule.location,
        $or: [
          {
            startTime: { $lte: updates.startTime || currentSchedule.startTime },
            endTime: { $gt: updates.startTime || currentSchedule.startTime }
          },
          {
            startTime: { $lt: updates.endTime || currentSchedule.endTime },
            endTime: { $gte: updates.endTime || currentSchedule.endTime }
          },
          {
            startTime: { $gte: updates.startTime || currentSchedule.startTime },
            endTime: { $lte: updates.endTime || currentSchedule.endTime }
          }
        ]
      });
      
      if (conflict) {
        return res.status(409).json({ 
          error: 'Scheduling conflict detected', 
          conflictingSchedule: conflict._id 
        });
      }
    }
    
    const schedule = await Schedule.findByIdAndUpdate(id, updates, { new: true });
    
    if (!schedule) {
      return res.status(404).json({ error: 'Scheduled activity not found' });
    }
    
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a scheduled activity
exports.deleteScheduledActivity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = await Schedule.findByIdAndDelete(id);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Scheduled activity not found' });
    }
    
    res.json({ message: 'Scheduled activity removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get count of activities for a specific day
exports.getCountForDay = async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const count = await Schedule.countDocuments({
      date: {
        $gte: targetDate,
        $lte: endOfDay
      }
    });
    
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate materials list for a specific time period
exports.getMaterialsNeeded = async (req, res) => {
  try {
    // Get start date and end date from query parameters or use current week
    let startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
    
    // Adjust to start of week if no specific dates provided
    if (!req.query.startDate && !req.query.endDate) {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(startDate.setDate(diff));
    }
    
    startDate.setHours(0, 0, 0, 0);
    
    // Calculate end date (default to end of week if not provided)
    let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date(startDate);
    if (!req.query.endDate) {
      endDate.setDate(endDate.getDate() + 4); // End of week (Friday)
    }
    endDate.setHours(23, 59, 59, 999);
    
    // Find schedules for the period
    const schedules = await Schedule.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('activity');
    
    // Aggregate materials needed
    const materialsMap = {};
    
    schedules.forEach(schedule => {
      // Add materials from the schedule
      if (schedule.materialsRequired && schedule.materialsRequired.length > 0) {
        schedule.materialsRequired.forEach(material => {
          if (!materialsMap[material.item]) {
            materialsMap[material.item] = 0;
          }
          materialsMap[material.item] += material.quantity;
        });
      }
      
      // Add materials from the activity
      if (schedule.activity.materials && schedule.activity.materials.length > 0) {
        schedule.activity.materials.forEach(material => {
          if (!materialsMap[material]) {
            materialsMap[material] = 1; // Default quantity if not specified
          } else {
            materialsMap[material] += 1;
          }
        });
      }
    });
    
    // Convert to array format
    const materialsList = Object.entries(materialsMap).map(([name, quantity]) => ({
      name,
      quantity,
      // Sample threshold values - in a real app this would come from inventory
      lowThreshold: 5
    }));
    
    res.json(materialsList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};