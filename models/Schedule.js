const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  ageGroup: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  assignedCoach: {
    type: String,
    required: true
  },
  notes: String,
  materialsRequired: [{
    item: String,
    quantity: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true
  }
});

// Virtual for getting the day of the week (1-7, with 1 being Monday)
ScheduleSchema.virtual('dayOfWeek').get(function() {
  const day = new Date(this.date).getDay();
  // Convert from Sunday=0 to Monday=1 format
  return day === 0 ? 7 : day;
});

// Create index for efficient queries
ScheduleSchema.index({ date: 1, startTime: 1 });

module.exports = mongoose.model('Schedule', ScheduleSchema);