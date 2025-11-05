const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5168';

// ==================== BIKE API FUNCTIONS ====================

/**
 * Get all bikes from backend (includes all statuses)
 * Use this when you need ALL bikes regardless of availability status
 * For user-facing pages, prefer getAvailableBikes() instead
 * 


/**
 * Get all AVAILABLE bikes only (status = Active)
 * This is the recommended function for user-facing pages
 * Returns only bikes that can be rented
 * 
 * @param {string} token - JWT token for authentication (optional)
 * @returns {Promise<Array>} List of available bikes for rent
 */
export const getAvailableBikes = async (token) => {
  try {
    console.log('🚲 Fetching available bikes...');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/EVBike/AvailableBikes`, {
      method: 'GET',
      headers
    });

    console.log('Available bikes response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get available bikes error:', errorText);
      throw new Error(`Failed to get available bikes: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Available bikes from API:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching available bikes:', error);
    throw error;
  }
};

/**
 * Get bike details by ID
 * Returns complete information about a specific bike
 * 
 * @param {number} bikeId - The bike ID
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} Bike data with BikeID from database
 */
export const getBikeById = async (bikeId) => {
  try {
    console.log(`🔍 Fetching bike with ID: ${bikeId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/EVBike/GetBikeByID/${bikeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Get bike response status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`⚠️ Bike with ID ${bikeId} not found (404), will use provided ID`);
        // Return a minimal object with the provided bikeID so caller can use it
        return { bikeID: bikeId, notFound: true };
      }
      
      const errorText = await response.text();
      console.error('Get bike error:', errorText);
      throw new Error(`Failed to get bike: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Bike data from API:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching bike:', error);
    // If it's a network error or other error, return minimal object
    if (error.message.includes('fetch')) {
      console.warn('⚠️ Network error, using provided bike ID:', bikeId);
      return { bikeID: bikeId, notFound: true };
    }
    throw error;
  }
};

/**
 * Get all bikes from a specific station
 * Returns bikes available at a particular rental station
 * 
 * @param {number} stationId - The station ID
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Array>} List of bikes at the station
 */
export const getBikesByStation = async (stationId) => {
  try {
    console.log(`🏪 Fetching bikes for station: ${stationId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/EVBike/GetBikesByStation/${stationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get bikes by station error:', errorText);
      throw new Error(`Failed to get bikes: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Bikes from station:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching bikes by station:', error);
    throw error;
  }
};
