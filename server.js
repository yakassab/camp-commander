// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000; // Use port 3000 to avoid conflict with Live Server

// CORS setup to allow requests from Live Server and direct requests
app.use((req, res, next) => {
  const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000'];
  const origin = req.headers.origin;
  
  // Check if the request origin is in our allowed list
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow credentials
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Set view engine (if you plan to use EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define Activity model schema
const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
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
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

// Create Activity model
const Activity = mongoose.model('Activity', activitySchema);

// Add mock middleware for auth protection
// In a real app, you would implement proper authentication
app.use((req, res, next) => {
  // Add the API flag to request for API routes
  if (req.path.startsWith('/api/')) {
    req.isApi = true;
  }
  
  // Set mock user
  req.user = {
    username: 'camp_director',
    role: 'director'
  };
  next();
});

// Define base routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes for Activities
// GET all activities
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ dateCreated: -1 });
    res.json(activities);
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new activity
app.post('/api/activities', async (req, res) => {
  try {
    const { name, description, duration, ageGroup, location } = req.body;
    
    // Create new activity
    const newActivity = new Activity({
      name,
      description,
      duration,
      ageGroup,
      location
    });
    
    // Save to database
    const savedActivity = await newActivity.save();
    res.status(201).json(savedActivity);
  } catch (err) {
    console.error('Error creating activity:', err);
    res.status(400).json({ message: err.message });
  }
});

// GET single activity
app.get('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (err) {
    console.error('Error fetching activity:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE activity
app.delete('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json({ message: 'Activity deleted successfully' });
  } catch (err) {
    console.error('Error deleting activity:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple authentication route (placeholder - implement properly in production)
app.post('/login', (req, res) => {
  // This is a simplified authentication - implement proper auth in production
  if (req.body.username && req.body.password) {
    req.session.user = {
      username: req.body.username,
      role: 'director'
    };
    res.redirect('/');
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});