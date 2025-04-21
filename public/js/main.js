// Camp Commander Dashboard - Main JavaScript File
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initializeDashboard();
    
    // Set up event listeners for the schedule
    setupScheduleEvents();
    
    // Set up event listeners for the activity form
    setupActivityForm();
    
    // Set up the weekly navigation buttons
    document.getElementById('prev-week').addEventListener('click', navigateWeek.bind(null, -1));
    document.getElementById('next-week').addEventListener('click', navigateWeek.bind(null, 1));
});

// Dashboard initialization
function initializeDashboard() {
    // Fetch activities count
    fetchActivityCount();
    
    // Fetch today's activities
    fetchTodaysActivities();
    
    // Set current week display
    updateWeekDisplay();
    
    // Fetch and display schedule for current week
    fetchWeeklySchedule();
    
    // Fetch materials needed for this week
    fetchMaterialsNeeded();
}

// Fetch and display the activity count
function fetchActivityCount() {
    fetch('/api/activities/count')
        .then(response => response.json())
        .then(data => {
            document.getElementById('activity-count').textContent = data.count;
        })
        .catch(error => {
            console.error('Error fetching activity count:', error);
            // Display sample data if API is not ready
            document.getElementById('activity-count').textContent = '24';
        });
}

// Fetch and display today's activities
function fetchTodaysActivities() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    fetch(`/api/schedule/day/${formattedDate}/count`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('todays-activities').textContent = data.count;
        })
        .catch(error => {
            console.error('Error fetching today\'s activities:', error);
            // Display sample data if API is not ready
            document.getElementById('todays-activities').textContent = '6';
        });
}

// Navigate between weeks
function navigateWeek(offset) {
    // Get current displayed week
    const currentWeekText = document.getElementById('current-week-display').textContent;
    
    // Parse the date from the text (April 21-27, 2025)
    const [month, startDay, dash, endDay, year] = currentWeekText.split(' ')[0].split('-')[0].split(/([0-9]+)/);
    
    // Create Date object from the parsed values
    const startDate = new Date(`${month} ${startDay}, ${year}`);
    
    // Add 7 days * offset to navigate
    startDate.setDate(startDate.getDate() + (7 * offset));
    
    // Update the display with new dates
    updateWeekDisplay(startDate);
    
    // Fetch schedule for the new week
    fetchWeeklySchedule(startDate);
}

// Update the week display in the header
function updateWeekDisplay(startDate = null) {
    // If no date provided, use current week
    if (!startDate) {
        startDate = new Date();
        // Adjust to Monday of current week
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(startDate.setDate(diff));
    }
    
    // Calculate end date (5 days later - Friday)
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 4);
    
    // Format the display
    const options = { month: 'long' };
    const startMonth = startDate.toLocaleDateString('en-US', options);
    const endMonth = endDate.toLocaleDateString('en-US', options);
    
    let dateDisplay;
    if (startMonth === endMonth) {
        dateDisplay = `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${endDate.getFullYear()}`;
    } else {
        dateDisplay = `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${endDate.getFullYear()}`;
    }
    
    document.getElementById('current-week-display').textContent = dateDisplay;
}

// Fetch and display the weekly schedule
function fetchWeeklySchedule(startDate = null) {
    // If no date provided, use current week
    if (!startDate) {
        startDate = new Date();
        // Adjust to Monday of current week
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(startDate.setDate(diff));
    }
    
    // Format as ISO date string
    const formattedDate = startDate.toISOString().split('T')[0];
    
    console.log('Fetching schedule for week starting:', formattedDate);
    
    fetch(`/api/schedule/week/${formattedDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Schedule data received:', data);
            populateSchedule(data);
        })
        .catch(error => {
            console.error('Error fetching weekly schedule:', error);
            // Use sample data if API is not ready
            populateScheduleWithSampleData();
        });
}

// Populate the schedule with actual data
function populateSchedule(scheduleData) {
    // Clear existing schedule (except for Morning Circle and Lunch which are fixed)
    clearSchedule();
    
    console.log('Populating schedule with data:', scheduleData);
    
    // Check if we have activities data
    if (!scheduleData.activities || !Array.isArray(scheduleData.activities)) {
        console.error('Invalid schedule data format:', scheduleData);
        populateScheduleWithSampleData();
        return;
    }
    
    // Add activities to the schedule
    scheduleData.activities.forEach(activity => {
        // Extract day of week and hour
        const dayIndex = activity.dayOfWeek; // 1-5 for Monday-Friday
        const hourIndex = parseInt(activity.startTime.split(':')[0]); // Extract hour as a number
        
        console.log(`Adding activity: ${activity.name} on day ${dayIndex} at ${hourIndex}:00`);
        
        // Find the corresponding cell in the table
        const cell = document.querySelector(`.schedule-cell[data-day="${dayIndex}"][data-time="${hourIndex}"]`);
        
        if (cell) {
            // Populate the cell with activity details
            cell.textContent = activity.name;
            cell.dataset.activityId = activity._id;
            
            // Create a detailed tooltip
            let tooltip = `${activity.name}\n`;
            tooltip += `Time: ${activity.startTime} - ${activity.endTime}\n`;
            tooltip += `Age Group: ${activity.ageGroup}\n`;
            tooltip += `Location: ${activity.location}\n`;
            tooltip += `Coach: ${activity.assignedCoach}`;
            if (activity.notes) tooltip += `\nNotes: ${activity.notes}`;
            
            cell.title = tooltip;
            
            // Add some styling based on activity name to differentiate activities
            // Simple way to get consistent colors without activity type metadata
            applyActivityStylingByName(cell, activity.name);
        } else {
            console.warn(`Could not find cell for day ${dayIndex} at hour ${hourIndex}`);
        }
    });
}

// Apply styling based on activity name (since we don't have activity type in our data)
function applyActivityStylingByName(cell, activityName) {
    // Remove any existing activity type classes
    cell.classList.remove('activity-sports', 'activity-arts', 'activity-teambuilding', 'activity-water', 'activity-learning');
    
    // Apply class based on keywords in the activity name
    const name = activityName.toLowerCase();
    
    if (name.includes('soccer') || name.includes('basketball') || name.includes('sports')) {
        cell.classList.add('activity-sports');
        cell.style.backgroundColor = '#d4edda'; // light green
    } else if (name.includes('swim') || name.includes('pool')) {
        cell.classList.add('activity-water');
        cell.style.backgroundColor = '#cce5ff'; // light blue
    } else if (name.includes('art') || name.includes('craft')) {
        cell.classList.add('activity-arts');
        cell.style.backgroundColor = '#fff3cd'; // light yellow
    } else if (name.includes('team') || name.includes('building') || name.includes('campfire')) {
        cell.classList.add('activity-teambuilding');
        cell.style.backgroundColor = '#f8d7da'; // light red
    } else if (name.includes('hike') || name.includes('nature') || name.includes('archery')) {
        cell.classList.add('activity-learning');
        cell.style.backgroundColor = '#d6d8db'; // light gray
    } else {
        // Default styling
        cell.style.backgroundColor = '#e2e3e5'; // light gray
    }
}

// Clear the schedule cells (except fixed activities)
function clearSchedule() {
    const cells = document.querySelectorAll('.schedule-cell:not([data-fixed="true"])');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.removeAttribute('data-activity-id');
        cell.removeAttribute('title');
        // Remove any styling classes
        cell.className = 'schedule-cell';
    });
}

// Use sample data for the schedule when API is not ready
function populateScheduleWithSampleData() {
    const sampleActivities = [
        { day: 1, time: 10, name: "Soccer Practice", type: "sports", location: "Field A", ageGroup: "10-12" },
        { day: 1, time: 13, name: "Arts & Crafts", type: "arts", location: "Arts Room", ageGroup: "7-9" },
        { day: 1, time: 15, name: "Swimming", type: "water", location: "Pool", ageGroup: "All Ages" },
        { day: 2, time: 10, name: "Basketball", type: "sports", location: "Indoor Hall", ageGroup: "13-15" },
        { day: 2, time: 14, name: "Team Building", type: "teambuilding", location: "Field B", ageGroup: "10-12" },
        { day: 3, time: 11, name: "Dance Class", type: "arts", location: "Theater", ageGroup: "7-9" },
        { day: 3, time: 14, name: "Swimming Relay", type: "water", location: "Pool", ageGroup: "All Ages" },
        { day: 4, time: 10, name: "Nature Walk", type: "learning", location: "Field B", ageGroup: "4-6" },
        { day: 4, time: 13, name: "Volleyball", type: "sports", location: "Indoor Hall", ageGroup: "13-15" },
        { day: 5, time: 11, name: "Art Exhibition Prep", type: "arts", location: "Arts Room", ageGroup: "All Ages" },
        { day: 5, time: 14, name: "Field Day", type: "teambuilding", location: "Field A", ageGroup: "All Ages" }
    ];
    
    // Clear the schedule
    clearSchedule();
    
    // Add sample activities
    sampleActivities.forEach(activity => {
        const cell = document.querySelector(`.schedule-cell[data-day="${activity.day}"][data-time="${activity.time}"]`);
        if (cell) {
            cell.textContent = activity.name;
            cell.dataset.activityType = activity.type;
            cell.title = `${activity.name}\nAge Group: ${activity.ageGroup}\nLocation: ${activity.location}`;
            
            // Apply color based on activity type
            applyActivityStylingByName(cell, activity.name);
        }
    });
}

// Fetch materials needed for scheduled activities
function fetchMaterialsNeeded() {
    fetch('/api/materials/needed')
        .then(response => response.json())
        .then(data => {
            populateMaterialsList(data);
        })
        .catch(error => {
            console.error('Error fetching materials needed:', error);
            // Using sample data already in the HTML
        });
}

// Populate the materials list
function populateMaterialsList(materials) {
    const materialsList = document.getElementById('materials-list');
    
    // Clear the current list
    materialsList.innerHTML = '';
    
    // Add each material to the list
    materials.forEach(material => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        // Create the material name
        li.appendChild(document.createTextNode(material.name));
        
        // Create the quantity badge
        const span = document.createElement('span');
        
        // Set badge color based on stock level
        if (material.quantity <= material.lowThreshold) {
            span.className = 'badge bg-danger rounded-pill';
            span.textContent = 'Low';
        } else {
            span.className = 'badge bg-primary rounded-pill';
            span.textContent = material.quantity;
        }
        
        li.appendChild(span);
        materialsList.appendChild(li);
    });
}

// Set up event listeners for schedule interactions
function setupScheduleEvents() {
    // Get all schedule cells
    const cells = document.querySelectorAll('.schedule-cell');
    
    // Add click event to each cell
    cells.forEach(cell => {
        cell.addEventListener('click', function() {
            if (this.dataset.activityId) {
                // If cell has an activity, show details/edit modal
                showActivityDetails(this.dataset.activityId);
            } else {
                // If cell is empty, show the schedule activity modal
                showScheduleActivityModal(this.dataset.day, this.dataset.time);
            }
        });
    });
    
    // Add edit button event handler
    document.getElementById('edit-schedule').addEventListener('click', enterEditMode);
    
    // Add print button event handler
    document.getElementById('print-schedule').addEventListener('click', printSchedule);
}

// Show activity details modal
function showActivityDetails(activityId) {
    // This would be implemented with a modal showing activity details
    console.log(`Show details for activity ${activityId}`);
    
    // In a real implementation, we would:
    // 1. Fetch activity details from the API
    // 2. Populate and show a modal with those details
    // 3. Allow editing or deleting the activity
}

// Show schedule activity modal with the selected time slot
function showScheduleActivityModal(day, time) {
    // This would show a modal to schedule an activity in this slot
    console.log(`Schedule activity for day ${day} at ${time}:00`);
    
    // In a real implementation, we would:
    // 1. Pre-populate a modal with the selected day and time
    // 2. Show a list of available activities to schedule
    // 3. Allow selecting an activity and confirming
}

// Enter schedule edit mode
function enterEditMode() {
    // This would enable drag-and-drop editing of the schedule
    console.log('Enter schedule edit mode');
    
    // In a real implementation, we would:
    // 1. Make schedule cells draggable
    // 2. Allow moving activities between cells
    // 3. Show a save button to commit changes
}

// Print the current schedule
function printSchedule() {
    console.log('Print schedule');
    window.print();
}

// Set up event listeners for the activity form
function setupActivityForm() {
    // Save activity button
    document.getElementById('save-activity').addEventListener('click', saveActivity);
}

// Save a new activity
function saveActivity() {
    // Get form values - simplified to only include name, description, and materials
    const name = document.getElementById('activity-name').value;
    const description = document.getElementById('activity-description').value;
    const materials = document.getElementById('activity-materials').value ? 
        document.getElementById('activity-materials').value.split(',').map(item => item.trim()) : 
        [];
    
    // Create simplified activity object
    const activity = {
        name,
        description,
        materials
    };
    
    console.log('Submitting activity:', activity);
    
    // Add a timestamp to log when fetch starts
    console.log('Starting fetch at:', new Date().toISOString());
    
    // Send to server with improved error handling
    fetch('http://localhost:3000/api/activities', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session-based auth
        body: JSON.stringify(activity)
    })
    .then(response => {
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            // Check if the response contains any content
            return response.text().then(text => {
                // If there's content, try to parse it as JSON
                if (text) {
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        // If parsing fails, return the text as an error message
                        throw new Error(text || 'Server returned an error');
                    }
                } else {
                    // If no content, create a generic error message
                    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                }
            });
        }
        
        // Check if the response has content before trying to parse as JSON
        return response.text().then(text => {
            return text ? JSON.parse(text) : {};
        });
    })
    .then(data => {
        console.log('Activity saved:', data);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addActivityModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('new-activity-form').reset();
        
        // Update activity count
        fetchActivityCount();
        
        // Show success message
        alert('Activity saved successfully!');
    })
    .catch(error => {
        console.error('Error saving activity:', error);
        
        // Show detailed error information in console
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        
        // Handle specific error types
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            alert('Error connecting to server: Make sure the server is running at http://localhost:3000');
        } else {
            alert('Error saving activity: ' + error.message);
        }
    });
}