// Rental API Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5168';

console.log('Rental API Base URL:', API_BASE_URL);

/**
 * Get all active rentals (status = 1)
 * @param {string} token - JWT authentication token
 * @returns {Promise<Array>} List of active rentals
 */
export async function getActiveRentals(token) {
  try {
    console.log('📋 [RENTAL] Fetching active rentals (status=1)...');
    
    const response = await fetch(`${API_BASE_URL}/api/Rental/GetActiveRentals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📥 [RENTAL] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [RENTAL] Error response:', errorText);
      throw new Error('Không thể tải danh sách đơn đang hoạt động');
    }

    const rentals = await response.json();
    console.log('✅ [RENTAL] Active rentals (status=1):', rentals);
    return rentals;
  } catch (error) {
    console.error('💥 [RENTAL] Error:', error);
    throw error;
  }
}

/**
 * Get all pending rentals (status = 0)
 * @param {string} token - JWT authentication token
 * @returns {Promise<Array>} List of pending rentals
 */
export async function getPendingRentals(token) {
  try {
    console.log('📋 [RENTAL] Fetching pending rentals...');
    
    const response = await fetch(`${API_BASE_URL}/api/Rental/GetPendingRentals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📥 [RENTAL] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [RENTAL] Error response:', errorText);
      throw new Error('Không thể tải danh sách đơn chờ thanh toán');
    }

    const rentals = await response.json();
    console.log('✅ [RENTAL] Pending rentals:', rentals);
    return rentals;
  } catch (error) {
    console.error('💥 [RENTAL] Error:', error);
    throw error;
  }
}

/**
 * Get rental by ID
 * @param {number} rentalId - Rental ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Rental details
 */
export async function getRentalById(rentalId, token) {
  try {
    console.log('📋 [RENTAL] Fetching rental by ID:', rentalId);
    
    const response = await fetch(`${API_BASE_URL}/api/Rental/GetRentalById/${rentalId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📥 [RENTAL] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [RENTAL] Error response:', errorText);
      throw new Error('Không thể tải thông tin đơn thuê');
    }

    const rental = await response.json();
    console.log('✅ [RENTAL] Rental details:', rental);
    return rental;
  } catch (error) {
    console.error('💥 [RENTAL] Error:', error);
    throw error;
  }
}

/**
 * Get all completed rentals
 * @param {string} token - JWT authentication token
 * @returns {Promise<Array>} List of completed rentals
 */
export async function getCompletedRentals(token) {
  try {
    console.log('📋 [RENTAL] Fetching completed rentals...');
    
    const response = await fetch(`${API_BASE_URL}/api/Rental/GetCompletedRentals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📥 [RENTAL] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [RENTAL] Error response:', errorText);
      throw new Error('Không thể tải danh sách đơn đã hoàn thành');
    }

    const rentals = await response.json();
    console.log('✅ [RENTAL] Completed rentals:', rentals);
    return rentals;
  } catch (error) {
    console.error('💥 [RENTAL] Error:', error);
    throw error;
  }
}

/**
 * Get rentals by account ID
 * @param {number} accountID - Account ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Array>} List of rentals for the account
 */
export async function getRentalsByAccountID(accountID, token) {
  try {
    console.log('📋 [RENTAL] Fetching rentals for account:', accountID);
    
    const response = await fetch(`${API_BASE_URL}/api/Rental/GetRentalsByAccountID/${accountID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📥 [RENTAL] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [RENTAL] Error response:', errorText);
      throw new Error('Không thể tải lịch sử thuê xe');
    }

    const rentals = await response.json();
    console.log('✅ [RENTAL] User rentals:', rentals);
    return rentals;
  } catch (error) {
    console.error('💥 [RENTAL] Error:', error);
    throw error;
  }
}

/**
 * Get all rentals (all statuses)
 * @param {string} token - JWT authentication token
 * @returns {Promise<Array>} List of all rentals
 */
export async function getAllRentals(token) {
  try {
    console.log('📋 [RENTAL] Fetching all rentals...');
    
    const response = await fetch(`${API_BASE_URL}/api/Rental/GetAllRentals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📥 [RENTAL] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [RENTAL] Error response:', errorText);
      throw new Error('Không thể tải danh sách đơn thuê');
    }

    const rentals = await response.json();
    console.log('✅ [RENTAL] All rentals:', rentals);
    return rentals;
  } catch (error) {
    console.error('💥 [RENTAL] Error:', error);
    throw error;
  }
}

/**
 * Get renter information by account ID
 * @param {number} accountID - Account ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Renter information including total rentals and total spent
 */
export async function getRenterByAccountID(accountID, token) {
  try {
    console.log('👤 [RENTAL] Fetching renter info for account:', accountID);
    
    const response = await fetch(`${API_BASE_URL}/api/Renter/GetRenterByAccountID/${accountID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📥 [RENTAL] Renter response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [RENTAL] Renter error response:', errorText);
      throw new Error('Không thể tải thông tin người thuê');
    }

    const renterInfo = await response.json();
    console.log('✅ [RENTAL] Renter info:', renterInfo);
    return renterInfo;
  } catch (error) {
    console.error('💥 [RENTAL] Renter error:', error);
    throw error;
  }
}
