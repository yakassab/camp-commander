const Activity = require('../models/Activity');

// Get all activities
exports.getAllActivities = async (req, res) => {
  try {
    // For API requests
    if (req.isApi || req.xhr) {
      const activities = await Activity.find().sort('name');
      return res.json({ success: true, count: activities.length, data: activities });
    }
    
    // For web interface - render view
    const activities = await Activity.find();
    res.render('activities', { 
      activities,
      title: 'Camp Activities'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new activity
exports.createActivity = async (req, res) => {
  try {
    console.log('Creating activity with data:', req.body);
    
    // Create activity with just the name field
    const newActivity = await Activity.create({
      name: req.body.name
    });
    
    console.log('Activity created successfully:', newActivity);
    
    // Handle API requests
    if (req.isApi || req.xhr || req.path.includes('/api/')) {
      return res.status(201).json({
        success: true,
        data: newActivity
      });
    }
    
    // Handle form submissions
    res.redirect('/activities');
  } catch (err) {
    console.error('Error creating activity:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get a single activity by ID
exports.getActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    if (req.isApi || req.xhr) {
      return res.json({ success: true, data: activity });
    }
    
    // Render activity detail page
    res.render('activity-detail', { activity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update activity
exports.updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    if (req.isApi || req.xhr) {
      return res.json({ success: true, data: activity });
    }
    
    // Redirect to activity detail page
    res.redirect(`/activities/${activity._id}`);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete activity
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    if (req.isApi || req.xhr) {
      return res.json({ success: true, data: {} });
    }
    
    // Redirect to activities list
    res.redirect('/activities');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get count of activities
exports.getActivityCount = async (req, res) => {
  try {
    const count = await Activity.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};