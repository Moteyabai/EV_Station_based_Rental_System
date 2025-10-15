// Utility để quản lý booking data trong localStorage

const BOOKINGS_KEY = 'ev_rental_bookings';

/**
 * Lấy tất cả bookings từ localStorage
 */
export const getAllBookings = () => {
  try {
    const bookingsJson = localStorage.getItem(BOOKINGS_KEY);
    return bookingsJson ? JSON.parse(bookingsJson) : [];
  } catch (error) {
    console.error('Error reading bookings from localStorage:', error);
    return [];
  }
};

/**
 * Lưu booking mới sau khi thanh toán thành công
 */
export const saveBooking = (bookingData, baseBookingId = null) => {
  try {
    const existingBookings = getAllBookings();
    
    // Sử dụng baseBookingId nếu được truyền vào, nếu không thì tạo mới
    const bookingId = baseBookingId || `BK${Date.now()}`;
    
    const newBooking = {
      id: bookingId, // Sử dụng ID được truyền vào hoặc tạo mới
      ...bookingData,
      createdAt: new Date().toISOString(),
      status: 'pending_payment', // pending_payment, booked, renting, completed, cancelled
      paymentVerified: false, // Staff chưa xác nhận thanh toán
      paymentVerifiedAt: null,
      paymentVerifiedBy: null,
    };
    
    existingBookings.push(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(existingBookings));
    
    console.log('💾 Đã lưu booking:', newBooking.id);
    
    return newBooking;
  } catch (error) {
    console.error('Error saving booking to localStorage:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái booking
 */
export const updateBookingStatus = (bookingId, newStatus) => {
  try {
    const bookings = getAllBookings();
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: newStatus, updatedAt: new Date().toISOString() }
        : booking
    );
    
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedBookings));
    return true;
  } catch (error) {
    console.error('Error updating booking status:', error);
    return false;
  }
};

/**
 * Lấy bookings theo user ID
 */
export const getBookingsByUser = (userId) => {
  const allBookings = getAllBookings();
  return allBookings.filter(booking => booking.userId === userId);
};

/**
 * Lấy bookings theo trạng thái
 */
export const getBookingsByStatus = (status) => {
  const allBookings = getAllBookings();
  return allBookings.filter(booking => booking.status === status);
};

/**
 * Lấy booking theo ID
 */
export const getBookingById = (bookingId) => {
  const allBookings = getAllBookings();
  return allBookings.find(booking => booking.id === bookingId);
};

/**
 * Xóa booking (chỉ dùng khi cần thiết)
 */
export const deleteBooking = (bookingId) => {
  try {
    const bookings = getAllBookings();
    const filteredBookings = bookings.filter(booking => booking.id !== bookingId);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(filteredBookings));
    return true;
  } catch (error) {
    console.error('Error deleting booking:', error);
    return false;
  }
};

/**
 * Xóa tất cả bookings (chỉ dùng cho development)
 */
export const clearAllBookings = () => {
  try {
    localStorage.removeItem(BOOKINGS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing bookings:', error);
    return false;
  }
};

/**
 * Xác nhận thanh toán - chuyển từ pending_payment sang booked
 */
export const verifyPayment = (bookingId, staffName) => {
  try {
    const bookings = getAllBookings();
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId 
        ? { 
            ...booking, 
            status: 'booked',
            paymentVerified: true,
            paymentVerifiedAt: new Date().toISOString(),
            paymentVerifiedBy: staffName
          }
        : booking
    );
    
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedBookings));
    return true;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};

/**
 * Từ chối thanh toán - chuyển sang cancelled
 */
export const rejectPayment = (bookingId, reason, staffName) => {
  try {
    const bookings = getAllBookings();
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId 
        ? { 
            ...booking, 
            status: 'cancelled',
            paymentVerified: false,
            rejectedAt: new Date().toISOString(),
            rejectedBy: staffName,
            rejectionReason: reason
          }
        : booking
    );
    
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedBookings));
    return true;
  } catch (error) {
    console.error('Error rejecting payment:', error);
    return false;
  }
};
