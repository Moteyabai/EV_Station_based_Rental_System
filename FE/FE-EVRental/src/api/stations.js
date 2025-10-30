const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5168';

/**
 * Get active stations only
 * @returns {Promise<Array>} List of active stations
 */
export async function fetchActiveStations() {
  try {
    console.log('🏪 Calling API:', `${API_BASE_URL}/api/Station/GetActiveStations`);
    const res = await fetch(`${API_BASE_URL}/api/Station/GetActiveStations`);
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
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_BASE_URL}/api/Station/GetStationById/${id}`, {
    headers
  });
  
  if (!res.ok) throw new Error('Failed to fetch station by id');
  return res.json();
}


