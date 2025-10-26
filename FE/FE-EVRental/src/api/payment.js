// Payment API Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5168';

console.log('Payment API Base URL:', API_BASE_URL);

/**
 * Create PayOS payment link
 * @param {Object} paymentData - Payment information matching PaymentCreateDTO
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Payment response with paymentUrl
 */
export async function createPayOSPayment(paymentData, token) {
  try {
    const requestBody = {
      AccountID: parseInt(paymentData.accountID) || 0,
      Amount: parseFloat(paymentData.amount) || 0,
      BikeID: parseInt(paymentData.bikeID) || 0,
      StationID: parseInt(paymentData.stationID) || 0,
      PaymentMethod: 1, // 1 = PayOS (integer)
      PaymentType: 1, // 1 = Deposit (integer)
      Status: 0 // 0 = Pending (integer)
    };

    console.log('Payment API Request:', {
      url: `${API_BASE_URL}/api/Payment/CreatePayment`,
      body: requestBody,
      token: token ? 'Token exists' : 'No token'
    });

    const response = await fetch(`${API_BASE_URL}/api/Payment/CreatePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Payment API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Payment API Error Response (raw):', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error('Payment API Error Response (parsed):', errorData);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      // Log validation errors if available (.NET model state errors)
      if (errorData.errors) {
        console.error('Validation Errors:', errorData.errors);
        // Format validation errors
        const validationMessages = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        throw new Error(`Lỗi validation:\n${validationMessages}`);
      }
      
      throw new Error(errorData.message || errorData.Message || errorData.title || 'Không thể tạo link thanh toán');
    }

    const result = await response.json();
    console.log('Payment API Success Response:', result);
    return result; // Returns { paymentUrl: "..." }
  } catch (error) {
    console.error('PayOS Payment Error:', error);
    throw error;
  }
}

/**
 * Verify payment status
 * @param {string} orderId - Order ID to verify
 * @returns {Promise<Object>} Payment status
 */
export async function verifyPayment(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Payment/VerifyPayment/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment Verification Error:', error);
    throw error;
  }
}

/**
 * Cancel payment
 * @param {string} orderId - Order ID to cancel
 * @returns {Promise<Object>} Cancellation response
 */
export async function cancelPayment(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Payment/CancelPayment/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to cancel payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment Cancellation Error:', error);
    throw error;
  }
}

/**
 * Mark payment as successful (gọi BE API để update status)
 * @param {number} orderID - Payment ID from PayOS callback
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with status (int)
 */
export async function markPaymentSuccess(orderID, token) {
  try {
    console.log('✅ Calling BE success API - orderID:', orderID);
    
    const response = await fetch(`${API_BASE_URL}/api/Payment/success?orderID=${orderID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('BE Success API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('BE Success API Error:', errorText);
      throw new Error('Không thể xác nhận thanh toán thành công');
    }

    const result = await response.json();
    console.log('✅ BE Success Response:', result);
    
    // BE trả về { message: "...", status: 1 }
    return result;
  } catch (error) {
    console.error('Mark Payment Success Error:', error);
    throw error;
  }
}

/**
 * Mark payment as failed (gọi BE API để update status)
 * @param {number} orderID - Payment ID from PayOS callback
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Response with status (int)
 */
export async function markPaymentFailed(orderID, token) {
  try {
    console.log('❌ Calling BE failed API - orderID:', orderID);
    
    const response = await fetch(`${API_BASE_URL}/api/Payment/failed?orderID=${orderID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('BE Failed API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('BE Failed API Error:', errorText);
      throw new Error('Không thể xác nhận thanh toán thất bại');
    }

    const result = await response.json();
    console.log('❌ BE Failed Response:', result);
    
    // BE trả về { message: "...", status: -1 }
    return result;
  } catch (error) {
    console.error('Mark Payment Failed Error:', error);
    throw error;
  }
}
