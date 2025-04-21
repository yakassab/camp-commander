// Seed script for Camp Commander database
require('dotenv').config();
const mongoose = require('mongoose');
const Activity = require('./models/Activity');
const Schedule = require('./models/Schedule');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample activities data
const activities = [
  {
    name: 'Soccer Practice',
    description: 'Basic soccer skills and mini-games for all skill levels',
    materials: ['Soccer balls', 'Cones', 'Pinnies']
  },
  {
    name: 'Swimming Lessons',
    description: 'Learn to swim with certified instructors',
    materials: ['Kickboards', 'Pool noodles', 'Goggles']
  },
  {
    name: 'Arts & Crafts',
    description: 'Creative art projects for campers to express themselves',
    materials: ['Construction paper', 'Glue', 'Markers', 'Scissors', 'Beads']
  },
  {
    name: 'Nature Hike',
    description: 'Guided hike through the camp grounds to learn about local flora and fauna',
    materials: ['Field guides', 'Magnifying glasses', 'Collection jars']
  },
  {
    name: 'Basketball',
    description: 'Learn basketball fundamentals and play mini-games',
    materials: ['Basketballs', 'Cones', 'Whistles']
  },
  {
    name: 'Campfire Stories',
    description: 'Gather around the campfire for storytelling and s\'mores',
    materials: ['Fire wood', 'Marshmallows', 'Chocolate', 'Graham crackers']
  },
  {
    name: 'Team Building Games',
    description: 'Fun activities designed to foster teamwork and communication',
    materials: ['Rope', 'Blindfolds', 'Obstacle course items']
  },
  {
    name: 'Archery',
    description: 'Learn proper archery technique with certified instructors',
    materials: ['Bows', 'Arrows', 'Targets', 'Arm guards']
  }
];

// Current date (April 21, 2025 as mentioned in context)
const currentDate = new Date(2025, 3, 21); // Month is 0-indexed, so 3 = April

// Generate date for a specific weekday (0 = Sunday, 1 = Monday, etc.) in current week
function getDateForWeekday(weekday) {
  const date = new Date(currentDate);
  const currentWeekday = date.getDay();
  const diff = weekday - currentWeekday;
  date.setDate(date.getDate() + diff);
  return date;
}

// Sample schedule data
const schedules = [
  // Monday schedules
  {
    activity: null, // Will be filled with ObjectId
    date: getDateForWeekday(1), // Monday
    startTime: '10:00',
    endTime: '11:00',
    ageGroup: '7-9',
    location: 'Field A',
    assignedCoach: 'Coach Mike',
    notes: 'Bring water bottles',
    createdBy: 'system'
  },
  {
    activity: null,
    date: getDateForWeekday(1), // Monday
    startTime: '11:00',
    endTime: '12:00',
    ageGroup: '10-12',
    location: 'Arts Room',
    assignedCoach: 'Ms. Sarah',
    notes: 'All materials provided',
    createdBy: 'system'
  },
  {
    activity: null,
    date: getDateForWeekday(1), // Monday
    startTime: '13:00',
    endTime: '14:30',
    ageGroup: '13-15',
    location: 'Pool',
    assignedCoach: 'Coach Lisa',
    notes: 'Bring swimsuits and towels',
    createdBy: 'system'
  },
  
  // Tuesday schedules
  {
    activity: null,
    date: getDateForWeekday(2), // Tuesday
    startTime: '10:00',
    endTime: '11:30',
    ageGroup: '10-12',
    location: 'Basketball Court',
    assignedCoach: 'Coach James',
    notes: 'Indoor activity',
    createdBy: 'system'
  },
  {
    activity: null,
    date: getDateForWeekday(2), // Tuesday
    startTime: '13:00',
    endTime: '14:00',
    ageGroup: '7-9',
    location: 'Nature Trail',
    assignedCoach: 'Mr. Robert',
    notes: 'Wear comfortable shoes and bring water',
    createdBy: 'system'
  },
  
  // Wednesday schedules
  {
    activity: null,
    date: getDateForWeekday(3), // Wednesday
    startTime: '10:00',
    endTime: '11:00',
    ageGroup: '13-15',
    location: 'Field B',
    assignedCoach: 'Coach Alex',
    notes: 'Team-based activities',
    createdBy: 'system'
  },
  {
    activity: null,
    date: getDateForWeekday(3), // Wednesday
    startTime: '14:00',
    endTime: '15:30',
    ageGroup: '10-12',
    location: 'Archery Range',
    assignedCoach: 'Ms. Diana',
    notes: 'Safety briefing first',
    createdBy: 'system'
  },
  
  // Thursday schedules
  {
    activity: null,
    date: getDateForWeekday(4), // Thursday
    startTime: '09:30',
    endTime: '11:00',
    ageGroup: '7-9',
    location: 'Arts Room',
    assignedCoach: 'Ms. Sarah',
    notes: 'Special project day',
    createdBy: 'system'
  },
  {
    activity: null,
    date: getDateForWeekday(4), // Thursday
    startTime: '13:00',
    endTime: '14:00',
    ageGroup: '10-12',
    location: 'Field A',
    assignedCoach: 'Coach Mike',
    notes: 'Bring water bottles',
    createdBy: 'system'
  },
  
  // Friday schedules
  {
    activity: null,
    date: getDateForWeekday(5), // Friday
    startTime: '10:00',
    endTime: '12:00',
    ageGroup: 'All Ages',
    location: 'Main Hall',
    assignedCoach: 'All Staff',
    notes: 'Fun Friday games',
    createdBy: 'system'
  },
  {
    activity: null,
    date: getDateForWeekday(5), // Friday
    startTime: '19:00',
    endTime: '21:00',
    ageGroup: 'All Ages',
    location: 'Campfire Pit',
    assignedCoach: 'Mr. Robert',
    notes: 'Bring jackets for evening chill',
    createdBy: 'system'
  }
];

// Seed the database with activities and schedules
async function seedDatabase() {
  try {
    // Clear existing data
    await Activity.deleteMany({});
    await Schedule.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Insert activities
    const savedActivities = await Activity.insertMany(activities);
    console.log(`Inserted ${savedActivities.length} activities`);
    
    // Map activity names to their ObjectIds
    const activityMap = {};
    savedActivities.forEach(activity => {
      activityMap[activity.name] = activity._id;
    });
    
    // Assign activities to schedules
    schedules[0].activity = activityMap['Soccer Practice'];
    schedules[1].activity = activityMap['Arts & Crafts'];
    schedules[2].activity = activityMap['Swimming Lessons'];
    schedules[3].activity = activityMap['Basketball'];
    schedules[4].activity = activityMap['Nature Hike'];
    schedules[5].activity = activityMap['Team Building Games'];
    schedules[6].activity = activityMap['Archery'];
    schedules[7].activity = activityMap['Arts & Crafts'];
    schedules[8].activity = activityMap['Soccer Practice'];
    schedules[9].activity = activityMap['Team Building Games'];
    schedules[10].activity = activityMap['Campfire Stories'];
    
    // Insert schedules
    const savedSchedules = await Schedule.insertMany(schedules);
    console.log(`Inserted ${savedSchedules.length} scheduled activities`);
    
    console.log('Database seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    // Close the connection when done
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedDatabase();