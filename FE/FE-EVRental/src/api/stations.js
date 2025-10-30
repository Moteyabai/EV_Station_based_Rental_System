const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5168';

/**
 * Get active stations only
 * @returns {Promise<Array>} List of active stations
 */
export async function fetchActiveStations() {
  const res = await fetch(`${API_BASE_URL}/api/Station/GetActiveStations`);
  if (!res.ok) throw new Error('Failed to fetch active stations');
  return res.json();
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


