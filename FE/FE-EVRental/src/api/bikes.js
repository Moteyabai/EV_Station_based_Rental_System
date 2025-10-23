const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5168';

/**
 * Get all bikes from backend
 * @param {string} token - JWT token for authentication (optional)
 * @returns {Promise<Array>} List of all bikes
 */
export const getAllBikes = async (token) => {
  try {
    console.log('Fetching all bikes...');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/EVBike/GetAllBikes`, {
      method: 'GET',
      headers
    });

    console.log('Get all bikes response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get all bikes error:', errorText);
      throw new Error(`Failed to get bikes: ${response.status}`);
    }

    const data = await response.json();
    console.log('All bikes from API:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching all bikes:', error);
    throw error;
  }
};

/**
 * Get bike by ID from backend
 * @param {number} bikeId - The bike ID
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} Bike data with BikeID from database
 */
export const getBikeById = async (bikeId, token) => {
  try {
    console.log(`Fetching bike with ID: ${bikeId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/EVBike/GetBikeByID/${bikeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Get bike response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get bike error:', errorText);
      throw new Error(`Failed to get bike: ${response.status}`);
    }

    const data = await response.json();
    console.log('Bike data from API:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching bike:', error);
    throw error;
  }
};

/**
 * Get all bikes from a specific station
 * @param {number} stationId - The station ID
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Array>} List of bikes at the station
 */
export const getBikesByStation = async (stationId, token) => {
  try {
    console.log(`Fetching bikes for station: ${stationId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/EVBike/GetBikesByStation/${stationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get bikes by station error:', errorText);
      throw new Error(`Failed to get bikes: ${response.status}`);
    }

    const data = await response.json();
    console.log('Bikes from station:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching bikes by station:', error);
    throw error;
  }
};
