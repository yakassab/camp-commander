// Check if user is logged in
// Check if user is logged in and update navbar
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const adminReturn = document.getElementById('adminReturn');
  const navLinks = document.querySelector('.nav-links');

  if (token) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    
    // Show "Return to Admin" button if user is an admin viewing the regular site
    if (adminReturn && isAdmin) {
      adminReturn.style.display = 'block';
    }

    // Add logout button if it doesn't exist
    if (!document.getElementById('logoutBtn')) {
      const logoutBtn = document.createElement('li');
      logoutBtn.innerHTML = '<a href="#" id="logoutBtn">Logout</a>';
      navLinks.appendChild(logoutBtn);

      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('cart');
        // Redirect to index page after logout
        window.location.href = '/index.html';
      });
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'block';
    if (registerBtn) registerBtn.style.display = 'block';
    
    // Always hide admin return button if not logged in
    if (adminReturn) {
      adminReturn.style.display = 'none';
    }

    // Remove logout button if it exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      navLinks.removeChild(logoutBtn.parentElement);
    }
  }
}

// Load navbar component
async function loadNavbar() {
  try {
    const headerElement = document.querySelector('header');
    if (!headerElement) return;
    
    const response = await fetch('components/navbar.html');
    const html = await response.text();
    
    headerElement.outerHTML = html;
    
    // Set active page based on current URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Remove any existing active classes
    document.querySelectorAll('nav ul li a').forEach(link => {
      link.classList.remove('active');
    });
    
    // Set active class for current page
    if (currentPage === 'index.html' || currentPage === '') {
      document.getElementById('nav-home').classList.add('active');
    } else if (currentPage === 'activities.html') {
      document.getElementById('nav-activities').classList.add('active');
    } else if (currentPage === 'schedules.html') {
      document.getElementById('nav-schedules').classList.add('active');
    }
  } catch (error) {
    console.error('Error loading navbar:', error);
  }
}

// Load featured products
async function loadFeaturedProducts() {
  try {
    console.log('Fetching featured products...');
    
    const featuredContainer = document.getElementById('featured-products-container');
    if (!featuredContainer) {
      console.log('Featured container not found, skipping featured products load');
      return; // Exit if container doesn't exist
    }
    
    // Display loading state
    featuredContainer.innerHTML = `
      <div class="loading-state" style="text-align: center; padding: 2rem;">
        <i class="fas fa-spinner fa-spin fa-2x"></i>
        <p>Loading featured products...</p>
      </div>
    `;

    // Updated URL to use port 3000 for backend API
    const response = await fetch('http://localhost:3000/api/products/featured');
    console.log('Featured products response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch featured products: ${response.status} ${response.statusText}`);
    }
    
    const products = await response.json();
    console.log(`Received ${products.length} featured products`);

    featuredContainer.innerHTML = ''; // Clear the loading spinner
    
    if (!products || products.length === 0) {
      console.log('No featured products available');
      
      // Create a message with sample products since there are no featured ones
      featuredContainer.innerHTML = `
        <div class="no-featured" style="text-align: center; padding: 2rem;">
          <p>No featured products available at the moment.</p>
          <p>Here are some sample products instead:</p>
        </div>
      `;
      
      // Add some hard-coded sample products when there are no featured products in DB
      const sampleProducts = [
        {
          _id: "sample1",
          name: "Premium Wireless Headphones",
          price: 249.99,
          description: "Experience crystal-clear audio with our noise-cancelling wireless headphones.",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
          _id: "sample2",
          name: "Ultra-Slim Laptop",
          price: 1299.99,
          description: "Powerful performance in an incredibly slim design.",
          image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
          _id: "sample3",
          name: "Smart Home Hub",
          price: 129.99,
          description: "Control your entire smart home ecosystem with this intuitive hub.",
          image: "https://images.unsplash.com/photo-1558089687-f282ffcbc0d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
          _id: "sample4",
          name: "Pro Gaming Console",
          price: 499.99,
          description: "Next-gen gaming with stunning graphics and fast loading times.",
          image: "https://images.unsplash.com/photo-1592155931584-901ac15763e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
      ];
      
      sampleProducts.forEach(product => {
        const productCard = createProductCard(product);
        featuredContainer.appendChild(productCard);
      });
      
      return;
    }
    
    // Display actual featured products from database
    products.forEach((product) => {
      const productCard = createProductCard(product);
      featuredContainer.appendChild(productCard);
    });
  } catch (error) {
    console.error('Error loading featured products:', error);
    
    const featuredContainer = document.getElementById('featured-products-container');
    if (featuredContainer) {
      featuredContainer.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 2rem;">
          <i class="fas fa-exclamation-circle fa-2x" style="color: #dc3545;"></i>
          <p class="error-message">Failed to load featured products. Please try again later.</p>
          <button onclick="loadFeaturedProducts()" class="retry-btn" 
                  style="padding: 0.5rem 1rem; margin-top: 1rem; cursor: pointer;">
            Try Again
          </button>
        </div>
      `;
    }
  }
}

// Create product card element
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  // Generate stars based on rating (if available)
  let starsHTML = '';
  if (product.rating) {
    const rating = parseFloat(product.rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        starsHTML += '<i class="fas fa-star star"></i>';
      } else if (i - 0.5 <= rating) {
        starsHTML += '<i class="fas fa-star-half-alt star"></i>';
      } else {
        starsHTML += '<i class="far fa-star star"></i>';
      }
    }
  }
  
  card.innerHTML = `
        <img src="${product.image || 'https://picsum.photos/500/500?random=' + product._id}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description && product.description.length > 80 ? 
          product.description.substring(0, 80) + '...' : 
          product.description || 'No description available'}</p>
        <p class="price">$${product.price.toFixed(2)}</p>
        ${starsHTML ? `<div class="product-rating">${starsHTML}</div>` : ''}
        <button onclick="addToCart('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${
    product.image || 'https://picsum.photos/500/500?random=' + product._id
  }')">Add to Cart</button>
    `;
  return card;
}

// Add to cart functionality
function addToCart(productId, name, price, image) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to add items to cart');
    window.location.href = '/login.html';
    return;
  }

  // Add to cart logic will be implemented here
}

// Merge guest cart with user cart
async function mergeGuestCartWithUserCart(token) {
    const guestCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (guestCart.length === 0) return;

    try {
        // Add each item from guest cart to user cart
        for (const item of guestCart) {
            // Updated URL to use port 3000 for backend API
            const response = await fetch('http://localhost:3000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: item.id,
                    quantity: item.quantity
                })
            });

            if (!response.ok) {
                throw new Error('Failed to merge cart items');
            }
        }

        // Clear guest cart after successful merge
        localStorage.removeItem('cart');
    } catch (error) {
        console.error('Error merging carts:', error);
        // If merge fails, keep the guest cart
    }
}

// Update login success handler
async function handleLoginSuccess(token, isAdmin) {
    localStorage.setItem('token', token);
    localStorage.setItem('isAdmin', isAdmin);
    
    // Merge guest cart with user cart
    await mergeGuestCartWithUserCart(token);
    
    // Update UI
    checkAuthStatus();
    
    // Redirect if needed
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) {
        window.location.href = redirect + '.html';
    } else {
        window.location.href = 'index.html';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Load navbar component
  loadNavbar();
  
  // Check auth status after navbar loads
  checkAuthStatus();
  
  // Check for featured products container on the index page
  const featuredContainer = document.getElementById('featured-products-container');
  if (featuredContainer) {
    loadFeaturedProducts();
  }
  // Check for regular products container on other pages
  else if (document.getElementById('products-container')) {
    loadFeaturedProducts();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const activitiesList = document.getElementById('activities-list');
  const activityForm = document.getElementById('activity-form');
  const formContainer = document.getElementById('activity-form-container');
  const addActivityBtn = document.getElementById('add-activity-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  
  // State
  let activities = [];
  let editingActivityId = null;
  
  // Show/hide form
  function toggleForm(show) {
    formContainer.style.display = show ? 'block' : 'none';
    if (!show) {
      activityForm.reset();
      editingActivityId = null;
    }
  }
  
  // Event Listeners
  addActivityBtn.addEventListener('click', () => toggleForm(true));
  cancelBtn.addEventListener('click', () => toggleForm(false));
  
  // Form Submit Handler
  activityForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('name').value,
      description: document.getElementById('description').value,
      duration: parseInt(document.getElementById('duration').value),
      ageGroup: document.getElementById('ageGroup').value,
      location: document.getElementById('location').value
    };
    
    try {
      let response;
      
      if (editingActivityId) {
        // Update existing activity - using absolute URL with port 3000
        response = await fetch(`http://localhost:3000/api/activities/${editingActivityId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Create new activity - using absolute URL with port 3000
        response = await fetch('http://localhost:3000/api/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to save activity');
      }
      
      // Reset form and hide it
      activityForm.reset();
      toggleForm(false);
      
      // Refresh activities list
      fetchActivities();
      
    } catch (error) {
      console.error('Error saving activity:', error);
      showError('Failed to save activity. Please try again.');
    }
  });
  
  // Fetch all activities from the API
  async function fetchActivities() {
    try {
      activitiesList.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i> Loading activities...
        </div>
      `;
      
      // Updated URL to use port 3000 for backend API
      const response = await fetch('http://localhost:3000/api/activities');
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      activities = await response.json();
      renderActivities();
      
    } catch (error) {
      console.error('Error fetching activities:', error);
      showError('Failed to load activities. Please refresh the page.');
    }
  }
  
  // Render activities in the DOM
  function renderActivities() {
    if (activities.length === 0) {
      activitiesList.innerHTML = `
        <div class="no-activities">
          <p>No activities found. Add your first activity to get started!</p>
          <button class="cta-button" id="no-activities-add-btn">
            <i class="fas fa-plus"></i> Add Activity
          </button>
        </div>
      `;
      
      // Add event listener to the "Add Activity" button in the no activities message
      document.getElementById('no-activities-add-btn').addEventListener('click', () => {
        toggleForm(true);
      });
      
      return;
    }
    
    activitiesList.innerHTML = activities.map(activity => `
      <div class="activity-card" data-id="${activity._id}">
        <div class="activity-card-header">
          <div>
            <h3 class="activity-title">${activity.name}</h3>
            <div class="activity-location">
              <i class="fas fa-map-marker-alt"></i> ${activity.location}
            </div>
          </div>
        </div>
        
        <div class="activity-details">
          <div class="activity-info">
            <span>Duration</span>
            <p>${activity.duration} minutes</p>
          </div>
          
          <div class="activity-info">
            <span>Age Group</span>
            <p>${activity.ageGroup}</p>
          </div>
        </div>
        
        <div class="activity-description">
          <p>${activity.description}</p>
        </div>
        
        <div class="activity-actions">
          <button class="action-btn edit-btn" data-id="${activity._id}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="action-btn delete-btn" data-id="${activity._id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `).join('');
    
    // Add event listeners to the edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const activityId = e.target.closest('.edit-btn').getAttribute('data-id');
        editActivity(activityId);
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const activityId = e.target.closest('.delete-btn').getAttribute('data-id');
        deleteActivity(activityId);
      });
    });
  }
  
  // Edit activity
  function editActivity(activityId) {
    const activity = activities.find(act => act._id === activityId);
    
    if (activity) {
      // Populate form with activity data
      document.getElementById('name').value = activity.name;
      document.getElementById('description').value = activity.description;
      document.getElementById('duration').value = activity.duration;
      document.getElementById('ageGroup').value = activity.ageGroup;
      document.getElementById('location').value = activity.location;
      
      // Set editing state
      editingActivityId = activityId;
      
      // Show form
      toggleForm(true);
    }
  }
  
  // Delete activity
  async function deleteActivity(activityId) {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        // Updated URL to use port 3000 for backend API
        const response = await fetch(`http://localhost:3000/api/activities/${activityId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete activity');
        }
        
        // Refresh activities
        fetchActivities();
        
      } catch (error) {
        console.error('Error deleting activity:', error);
        showError('Failed to delete activity. Please try again.');
      }
    }
  }
  
  // Show error message
  function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    activitiesList.insertAdjacentElement('beforebegin', errorElement);
    
    // Remove error after 5 seconds
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }
  
  // Initial fetch of activities
  fetchActivities();
});

