-- ========================================
-- EV Station-based Rental System Demo Data
-- ========================================
-- This script creates demo data for all entities in the system
-- Execute in order as foreign key relationships are maintained
USE EVRenterDB
GO

-- ========================================
-- 1. ROLES TABLE
-- ========================================
INSERT INTO Roles (RoleID, RoleName) VALUES
(1, 'Renter'),
(2, 'Staff'),
(3, 'Admin');

-- ========================================
-- 2. BRANDS TABLE 
-- ========================================
INSERT INTO Brands (BrandID, BrandName) VALUES
(1, 'VinFast'),
(2, 'DatBike');

-- ========================================
-- 3. ACCOUNTS TABLE
-- ========================================
INSERT INTO Accounts (AccountID, FullName, Email, Password, RoleID, Phone, Avatar, Status, CreatedAt, UpdatedAt) VALUES
-- Admin Account
(1, 'Nguyễn Văn Admin', 'admin@evrentalvn.com', '$2a$11$hashedpassword1', 3, '0901234567', 'https://example.com/avatar1.jpg', 1, '2024-11-01 08:00:00', '2024-12-16 10:00:00'),

-- Staff Accounts
(2, 'Trần Thị Lan', 'staff1@evrentalvn.com', '$2a$11$hashedpassword2', 2, '0902345678', 'https://example.com/avatar2.jpg', 1, '2024-11-05 09:00:00', '2024-12-16 10:00:00'),
(3, 'Lê Văn Minh', 'staff2@evrentalvn.com', '$2a$11$hashedpassword3', 2, '0903456789', 'https://example.com/avatar3.jpg', 1, '2024-11-10 10:00:00', '2024-12-16 10:00:00'),
(4, 'Phạm Thị Hoa', 'staff3@evrentalvn.com', '$2a$11$hashedpassword4', 2, '0904567890', 'https://example.com/avatar4.jpg', 1, '2024-11-15 11:00:00', '2024-12-16 10:00:00'),

-- Renter Accounts
(5, 'Nguyễn Văn Khách', 'customer1@gmail.com', '$2a$11$hashedpassword5', 1, '0905678901', 'https://example.com/avatar5.jpg', 1, '2024-11-20 12:00:00', '2024-12-16 10:00:00'),
(6, 'Trần Thị Mai', 'customer2@gmail.com', '$2a$11$hashedpassword6', 1, '0906789012', 'https://example.com/avatar6.jpg', 1, '2024-11-25 13:00:00', '2024-12-16 10:00:00'),
(7, 'Lê Văn Tùng', 'customer3@gmail.com', '$2a$11$hashedpassword7', 1, '0907890123', 'https://example.com/avatar7.jpg', 1, '2024-12-01 14:00:00', '2024-12-16 10:00:00'),
(8, 'Phạm Thị Linh', 'customer4@gmail.com', '$2a$11$hashedpassword8', 1, '0908901234', 'https://example.com/avatar8.jpg', 1, '2024-12-05 15:00:00', '2024-12-16 10:00:00'),
(9, 'Hoàng Văn Đức', 'customer5@gmail.com', '$2a$11$hashedpassword9', 1, '0909012345', 'https://example.com/avatar9.jpg', 1, '2024-12-10 16:00:00', '2024-12-16 10:00:00'),
(10, 'Vũ Thị Nga', 'customer6@gmail.com', '$2a$11$hashedpassword10', 1, '0900123456', 'https://example.com/avatar10.jpg', 1, '2024-12-12 17:00:00', '2024-12-16 10:00:00');

-- ========================================
-- 4. STATIONS TABLE
-- ========================================
INSERT INTO Stations (StationID, Name, Address, Description, BikeCapacity, OpeningHours, ContactNumber, ImageUrl, ExteriorImageUrl, ThumbnailImageUrl, IsActive, CreatedAt, UpdatedAt) VALUES
(1, 'Trạm Quận 1', '123 Nguyễn Huệ, Quận 1, TP.HCM', 'Trạm xe điện trung tâm thành phố, phục vụ 24/7', 50, '24/7', '0281234567', 'https://example.com/station1.jpg', 'https://example.com/station1_ext.jpg', 'https://example.com/station1_thumb.jpg', 1, '2024-11-01 08:00:00', '2024-12-15 14:30:00'),

(2, 'Trạm Quận 2', '456 Đường Thủ Thiêm, Quận 2, TP.HCM', 'Trạm hiện đại khu vực Thủ Thiêm', 35, '06:00 - 22:00', '0282345678', 'https://example.com/station2.jpg', 'https://example.com/station2_ext.jpg', 'https://example.com/station2_thumb.jpg', 1, '2024-11-05 09:00:00', '2024-12-15 14:30:00'),

(3, 'Trạm Quận 3', '789 Võ Văn Tần, Quận 3, TP.HCM', 'Trạm trung tâm Quận 3, gần bệnh viện', 40, '24/7', '0283456789', 'https://example.com/station3.jpg', 'https://example.com/station3_ext.jpg', 'https://example.com/station3_thumb.jpg', 1, '2024-11-10 10:00:00', '2024-12-15 14:30:00'),

(4, 'Trạm Quận 7', '321 Nguyễn Thị Thập, Quận 7, TP.HCM', 'Trạm phục vụ khu Nam Sài Gòn', 30, '06:00 - 23:00', '0284567890', 'https://example.com/station4.jpg', 'https://example.com/station4_ext.jpg', 'https://example.com/station4_thumb.jpg', 1, '2024-11-15 11:00:00', '2024-12-15 14:30:00'),

(5, 'Trạm Tân Bình', '654 Cộng Hòa, Tân Bình, TP.HCM', 'Trạm gần sân bay Tân Sơn Nhất', 45, '24/7', '0285678901', 'https://example.com/station5.jpg', 'https://example.com/station5_ext.jpg', 'https://example.com/station5_thumb.jpg', 1, '2024-11-20 12:00:00', '2024-12-15 14:30:00'),

(6, 'Trạm Bình Thạnh', '987 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM', 'Trạm phục vụ khu vực Bình Thạnh', 25, '05:30 - 22:30', '0286789012', 'https://example.com/station6.jpg', 'https://example.com/station6_ext.jpg', 'https://example.com/station6_thumb.jpg', 1, '2024-11-25 13:00:00', '2024-12-15 14:30:00'),

(7, 'Trạm Phú Nhuận', '147 Phan Xích Long, Phú Nhuận, TP.HCM', 'Trạm trung tâm Phú Nhuận', 20, '06:00 - 21:00', '0287890123', 'https://example.com/station7.jpg', 'https://example.com/station7_ext.jpg', 'https://example.com/station7_thumb.jpg', 0, '2024-12-01 14:00:00', '2024-12-15 14:30:00'),

(8, 'Trạm Gò Vấp', '258 Quang Trung, Gò Vấp, TP.HCM', 'Trạm phục vụ khu vực Gò Vấp', 35, '24/7', '0288901234', 'https://example.com/station8.jpg', 'https://example.com/station8_ext.jpg', 'https://example.com/station8_thumb.jpg', 1, '2024-12-05 15:00:00', '2024-12-15 14:30:00');

-- ========================================
-- 5. STATION STAFF TABLE
-- ========================================
INSERT INTO StationStaffs (StaffID, AccountID, StationID, HandoverTimes, ReceiveTimes) VALUES
(1, 2, 1, 3, 3), -- Trần Thị Lan at Station 1
(2, 3, 2, 4, 4), -- Lê Văn Minh at Station 2  
(3, 4, 3, 5, 5), -- Phạm Thị Hoa at Station 3
(4, 2, 4, 9, 9), -- Trần Thị Lan also works at Station 4
(5, 3, 5, 10, 8), -- Lê Văn Minh also works at Station 5
(6, 4, 6, 2, 1), -- Phạm Thị Hoa also works at Station 6
(7, 2, 8, 0, 0); -- Trần Thị Lan also works at Station 8

-- ========================================
-- 6. RENTERS TABLE
-- ========================================
INSERT INTO Renters (RenterID, AccountID, DocumentID, TotalRental, TotalSpent) VALUES
(1, 5, 1, 1, 100000),
(2, 6, 2, 1, 150000),
(3, 7, 3, 1, 100000),
(4, 8, 4, 1, 100000),
(5, 9, 5, 2, 200000),
(6, 10, 6, 0,0);

-- ========================================
-- 7. ID DOCUMENTS TABLE
-- ========================================
INSERT INTO IDDocuments (DocumentID, RenterID, IDCardFront, IDCardBack, LicenseCardFront, LicenseCardBack, IDCardNumber, LicenseNumber, VerifiedByStaffID, VerificationStatus, CreatedAt, UpdatedAt) VALUES
(1, 1, 'https://example.com/id1_front.jpg', 'https://example.com/id1_back.jpg', 'https://example.com/license1_front.jpg', 'https://example.com/license1_back.jpg', '079200001234', 'B1-123456789', 1, 1, '2024-11-20 12:30:00', '2024-11-22 09:00:00'),

(2, 2, 'https://example.com/id2_front.jpg', 'https://example.com/id2_back.jpg', 'https://example.com/license2_front.jpg', 'https://example.com/license2_back.jpg', '079200002345', 'B1-234567890', 1, 1, '2024-11-25 13:30:00', '2024-11-27 10:00:00'),

(3, 3, 'https://example.com/id3_front.jpg', 'https://example.com/id3_back.jpg', 'https://example.com/license3_front.jpg', 'https://example.com/license3_back.jpg', '079200003456', 'B1-345678901', 2, 1, '2024-12-01 14:30:00', '2024-12-03 11:00:00'),

(4, 4, 'https://example.com/id4_front.jpg', 'https://example.com/id4_back.jpg', 'https://example.com/license4_front.jpg', 'https://example.com/license4_back.jpg', '079200004567', 'B1-456789012', 2, 1, '2024-12-05 15:30:00', '2024-12-07 12:00:00'),

(5, 5, 'https://example.com/id5_front.jpg', 'https://example.com/id5_back.jpg', 'https://example.com/license5_front.jpg', 'https://example.com/license5_back.jpg', '079200005678', 'B1-567890123', 3, 1, '2024-12-10 16:30:00', '2024-12-12 13:00:00'),

(6, 6, 'https://example.com/id6_front.jpg', 'https://example.com/id6_back.jpg', 'https://example.com/license6_front.jpg', 'https://example.com/license6_back.jpg', '079200006789', 'B1-678901234', NULL, 0, '2024-12-12 17:30:00', '2024-12-12 17:30:00'); -- Pending verification

-- ========================================
-- 8. EV BIKES TABLE
-- ========================================
INSERT INTO EVBikes (BikeID, BikeName, LicensePlate, BrandID, StationID, Color, FrontImg, BackImg, TimeRented, Description, BatteryCapacity, PricePerDay, Status, CreatedAt, UpdatedAt) VALUES
-- Station 1 bikes (Quận 1)
(1, 'VinFast Klara S', '59A-12345', 1, 1, 'Đỏ', 'https://example.com/bike1_front.jpg', 'https://example.com/bike1_back.jpg', 25, 'Xe điện cao cấp VinFast Klara S, pin lithium 60V', '60V 20Ah', 150000, 1, '2024-11-01 08:30:00', '2024-12-16 08:00:00'),

(2, 'Honda U-BE', '59B-23456', 2, 1, 'Trắng', 'https://example.com/bike2_front.jpg', 'https://example.com/bike2_back.jpg', 18, 'Xe điện Honda U-BE thiết kế hiện đại', '48V 26Ah', 120000, 1, '2024-11-01 08:30:00', '2024-12-16 08:00:00'),

(3, 'Yamaha EC-05', '59C-34567', 3, 1, 'Xanh dương', 'https://example.com/bike3_front.jpg', 'https://example.com/bike3_back.jpg', 32, 'Yamaha EC-05 xe điện thông minh', '50.4V 31.3Ah', 180000, 0, '2024-11-01 08:30:00', '2024-12-16 08:00:00'), -- Currently rented

(4, 'Pega Cap A', '59D-45678', 4, 1, 'Đen', 'https://example.com/bike4_front.jpg', 'https://example.com/bike4_back.jpg', 12, 'Pega Cap A xe điện kinh tế', '48V 20Ah', 100000, 1, '2024-11-01 08:30:00', '2024-12-16 08:00:00'),

-- Station 2 bikes (Quận 2) 
(5, 'Dibao Pansy', '59E-56789', 5, 2, 'Hồng', 'https://example.com/bike5_front.jpg', 'https://example.com/bike5_back.jpg', 8, 'Dibao Pansy thiết kế nữ tính', '48V 18Ah', 90000, 1, '2024-11-05 09:30:00', '2024-12-16 08:00:00'),

(6, 'Terra A4000i', '59F-67890', 6, 2, 'Xám', 'https://example.com/bike6_front.jpg', 'https://example.com/bike6_back.jpg', 15, 'Terra A4000i công nghệ Nhật Bản', '60V 22Ah', 140000, 1, '2024-11-05 09:30:00', '2024-12-16 08:00:00'),

(7, 'Gogoro S2', '59G-78901', 7, 2, 'Xanh lá', 'https://example.com/bike7_front.jpg', 'https://example.com/bike7_back.jpg', 28, 'Gogoro S2 pin có thể thay đổi', 'Gogoro Network', 200000, 0, '2024-11-05 09:30:00', '2024-12-16 08:00:00'), -- Currently rented

-- Station 3 bikes (Quận 3)
(8, 'NIU NGT', '59H-89012', 8, 3, 'Cam', 'https://example.com/bike8_front.jpg', 'https://example.com/bike8_back.jpg', 22, 'NIU NGT xe điện thể thao', '72V 35Ah', 220000, 1, '2024-11-10 10:30:00', '2024-12-16 08:00:00'),

(9, 'Yadea G5', '59I-90123', 9, 3, 'Tím', 'https://example.com/bike9_front.jpg', 'https://example.com/bike9_back.jpg', 11, 'Yadea G5 pin lithium cao cấp', '60V 32Ah', 160000, 1, '2024-11-10 10:30:00', '2024-12-16 08:00:00'),

(10, 'Giant Momentum', '59K-01234', 10, 3, 'Bạc', 'https://example.com/bike10_front.jpg', 'https://example.com/bike10_back.jpg', 5, 'Giant Momentum xe đạp điện', '36V 14Ah', 80000, 1, '2024-11-10 10:30:00', '2024-12-16 08:00:00'),

-- Station 4 bikes (Quận 7)
(11, 'VinFast Impes', '59L-12346', 1, 4, 'Vàng', 'https://example.com/bike11_front.jpg', 'https://example.com/bike11_back.jpg', 20, 'VinFast Impes thiết kế sport', '60V 28Ah', 170000, 1, '2024-11-15 11:30:00', '2024-12-16 08:00:00'),

(12, 'Honda VISION:e', '59M-23457', 2, 4, 'Xanh ngọc', 'https://example.com/bike12_front.jpg', 'https://example.com/bike12_back.jpg', 14, 'Honda VISION:e concept mới', '48V 24Ah', 130000, 0, '2024-11-15 11:30:00', '2024-12-16 08:00:00'), -- Currently rented

-- Station 5 bikes (Tân Bình)
(13, 'Yamaha Janus', '59N-34568', 3, 5, 'Nâu', 'https://example.com/bike13_front.jpg', 'https://example.com/bike13_back.jpg', 35, 'Yamaha Janus phiên bản điện', '48V 30Ah', 110000, 1, '2024-11-20 12:30:00', '2024-12-16 08:00:00'),

(14, 'Pega Newtech', '59O-45679', 4, 5, 'Đỏ đô', 'https://example.com/bike14_front.jpg', 'https://example.com/bike14_back.jpg', 9, 'Pega Newtech công nghệ mới', '60V 25Ah', 125000, 1, '2024-11-20 12:30:00', '2024-12-16 08:00:00'),

-- Station 6 bikes (Bình Thạnh)
(15, 'Dibao S', '59P-56780', 5, 6, 'Hồng phấn', 'https://example.com/bike15_front.jpg', 'https://example.com/bike15_back.jpg', 17, 'Dibao S thiết kế thanh lịch', '48V 22Ah', 95000, 1, '2024-11-25 13:30:00', '2024-12-16 08:00:00'),

-- Station 8 bikes (Gò Vấp)
(16, 'Terra Motors A4000', '59Q-67891', 6, 8, 'Đen nhám', 'https://example.com/bike16_front.jpg', 'https://example.com/bike16_back.jpg', 26, 'Terra Motors A4000 bền bỉ', '60V 20Ah', 135000, 1, '2024-12-05 15:30:00', '2024-12-16 08:00:00'),

(17, 'Gogoro 3', '59R-78902', 7, 8, 'Xanh mint', 'https://example.com/bike17_front.jpg', 'https://example.com/bike17_back.jpg', 13, 'Gogoro 3 thế hệ mới', 'Gogoro Network', 190000, 1, '2024-12-05 15:30:00', '2024-12-16 08:00:00');

-- ========================================
-- 9. RENTALS TABLE
-- ========================================
INSERT INTO Rentals (RentalID, BikeID, RenterID, StationID, AssignedStaff, InitialBattery, FinalBattery, InitBikeCondition, FinalBikeCondition, RentalDate, ReservedDate, ReturnDate, Deposit, Fee) VALUES
-- Completed Rentals
(1, 1, 1, 1, 1, 95.0, 45.0, 'Xe trong tình trạng tốt, không có vết xước', 'Xe trả về bình thường, pin còn 45%', '2024-12-10 08:00:00', '2024-12-09 15:00:00', '2024-12-10 18:00:00', 500000, 150000),

(2, 2, 2, 1, 1, 88.0, 32.0, 'Xe hoạt động bình thường', 'Xe được trả về đúng giờ, tình trạng tốt', '2024-12-11 09:00:00', '2024-12-10 16:00:00', '2024-12-11 17:00:00', 400000, 120000),

(3, 5, 3, 2, 2, 92.0, 28.0, 'Xe mới, tình trạng xuất sắc', 'Trả xe đúng hẹn, không có sự cố', '2024-12-12 07:30:00', '2024-12-11 14:00:00', '2024-12-12 19:30:00', 300000, 90000),

(4, 6, 1, 2, 2, 85.0, 52.0, 'Xe tốt, đã kiểm tra kỹ thuật', 'Xe trả về sớm, pin còn nhiều', '2024-12-13 10:00:00', '2024-12-12 17:00:00', '2024-12-13 15:00:00', 450000, 140000),

(5, 8, 4, 3, 3, 98.0, 25.0, 'Xe cao cấp, tình trạng hoàn hảo', 'Sử dụng hết pin, trả về đúng giờ', '2024-12-14 06:00:00', '2024-12-13 20:00:00', '2024-12-14 22:00:00', 600000, 220000),

-- Active Rentals (currently being rented)
(6, 3, 2, 1, 1, 90.0, 0.0, 'Xe hoạt động tốt, pin đầy', NULL, '2024-12-16 08:00:00', '2024-12-15 18:00:00', NULL, 550000, NULL),

(7, 7, 5, 2, 2, 100.0, 0.0, 'Xe mới, đầy đủ tính năng', NULL, '2024-12-16 09:30:00', '2024-12-15 19:30:00', NULL, 700000, NULL),

(8, 12, 3, 4, 4, 87.0, 0.0, 'Xe trong tình trạng tốt', NULL, '2024-12-16 11:00:00', '2024-12-16 08:00:00', NULL, 400000, NULL),

-- Future Reservations
(9, 9, 1, 3, 3, 0.0, 0.0, NULL, NULL, '2024-12-17 08:00:00', '2024-12-16 14:00:00', NULL, 500000, NULL),

(10, 11, 4, 4, 4, 0.0, 0.0, NULL, NULL, '2024-12-18 07:00:00', '2024-12-16 15:00:00', NULL, 450000, NULL);

-- ========================================
-- 10. PAYMENTS TABLE
-- ========================================
INSERT INTO Payments (PaymentID, RenterID, Amount, RentalID, PaymentMethod, PaymentType, Status, CreatedAt, UpdatedAt) VALUES
-- Completed Deposits
(1, 1, 500000.00, 1, 2, 1, 1, '2024-12-09 15:30:00', '2024-12-09 15:35:00'), -- VNPay Deposit - Completed
(2, 2, 400000.00, 2, 1, 1, 1, '2024-12-10 16:30:00', '2024-12-10 16:32:00'), -- Credit Card Deposit - Completed  
(3, 3, 300000.00, 3, 2, 1, 1, '2024-12-11 14:30:00', '2024-12-11 14:33:00'), -- VNPay Deposit - Completed
(4, 1, 450000.00, 4, 3, 1, 1, '2024-12-12 17:30:00', '2024-12-12 17:30:00'), -- Cash Deposit - Completed
(5, 4, 600000.00, 5, 2, 1, 1, '2024-12-13 20:30:00', '2024-12-13 20:35:00'), -- VNPay Deposit - Completed

-- Completed Rental Fees
(6, 1, 150000.00, 1, 2, 2, 1, '2024-12-10 18:15:00', '2024-12-10 18:20:00'), -- VNPay Fee - Completed
(7, 2, 120000.00, 2, 1, 2, 1, '2024-12-11 17:15:00', '2024-12-11 17:18:00'), -- Credit Card Fee - Completed
(8, 3, 90000.00, 3, 2, 2, 1, '2024-12-12 19:45:00', '2024-12-12 19:48:00'), -- VNPay Fee - Completed
(9, 1, 140000.00, 4, 3, 2, 1, '2024-12-13 15:15:00', '2024-12-13 15:15:00'), -- Cash Fee - Completed
(10, 4, 220000.00, 5, 2, 2, 1, '2024-12-14 22:15:00', '2024-12-14 22:20:00'), -- VNPay Fee - Completed

-- Pending Deposits for Active Rentals
(11, 2, 550000.00, 6, 2, 1, 0, '2024-12-15 18:30:00', '2024-12-15 18:30:00'), -- VNPay Deposit - Pending
(12, 5, 700000.00, 7, 1, 1, 0, '2024-12-15 19:45:00', '2024-12-15 19:45:00'), -- Credit Card Deposit - Pending
(13, 3, 400000.00, 8, 2, 1, 1, '2024-12-16 08:15:00', '2024-12-16 08:18:00'), -- VNPay Deposit - Completed

-- Future Reservation Deposits
(14, 1, 500000.00, 9, 2, 1, 0, '2024-12-16 14:15:00', '2024-12-16 14:15:00'), -- VNPay Deposit - Pending
(15, 4, 450000.00, 10, 1, 1, -1, '2024-12-16 15:15:00', '2024-12-16 15:20:00'), -- Credit Card Deposit - Failed

-- Some refunds
(16, 1, 350000.00, 1, 2, 3, 1, '2024-12-10 18:30:00', '2024-12-10 18:35:00'), -- VNPay Refund - Completed (partial deposit refund)
(17, 2, 280000.00, 2, 1, 3, 1, '2024-12-11 17:30:00', '2024-12-11 17:33:00'), -- Credit Card Refund - Completed
(18, 3, 210000.00, 3, 2, 3, 0, '2024-12-12 20:00:00', '2024-12-12 20:00:00'); -- VNPay Refund - Pending

-- ========================================
-- 11. FEEDBACKS TABLE (Optional)
-- ========================================
INSERT INTO Feedbacks (FeedbackID, RenterID, RentalID, Rating, Content, CreatedAt) VALUES
(1, 1, 1, 5, 'Xe rất tốt, pin trâu, dịch vụ tuyệt vời!', '2024-12-10 19:00:00'),
(2, 2, 2, 4, 'Xe chạy ổn định, nhưng nên có thêm điểm sạc', '2024-12-11 18:00:00'),
(3, 3, 3, 5, 'Dịch vụ chuyên nghiệp, xe mới, sẽ thuê lại', '2024-12-12 20:30:00'),
(4, 1, 4, 4, 'Xe Honda chất lượng, giá hợp lý', '2024-12-13 16:00:00'),
(5, 4, 5, 5, 'Xe NIU rất mạnh mẽ, phù hợp đi xa', '2024-12-14 23:00:00');

-- ========================================
-- SUMMARY STATISTICS
-- ========================================
-- This demo data includes:
-- - 3 Roles (Admin, Staff, Renter)
-- - 10 Brands (VinFast, Honda, Yamaha, etc.)
-- - 10 Accounts (1 Admin, 3 Staff, 6 Renters)
-- - 8 Stations (7 active, 1 inactive)
-- - 7 Station Staff assignments
-- - 6 Renters (5 verified, 1 pending)
-- - 6 ID Documents (5 verified, 1 pending)
-- - 17 EV Bikes across all stations
-- - 10 Rentals (5 completed, 3 active, 2 future)
-- - 18 Payments (various methods, types, and statuses)
-- - 5 Customer Feedbacks

-- ========================================
-- USEFUL QUERIES FOR TESTING
-- ========================================

-- Check active rentals
-- SELECT r.RentalID, b.BikeName, a.FullName as RenterName, s.Name as StationName, r.RentalDate
-- FROM Rentals r 
-- JOIN EVBikes b ON r.BikeID = b.BikeID
-- JOIN Renters rt ON r.RenterID = rt.RenterID  
-- JOIN Accounts a ON rt.AccountID = a.AccountID
-- JOIN Stations s ON r.StationID = s.StationID
-- WHERE r.ReturnDate IS NULL AND r.RentalDate <= GETDATE();

-- Check payment statistics  
-- SELECT PaymentMethod, PaymentType, Status, COUNT(*) as Count, SUM(Amount) as TotalAmount
-- FROM Payments
-- GROUP BY PaymentMethod, PaymentType, Status
-- ORDER BY PaymentMethod, PaymentType, Status;

-- Check station capacity utilization
-- SELECT s.Name, s.BikeCapacity, COUNT(b.BikeID) as TotalBikes, 
--        COUNT(CASE WHEN b.IsAvailable = 1 THEN 1 END) as AvailableBikes
-- FROM Stations s
-- LEFT JOIN EVBikes b ON s.StationID = b.StationID  
-- WHERE s.IsActive = 1
-- GROUP BY s.StationID, s.Name, s.BikeCapacity
-- ORDER BY s.Name;