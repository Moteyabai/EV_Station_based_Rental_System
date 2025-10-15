// SCRIPT DEBUG BOOKING SYSTEM
// Copy và paste vào Console (F12) của trình duyệt

console.log('🚀 ===== BOOKING SYSTEM DEBUG TOOL =====\n');

// 1. Kiểm tra LocalStorage
const BOOKINGS_KEY = 'ev_rental_bookings';
const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];

console.log('📦 Tổng số bookings:', bookings.length);
console.log('📋 Tất cả bookings:', bookings);

if (bookings.length > 0) {
    // Phân loại theo status
    const byStatus = {
        pending_payment: bookings.filter(b => b.status === 'pending_payment').length,
        booked: bookings.filter(b => b.status === 'booked').length,
        renting: bookings.filter(b => b.status === 'renting').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length
    };
    
    console.log('\n📊 Phân loại theo Status:');
    console.table(byStatus);
    
    // Kiểm tra booking mới nhất
    const latest = bookings[bookings.length - 1];
    console.log('\n✨ Booking mới nhất:');
    console.log('ID:', latest.id);
    console.log('Customer:', latest.userName);
    console.log('Vehicle:', latest.vehicleName);
    console.log('Status:', latest.status);
    console.log('Payment Method:', latest.paymentMethod);
    console.log('Total Price:', latest.totalPrice);
    console.log('Created At:', latest.createdAt);
    console.log('Payment Verified:', latest.paymentVerified);
    
    // Kiểm tra cấu trúc
    const requiredFields = [
        'id', 'userId', 'userName', 'userEmail', 'userPhone',
        'vehicleName', 'licensePlate', 'pickupDate', 'returnDate',
        'pickupStation', 'returnStation', 'totalPrice', 'paymentMethod',
        'status', 'createdAt', 'paymentVerified'
    ];
    
    const missingFields = requiredFields.filter(field => !latest.hasOwnProperty(field));
    
    if (missingFields.length > 0) {
        console.warn('\n⚠️ Booking thiếu các fields:', missingFields);
    } else {
        console.log('\n✅ Cấu trúc booking hợp lệ!');
    }
    
} else {
    console.warn('⚠️ Không có booking nào trong localStorage!');
    console.log('\n💡 Để tạo test booking, chạy:');
    console.log('%ccreatestBooking()', 'color: #4db6ac; font-weight: bold;');
}

// 2. Kiểm tra User đã đăng nhập
console.log('\n👤 ===== USER INFO =====');
const userStr = localStorage.getItem('user');
if (userStr) {
    const user = JSON.parse(userStr);
    console.log('User:', user);
    console.log('Role:', user.roleID === 2 ? '👨‍💼 Staff' : '👤 Customer');
    console.log('Email:', user.email);
    console.log('Name:', user.fullName || user.name);
} else {
    console.warn('⚠️ Chưa có user đăng nhập!');
}

// 3. Function helper
console.log('\n🛠️ ===== HELPER FUNCTIONS =====');

window.createTestBooking = () => {
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];
    const testBooking = {
        id: `BK${Date.now()}-1`,
        userId: "customer@test.com",
        userEmail: "customer@test.com",
        userName: "Nguyễn Văn Test",
        userPhone: "0987654321",
        vehicleName: "VinFast VF e34",
        vehicleId: "1",
        licensePlate: `59A-${Math.floor(10000 + Math.random() * 90000)}`,
        vehicleImage: "/images/vinfast-vf-e34.jpg",
        pickupDate: "2025-10-20",
        returnDate: "2025-10-25",
        pickupTime: "09:00",
        returnTime: "18:00",
        pickupStation: "Trạm Quận 1, TPHCM",
        returnStation: "Trạm Quận 1, TPHCM",
        days: 5,
        totalPrice: 5000000,
        additionalServices: {},
        paymentMethod: "cash",
        battery: "100%",
        lastCheck: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: "pending_payment",
        paymentVerified: false,
        paymentVerifiedAt: null,
        paymentVerifiedBy: null
    };
    
    bookings.push(testBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    console.log('✅ Đã tạo test booking:', testBooking);
    console.log('💡 Reload trang Staff để thấy booking mới!');
    return testBooking;
};

window.clearBookings = () => {
    localStorage.removeItem(BOOKINGS_KEY);
    console.log('🗑️ Đã xóa tất cả bookings!');
};

window.viewBookings = () => {
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];
    console.table(bookings.map(b => ({
        ID: b.id,
        Customer: b.userName,
        Vehicle: b.vehicleName,
        Status: b.status,
        Method: b.paymentMethod,
        Price: b.totalPrice,
        Verified: b.paymentVerified ? '✅' : '❌'
    })));
};

window.testStaffView = () => {
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];
    console.log('\n📱 ===== STAFF VIEW SIMULATION =====');
    
    // Payment Management tab
    const paymentTab = bookings.map(b => ({
        id: b.id,
        customer: b.userName,
        vehicle: b.vehicleName,
        amount: b.totalPrice,
        status: b.status === 'pending_payment' ? 'pending' : 
                b.status === 'cancelled' ? 'cancelled' : 'verified',
        method: b.paymentMethod
    }));
    
    console.log('\n💰 Payment Management Tab:');
    console.table(paymentTab);
    
    // Vehicle Handover tab
    const handoverTab = bookings
        .filter(b => b.status !== 'pending_payment' && b.status !== 'cancelled')
        .map(b => ({
            id: b.id,
            customer: b.userName,
            vehicle: b.vehicleName,
            status: b.status,
            verified: b.paymentVerified ? '✅' : '❌'
        }));
    
    console.log('\n🚗 Vehicle Handover Tab:');
    if (handoverTab.length > 0) {
        console.table(handoverTab);
    } else {
        console.log('❌ Không có booking nào (cần xác nhận thanh toán trước)');
    }
};

console.log('\n📚 Available Commands:');
console.log('%ccreateTestBooking()', 'color: #10b981; font-weight: bold;', '- Tạo test booking');
console.log('%cclearBookings()', 'color: #ef4444; font-weight: bold;', '- Xóa tất cả bookings');
console.log('%cviewBookings()', 'color: #3b82f6; font-weight: bold;', '- Xem bảng bookings');
console.log('%ctestStaffView()', 'color: #8b5cf6; font-weight: bold;', '- Test Staff view');

console.log('\n✅ Debug tool loaded! Sử dụng các functions ở trên để test.\n');
