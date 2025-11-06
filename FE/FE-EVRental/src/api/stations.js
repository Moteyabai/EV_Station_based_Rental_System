const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5168';

/**
 * Get active stations only
 * @returns {Promise<Array>} List of active stations
 */
export async function fetchActiveStations() {
  try {
    // Add timestamp to prevent caching and ensure fresh data on reload
    const timestamp = new Date().getTime();
    const url = `${API_BASE_URL}/api/Station/GetActiveStations?_t=${timestamp}`;
    
    console.log('🏪 Calling API:', url);
    const res = await fetch(url, {
      cache: 'no-store' // Disable browser cache
    });
    console.log('🏪 Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('🏪 API Error:', errorText);
      throw new Error(`Failed to fetch active stations: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('🏪 Stations data received:', data);
    console.log('🏪 Number of stations:', data?.length || 0);
    return data;
  } catch (error) {
    console.error('❌ fetchActiveStations error:', error);
    throw error;
  }
}

/**
 * Get station by ID
 * @param {number} id - Station ID
 * @param {string} token - JWT token for authentication (optional)
 * @returns {Promise<Object>} Station data with StationID from database
 */
export async function fetchStationById(id, token) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`🏪 Fetching station with ID: ${id}`);
    
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const url = `${API_BASE_URL}/api/Station/GetStationById/${id}?_t=${timestamp}`;
    
    const res = await fetch(url, {
      headers,
      cache: 'no-store'
    });
    
    console.log('🏪 Get station response status:', res.status);
    
    if (!res.ok) {
      if (res.status === 404) {
        console.warn(`⚠️ Station with ID ${id} not found (404), will use provided ID`);
        // Return a minimal object with the provided stationID so caller can use it
        return { stationID: id, notFound: true };
      }
      
      const errorText = await res.text();
      console.error('🏪 Get station error:', errorText);
      throw new Error(`Failed to fetch station by id: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('✅ Station data from API:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching station:', error);
    // If it's a network error, return minimal object
    if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      console.warn('⚠️ Network error, using provided station ID:', id);
      return { stationID: id, notFound: true };
    }
    throw error;
  }
}


