// Admin Service - API calls for Admin dashboard
const API_BASE_URL = 'http://localhost:5168/api';

// Get token from storage (localStorage or sessionStorage), falling back to legacy key
import { getToken } from "../utils/auth";

// Get token from storage
const getAuthToken = () => {
  return getToken();
};

// Get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// ==================== STATION APIs ====================

// Get all stations
export const getAllStations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/Station/GetAllStations`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stations:', error);
    throw error;
  }
};

// Get active stations
export const getActiveStations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/Station/GetActiveStations`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching active stations:', error);
    throw error;
  }
};

// Get station by ID
export const getStationById = async (stationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Station/GetStationByID/${stationId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching station:', error);
    throw error;
  }
};

// Create new station
export const createStation = async (stationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Station/CreateStation`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(stationData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating station:', error);
    throw error;
  }
};

// Update station
export const updateStation = async (stationId, stationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Station/UpdateStation/${stationId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(stationData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating station:', error);
    throw error;
  }
};

// Delete station
export const deleteStation = async (stationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Station/DeleteStation/${stationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting station:', error);
    throw error;
  }
};

// ==================== STAFF/ACCOUNT APIs ====================

// Get all accounts (for staff management)
export const getAllAccounts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/Account/AccountList`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
};

// Delete staff by ID
export const deleteStaff = async (staffId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/StationStaff/DeleteStaff/${staffId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${text}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting staff:', error);
    throw error;
  }
};

// Update staff by ID (multipart/form-data expected)
export const updateStaff = async (staffId, formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/StationStaff/UpdateStaff/${staffId}`, {
      method: 'PUT',
      headers: {
        // Authorization header only; do NOT set Content-Type for FormData
        Authorization: getAuthHeaders().Authorization,
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${text}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating staff:', error);
    throw error;
  }
};

// ==================== EV BIKE APIs ====================

// Get all bikes
export const getAllBikes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/EVBike/GetAllEVBikes`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching bikes:', error);
    throw error;
  }
};

// Get bikes by station
export const getBikesByStation = async (stationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/EVBike/GetBikesByStation/${stationId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching bikes by station:', error);
    throw error;
  }
};

// ==================== RENTAL APIs ====================

// Get all rentals
export const getAllRentals = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/Rental/GetAllRentals`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching rentals:', error);
    throw error;
  }
};

// Get rental statistics
export const getRentalStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/Rental/GetStatistics`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching rental statistics:', error);
    throw error;
  }
};

// ==================== PAYMENT APIs ====================

// Get all payments
export const getAllPayments = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/Payment/GetAllPayments`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

export default {
  // Stations
  getAllStations,
  getActiveStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation,
  
  // Accounts
  getAllAccounts,
  deleteStaff,
  updateStaff,
  
  // Bikes
  getAllBikes,
  getBikesByStation,
  
  // Rentals
  getAllRentals,
  getRentalStatistics,
  
  // Payments
  getAllPayments
};
