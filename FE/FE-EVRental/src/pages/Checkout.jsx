import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { formatPrice, formatDate } from "../utils/helpers";
import { saveBooking } from "../utils/bookingStorage";
import { createPayOSPayment, createCashPayment } from "../api/payment";
import { getBikeById } from "../api/bikes";
import { fetchStationById } from "../api/stations";
import "../styles/Checkout.css";
import { getToken } from "../utils/auth";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: Confirm, 2: Payment, 3: Success
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Check role access
  useEffect(() => {
    if (user) {
      const userRoleId = user?.roleID || user?.RoleID;
      if (userRoleId === 2 || userRoleId === 3) {
        console.log("Checkout: Access denied for Staff/Admin, redirecting...");
        if (userRoleId === 2) {
          navigate("/staff");
        } else {
          navigate("/admin");
        }
      }
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="checkout-container">
        <div className="auth-required">
          <h2>🔐 Yêu cầu đăng nhập</h2>
          <p>Bạn cần đăng nhập để tiến hành đặt xe</p>
          <button className="btn primary" onClick={() => navigate("/login")}>
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
          <h2>🛒 Giỏ hàng trống</h2>
          <p>Không có xe nào trong giỏ hàng để thanh toán</p>
          <button className="btn primary" onClick={() => navigate("/vehicles")}>
            Khám phá xe điện
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const total = subtotal;

  // Debug: Log cart items to see station data structure
  useEffect(() => {
    console.log("🛒 [CHECKOUT] Cart items:", cartItems);
    cartItems.forEach((item, index) => {
      console.log(`🛒 [CHECKOUT] Item ${index + 1}:`, {
        vehicleName: item.vehicle?.name,
        rentalDetails: item.rentalDetails,
        pickupStation: item.rentalDetails?.pickupStation,
        returnStation: item.rentalDetails?.returnStation,
      });
      console.log(
        `📍 [CHECKOUT] Pickup Station Full Object:`,
        item.rentalDetails?.pickupStation
      );
      console.log(
        `📍 [CHECKOUT] Return Station Full Object:`,
        item.rentalDetails?.returnStation
      );
    });
  }, [cartItems]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    console.log('=== 🚀 PAYMENT SUBMIT START ===');
    console.log('👤 User:', user);
    console.log('🔑 Token exists:', !!getToken());
    console.log('🛒 Cart items:', cartItems.length);
    console.log('💳 Payment method:', paymentMethod);

    try {
      // Validate data
      if (!user || !user.email) {
        console.error('❌ User validation failed:', { user, email: user?.email });
        throw new Error("Thông tin người dùng không hợp lệ. Vui lòng đăng xuất và đăng nhập lại.");
      }

      if (cartItems.length === 0) {
        throw new Error("Giỏ hàng trống");
      }

      // Generate booking confirmation
      const bookingId = `BK${Date.now()}`;

      // If PayOS payment, call API
      if (paymentMethod === "payos") {
        try {
          // Get JWT token from localStorage
          const token = getToken();
          console.log('🔑 [PAYOS] Token check:', {
            exists: !!token,
            length: token?.length || 0,
            startsWithBearer: token?.startsWith('Bearer ') || false,
            firstChars: token ? token.substring(0, 20) + '...' : 'null'
          });
          
          if (!token) {
            console.error('❌ [PAYOS] No token found! User must login first.');
            throw new Error("Vui lòng đăng nhập để thanh toán");
          }

          // Get accountID from user
          console.log("👤 [PAYOS] User object:", user);
          const accountID = user?.accountID || user?.AccountID || user?.id;
          console.log("📋 [PAYOS] AccountID extracted:", accountID);

          if (!accountID) {
            throw new Error("Không tìm thấy thông tin tài khoản");
          }

          // Process payment for each item in cart
          const paymentUrls = [];
          const savedBookings = [];
          let itemIndex = 1;

          for (const item of cartItems) {
            if (!item.vehicle || !item.rentalDetails) continue;

            try {
              console.log('🔍 [CHECKOUT] Processing item:', {
                vehicleId: item.vehicle.id,
                vehicleName: item.vehicle.name,
                pickupStation: item.rentalDetails.pickupStation,
              });

              // Get real BikeID from backend API
              let realBikeID = null;
              const mockBikeId = item.vehicle.id;

              // Try to extract number from mock ID (e.g., "v2" -> 2)
              const extractedId =
                typeof mockBikeId === "string"
                  ? parseInt(mockBikeId.replace(/\D/g, ""))
                  : mockBikeId;

              console.log('🔍 [CHECKOUT] Bike ID extraction:', {
                mockBikeId,
                extractedId,
                isValid: !isNaN(extractedId) && extractedId > 0
              });

              if (!isNaN(extractedId) && extractedId > 0) {
                try {
                  const bikeData = await getBikeById(extractedId, token);
                  realBikeID = bikeData.bikeID; // Get BikeID from database
                  
                  if (bikeData.notFound) {
                    console.warn(`⚠️ Bike ID ${extractedId} not in database, using as-is for rental`);
                  } else {
                    console.log(`✅ Found bike in database: BikeID = ${realBikeID}`);
                  }
                } catch (error) {
                  console.warn(`⚠️ Error fetching bike ${extractedId}:`, error.message);
                  realBikeID = extractedId; // Fallback to extracted ID
                }
              } else {
                throw new Error(`Cannot extract bike ID from vehicle data. Vehicle ID: ${mockBikeId}`);
              }

              // Get real StationID from backend API
              let realStationID = null;
              const mockStationId =
                item.rentalDetails.pickupStation?.id ||
                item.rentalDetails.pickupStation?.stationID;

              // Try to extract number from mock ID (e.g., "s1" -> 1)
              const extractedStationId =
                typeof mockStationId === "string"
                  ? parseInt(mockStationId.replace(/\D/g, ""))
                  : mockStationId;

              console.log('🔍 [CHECKOUT] Station ID extraction:', {
                mockStationId,
                extractedStationId,
                isValid: !isNaN(extractedStationId) && extractedStationId > 0
              });

              if (!isNaN(extractedStationId) && extractedStationId > 0) {
                try {
                  const stationData = await fetchStationById(
                    extractedStationId,
                    token
                  );
                  realStationID = stationData.stationID; // Get StationID from database
                  
                  if (stationData.notFound) {
                    console.warn(`⚠️ Station ID ${extractedStationId} not in database, using as-is for rental`);
                  } else {
                    console.log(`✅ Found station in database: StationID = ${realStationID}`);
                  }
                } catch (error) {
                  console.warn(`⚠️ Error fetching station ${extractedStationId}:`, error.message);
                  realStationID = extractedStationId; // Fallback to extracted ID
                }
              } else {
                throw new Error(
                  `Cannot extract station ID from rental details. Station ID: ${mockStationId}`
                );
              }

              // Prepare payment data with REAL IDs from database
              const paymentData = {
                accountID: accountID,
                amount: item.totalPrice || 0,
                bikeID: realBikeID,
                stationID: realStationID,
                startTime: item.rentalDetails.pickupDate,
                endTime: item.rentalDetails.returnDate,
              };

              console.log(
                "💳 Creating payment with database IDs:",
                paymentData
              );
              console.log("🔗 API URL:", import.meta.env.VITE_API_BASE_URL);

              console.log('📞 [PAYOS] === CALLING createPayOSPayment API ===');
              console.log('📞 [PAYOS] Function: createPayOSPayment');
              console.log('📞 [PAYOS] Params:', { paymentData, tokenExists: !!token });

              // Call backend API to create payment
              const paymentResponse = await createPayOSPayment(
                paymentData,
                token
              );

              console.log("✅ [PAYOS] === API RESPONSE RECEIVED ===");
              console.log("✅ [PAYOS] Payment response received:", paymentResponse);

              if (paymentResponse && paymentResponse.paymentUrl) {
                paymentUrls.push(paymentResponse.paymentUrl);

                // Save booking data before redirecting
                const itemBookingId = `${bookingId}-${itemIndex}`;
                const pickupStation = item.rentalDetails.pickupStation;
                const returnStation =
                  item.rentalDetails.returnStation || pickupStation;

                const bookingData = {
                  userId: user.email,
                  userEmail: user.email,
                  userName: user.fullName || user.name || user.email,
                  userPhone: user.phone || user.phoneNumber || "Chưa cập nhật",
                  vehicleName: item.vehicle.name,
                  vehicleId: item.vehicle.id,
                  licensePlate:
                    item.vehicle.licensePlate ||
                    `59${String.fromCharCode(
                      65 + Math.floor(Math.random() * 26)
                    )}-${Math.floor(10000 + Math.random() * 90000)}`,
                  vehicleImage: item.vehicle.image,
                  pickupDate: item.rentalDetails.pickupDate,
                  returnDate: item.rentalDetails.returnDate,
                  pickupTime: item.rentalDetails.pickupTime || "09:00",
                  returnTime: item.rentalDetails.returnTime || "18:00",
                  pickupStation:
                    typeof pickupStation === "object"
                      ? pickupStation.name
                      : pickupStation || "Chưa chọn",
                  pickupStationId:
                    typeof pickupStation === "object" ? pickupStation.id : null,
                  pickupStationAddress:
                    typeof pickupStation === "object"
                      ? pickupStation.address
                      : null,
                  returnStation:
                    typeof returnStation === "object"
                      ? returnStation.name
                      : returnStation || "Chưa chọn",
                  returnStationId:
                    typeof returnStation === "object" ? returnStation.id : null,
                  returnStationAddress:
                    typeof returnStation === "object"
                      ? returnStation.address
                      : null,
                  days: item.rentalDetails.days || 1,
                  totalPrice: item.totalPrice || 0,
                  additionalServices:
                    item.rentalDetails.additionalServices || {},
                  paymentMethod: "payos",
                  paymentStatus: "pending",
                  battery: "100%",
                  lastCheck: new Date().toISOString(),
                };

                const savedBooking = saveBooking(bookingData, itemBookingId);
                savedBookings.push(savedBooking);
                itemIndex++;
              } else {
                throw new Error("Không nhận được link thanh toán từ PayOS");
              }
            } catch (itemError) {
              console.error(`Error processing item ${itemIndex}:`, itemError);
              throw new Error(
                `Lỗi xử lý xe ${item.vehicle?.name || "không xác định"}: ${
                  itemError.message
                }`
              );
            }
          }

          // Redirect to first payment URL (for now, handle single item)
          if (paymentUrls.length > 0) {
            window.location.href = paymentUrls[0];
            return;
          } else {
            throw new Error("Không có link thanh toán nào được tạo");
          }
        } catch (payosError) {
          console.error("PayOS Error:", payosError);
          throw new Error(
            payosError.message ||
              "Không thể kết nối với cổng thanh toán PayOS. Vui lòng thử lại sau."
          );
        }
      }

      // Cash payment - API call flow
      try {
        console.log('💵 [CASH PAYMENT] Starting cash payment flow...');
        
        // Get JWT token
        const token = getToken();
        console.log('🔑 [CASH] Token check:', {
          exists: !!token,
          length: token?.length || 0,
          startsWithBearer: token?.startsWith('Bearer ') || false,
          firstChars: token ? token.substring(0, 20) + '...' : 'null'
        });
        
        if (!token) {
          console.error('❌ [CASH] No token found! User must login first.');
          throw new Error('Vui lòng đăng nhập để thanh toán');
        }

        // Get accountID from user
        console.log('👤 [CASH] User object:', user);
        console.log('👤 [CASH] User properties:', {
          accountID: user?.accountID,
          AccountID: user?.AccountID,
          id: user?.id,
        });
        const accountID = user?.accountID || user?.AccountID || user?.id;
        console.log('📋 [CASH] Final AccountID extracted:', accountID);
        if (!accountID) {
          throw new Error('Không tìm thấy thông tin tài khoản');
        }

        // Generate unique order code (same format as PayOS)
        const orderCode = parseInt(Date.now().toString().slice(-6));
        const savedBookings = [];
        let itemIndex = 1;
        
        for (const item of cartItems) {
          if (!item.vehicle || !item.rentalDetails) {
            continue;
          }

          try {
            console.log('🔍 [CASH] Processing item:', {
              vehicleId: item.vehicle.id,
              vehicleName: item.vehicle.name,
              pickupStation: item.rentalDetails.pickupStation,
            });

            // Get real BikeID from backend API
            let realBikeID = null;
            const mockBikeId = item.vehicle.id;
            
            const extractedId = typeof mockBikeId === 'string' 
              ? parseInt(mockBikeId.replace(/\D/g, '')) 
              : mockBikeId;
            
            console.log('🔍 [CASH] Bike ID extraction:', {
              mockBikeId,
              extractedId,
              isValid: !isNaN(extractedId) && extractedId > 0
            });

            if (!isNaN(extractedId) && extractedId > 0) {
              try {
                const bikeData = await getBikeById(extractedId, token);
                realBikeID = bikeData.bikeID;
                
                if (bikeData.notFound) {
                  console.warn(`⚠️ [CASH] Bike ID ${extractedId} not in database, using as-is for rental`);
                } else {
                  console.log(`✅ [CASH] Found bike in database: BikeID = ${realBikeID}`);
                }
              } catch (error) {
                console.warn(`⚠️ [CASH] Error fetching bike ${extractedId}:`, error.message);
                realBikeID = extractedId;
              }
            } else {
              throw new Error(`Cannot extract bike ID from vehicle data. Vehicle ID: ${mockBikeId}`);
            }

            // Get real StationID from backend API
            let realStationID = null;
            const mockStationId = item.rentalDetails.pickupStation?.id || 
                                 item.rentalDetails.pickupStation?.stationID;
            
            const extractedStationId = typeof mockStationId === 'string'
              ? parseInt(mockStationId.replace(/\D/g, ''))
              : mockStationId;
            
            console.log('🔍 [CASH] Station ID extraction:', {
              mockStationId,
              extractedStationId,
              isValid: !isNaN(extractedStationId) && extractedStationId > 0
            });

            if (!isNaN(extractedStationId) && extractedStationId > 0) {
              try {
                const stationData = await fetchStationById(extractedStationId, token);
                realStationID = stationData.stationID;
                
                if (stationData.notFound) {
                  console.warn(`⚠️ [CASH] Station ID ${extractedStationId} not in database, using as-is for rental`);
                } else {
                  console.log(`✅ [CASH] Found station in database: StationID = ${realStationID}`);
                }
              } catch (error) {
                console.warn(`⚠️ [CASH] Error fetching station ${extractedStationId}:`, error.message);
                realStationID = extractedStationId;
              }
            } else {
              throw new Error(`Cannot extract station ID from rental details. Station ID: ${mockStationId}`);
            }

            // Prepare payment data
            const paymentData = {
              accountID: accountID,
              amount: item.totalPrice || 0,
              bikeID: realBikeID,
              stationID: realStationID,
              startTime: item.rentalDetails.pickupDate,
              endTime: item.rentalDetails.returnDate
            };

            console.log('💵 [CASH] Creating cash payment with data:', paymentData);
            console.log('💵 [CASH] ⚠️ QUAN TRỌNG - Kiểm tra database:');
            console.log('   → Bảng Accounts: Có AccountID =', accountID, '?');
            console.log('   → Bảng Renters: Có RenterID với AccountID =', accountID, '?');
            console.log('   → Nếu chưa có, hãy INSERT INTO Renters với AccountID này!');

            console.log('📞 [CASH] === CALLING createCashPayment API ===');
            console.log('📞 [CASH] Function: createCashPayment');
            console.log('📞 [CASH] Params:', { paymentData, tokenExists: !!token });
            
            // Call backend API to create cash payment
            const paymentResponse = await createCashPayment(paymentData, token);
            
            console.log('✅ [CASH] === API RESPONSE RECEIVED ===');
            console.log('✅ [CASH] Payment response:', paymentResponse);
            console.log('✅ [CASH] Rental created with status = 0 (Pending) in backend');

            // Save booking data to localStorage for BookingSuccess page
            const itemBookingId = `${bookingId}-${itemIndex}`;
            const pickupStation = item.rentalDetails.pickupStation;
            const returnStation = item.rentalDetails.returnStation || pickupStation;

            const bookingData = {
              orderId: orderCode, // Same format as PayOS
              userId: user.email,
              userEmail: user.email,
              userName: user.fullName || user.name || user.email,
              userPhone: user.phone || user.phoneNumber || 'Chưa cập nhật',
              vehicleName: item.vehicle.name,
              vehicleId: item.vehicle.id,
              bikeID: realBikeID,
              licensePlate: paymentResponse.licensePlate || 'Đang cập nhật',
              vehicleImage: item.vehicle.image,
              pickupDate: item.rentalDetails.pickupDate,
              returnDate: item.rentalDetails.returnDate,
              pickupTime: item.rentalDetails.pickupTime || '09:00',
              returnTime: item.rentalDetails.returnTime || '18:00',
              pickupStation: typeof pickupStation === 'object' ? pickupStation.name : (pickupStation || 'Chưa chọn'),
              pickupStationId: typeof pickupStation === 'object' ? pickupStation.id : null,
              pickupStationAddress: typeof pickupStation === 'object' ? pickupStation.address : null,
              stationID: realStationID,
              returnStation: typeof returnStation === 'object' ? returnStation.name : (returnStation || 'Chưa chọn'),
              returnStationId: typeof returnStation === 'object' ? returnStation.id : null,
              returnStationAddress: typeof returnStation === 'object' ? returnStation.address : null,
              days: item.rentalDetails.days || 1,
              totalPrice: item.totalPrice || 0,
              additionalServices: item.rentalDetails.additionalServices || {},
              paymentMethod: 'cash',
              paymentStatus: 'pending',
              rentalID: paymentResponse.rentalID || null,
              paymentID: paymentResponse.paymentID || null,
            };

            const savedBooking = saveBooking(bookingData, itemBookingId);
            savedBookings.push(savedBooking);
            itemIndex++;
          } catch (itemError) {
            console.error(`❌ [CASH] Error processing item ${itemIndex}:`, itemError);
            throw new Error(`Lỗi xử lý xe ${item.vehicle?.name || 'không xác định'}: ${itemError.message}`);
          }
        }

        if (savedBookings.length === 0) {
          throw new Error('Không có booking nào được lưu thành công');
        }

        // Clear cart after successful payment
        clearCart();
        
        // Redirect to booking success page
        console.log('✅ [CASH] Redirecting to booking success with orderId:', orderCode);
        navigate(`/booking-success/${orderCode}`);
      } catch (cashError) {
        console.error('💵 [CASH] Cash Payment Error:', cashError);
        throw new Error(cashError.message || 'Không thể tạo đơn đặt xe. Vui lòng thử lại sau.');
      }
    } catch (error) {
      alert(
        `❌ Lỗi: ${
          error.message ||
          "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại!"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPaymentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>💳 Thanh Toán Đặt Xe</h1>
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? "active" : ""}`}>
            <span>1</span> Xác nhận
          </div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            <span>2</span> Thanh toán
          </div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>
            <span>3</span> Hoàn thành
          </div>
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          {step === 1 && (
            <div className="confirmation-step">
              <h3>📋 Xác Nhận Thông Tin Đặt Xe</h3>

              <div className="booking-summary">
                {cartItems.map((item) => (
                  <div key={item.id} className="booking-item">
                    <div className="item-image">
                      <img src={item.vehicle.image} alt={item.vehicle.name} />
                    </div>

                    <div className="item-details">
                      <h4>{item.vehicle.name}</h4>
                      <p className="rental-period">
                        📅 {formatDate(item.rentalDetails.pickupDate)} -{" "}
                        {formatDate(item.rentalDetails.returnDate)}
                      </p>
                      <p className="rental-duration">
                        ⏱️ {item.rentalDetails.days} ngày thuê
                      </p>
                      <p className="pickup-location">
                        📍 Nhận xe/trả tại:{" "}
                        {(() => {
                          const station = item.rentalDetails?.pickupStation;
                          if (!station) return "Chưa chọn điểm nhận";
                          if (typeof station === "object" && station.name) {
                            return `${station.name}${
                              station.address ? ` - ${station.address}` : ""
                            }`;
                          }
                          if (typeof station === "string") return station;
                          return "Chưa chọn điểm nhận";
                        })()}
                      </p>

                      {/* Additional Services */}
                      {Object.entries(
                        item.rentalDetails.additionalServices || {}
                      ).filter(([_, selected]) => selected).length > 0 && (
                        <div className="additional-services">
                          <p>
                            <strong>Dịch vụ bổ sung:</strong>
                          </p>
                          <ul>
                            {Object.entries(
                              item.rentalDetails.additionalServices
                            )
                              .filter(([_, selected]) => selected)
                              .map(([service]) => (
                                <li key={service}>
                                  {service === "insurance" &&
                                    "🛡️ Bảo hiểm mở rộng"}
                                  {service === "gps" && "🗺️ Thiết bị GPS"}
                                  {service === "childSeat" && "👶 Ghế trẻ em"}
                                  {service === "wifi" && "📶 WiFi di động"}
                                  {service === "extraDriver" &&
                                    "👤 Thêm lái xe phụ"}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="item-price">
                      <div className="price-amount">
                        {formatPrice(item.totalPrice, "VNĐ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="confirmation-actions">
                <button
                  className="btn secondary"
                  onClick={() => navigate("/cart")}
                >
                  ← Quay lại giỏ hàng
                </button>
                <button className="btn primary" onClick={() => setStep(2)}>
                  Tiếp tục thanh toán →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="payment-step">
              <h3>💳 Phương Thức Thanh Toán</h3>

              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMainMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <span className="payment-icon">�</span>
                    <span>Thanh toán tại điểm nhận xe</span>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMainMethod"
                    value="payos"
                    checked={paymentMethod === "payos"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <span className="payment-icon">💳</span>
                    <span>Thanh toán Online qua PayOS</span>
                  </div>
                </label>
              </div>

              {/* Removed old online payment methods - now using PayOS only */}
              {paymentMethod === "online_disabled" && (
                <div className="online-payment-methods">
                  <h4 style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
                    Chọn phương thức thanh toán online:
                  </h4>

                  <div className="payment-methods">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="onlinePaymentMethod"
                        value="credit_card"
                        checked={onlinePaymentMethod === "credit_card"}
                        onChange={(e) => setOnlinePaymentMethod(e.target.value)}
                      />
                      <div className="payment-info">
                        <span className="payment-icon">�</span>
                        <span>Thẻ tín dụng/Ghi nợ</span>
                      </div>
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="onlinePaymentMethod"
                        value="bank_transfer"
                        checked={onlinePaymentMethod === "bank_transfer"}
                        onChange={(e) => setOnlinePaymentMethod(e.target.value)}
                      />
                      <div className="payment-info">
                        <span className="payment-icon">🏦</span>
                        <span>Chuyển khoản ngân hàng</span>
                      </div>
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="onlinePaymentMethod"
                        value="e_wallet"
                        checked={onlinePaymentMethod === "e_wallet"}
                        onChange={(e) => setOnlinePaymentMethod(e.target.value)}
                      />
                      <div className="payment-info">
                        <span className="payment-icon">�</span>
                        <span>Ví điện tử (Momo, ZaloPay)</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {paymentMethod === "online_disabled" &&
                onlinePaymentMethod === "credit_card" && (
                  <form onSubmit={handlePaymentSubmit} className="payment-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Số thẻ *</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={(e) =>
                            handleInputChange("cardNumber", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Tên chủ thẻ *</label>
                        <input
                          type="text"
                          placeholder="NGUYEN VAN A"
                          value={paymentData.cardName}
                          onChange={(e) =>
                            handleInputChange("cardName", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Ngày hết hạn *</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentData.expiryDate}
                          onChange={(e) =>
                            handleInputChange("expiryDate", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>CVV *</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) =>
                            handleInputChange("cvv", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="payment-actions">
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => setStep(1)}
                      >
                        ← Quay lại
                      </button>
                      <button
                        type="submit"
                        className="btn primary"
                        disabled={isProcessing}
                      >
                        {isProcessing
                          ? "🔄 Đang xử lý..."
                          : `💳 Thanh toán ${formatPrice(total, "VNĐ")}`}
                      </button>
                    </div>
                  </form>
                )}

              {paymentMethod === "online_disabled" &&
                onlinePaymentMethod !== "credit_card" && (
                  <div className="alternative-payment">
                    <p>
                      Phương thức thanh toán này sẽ được hỗ trợ trong phiên bản
                      tiếp theo.
                    </p>
                    <div className="payment-actions">
                      <button
                        className="btn secondary"
                        onClick={() => setStep(1)}
                      >
                        ← Quay lại
                      </button>
                      <button
                        className="btn primary"
                        onClick={() => setOnlinePaymentMethod("credit_card")}
                      >
                        Chọn thẻ tín dụng
                      </button>
                    </div>
                  </div>
                )}

              {/* PayOS Payment */}
              {paymentMethod === "payos" && (
                <div className="payos-payment-section">
                  <div
                    className="payos-info"
                    style={{
                      background:
                        "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                      padding: "2rem",
                      borderRadius: "12px",
                      marginTop: "1.5rem",
                      border: "2px solid #0ea5e9",
                    }}
                  >
                    <h4
                      style={{
                        color: "#0369a1",
                        marginBottom: "1rem",
                        fontSize: "1.3rem",
                      }}
                    >
                      💳 Thanh toán qua PayOS
                    </h4>
                    <p style={{ color: "#0c4a6e", marginBottom: "1rem" }}>
                      Bạn sẽ được chuyển hướng đến trang thanh toán PayOS để
                      hoàn tất giao dịch.
                    </p>
                    <ul
                      style={{
                        color: "#0c4a6e",
                        paddingLeft: "1.5rem",
                        lineHeight: "1.8",
                      }}
                    >
                      <li>✓ Hỗ trợ thanh toán qua QR Code</li>
                      <li>✓ Chuyển khoản ngân hàng</li>
                      <li>✓ Ví điện tử (Momo, ZaloPay, VNPay)</li>
                      <li>✓ Bảo mật cao với mã hóa SSL</li>
                    </ul>
                  </div>

                  <div className="payment-actions">
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => setStep(1)}
                    >
                      ← Quay lại
                    </button>
                    <button
                      type="button"
                      className="btn primary"
                      onClick={handlePaymentSubmit}
                      disabled={isProcessing}
                    >
                      {isProcessing
                        ? "🔄 Đang xử lý..."
                        : `💳 Thanh toán ${formatPrice(total, "VNĐ")}`}
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="cash-payment-info">
                  <div className="info-box">
                    <h4>💵 Hướng dẫn thanh toán tại điểm</h4>
                    <ul>
                      <li>
                        ✅ Bạn sẽ thanh toán trực tiếp khi nhận xe tại điểm
                      </li>
                      <li>✅ Vui lòng mang theo CMND/CCCD và bằng lái xe</li>
                      <li>
                        ✅ Số tiền cần thanh toán:{" "}
                        <strong>{formatPrice(total, "VNĐ")}</strong>
                      </li>
                      <li>✅ Nhân viên sẽ xác nhận và giao xe cho bạn</li>
                    </ul>
                    <div className="note-box">
                      <p>
                        <strong>⚠️ Lưu ý:</strong>
                      </p>
                      <p>• Vui lòng đến đúng giờ đã đặt</p>
                      <p>• Chuẩn bị đầy đủ giấy tờ cần thiết</p>
                      <p>
                        • Liên hệ hotline nếu cần hỗ trợ:{" "}
                        <strong>1900-xxxx</strong>
                      </p>
                    </div>
                  </div>
                  <div className="payment-actions">
                    <button
                      className="btn secondary"
                      onClick={() => setStep(1)}
                    >
                      ← Quay lại
                    </button>
                    <button
                      className="btn primary"
                      onClick={handlePaymentSubmit}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "🔄 Đang xử lý..." : `✅ Xác nhận đặt xe`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="checkout-sidebar">
          <div className="order-summary">
            <h3>💰 Tóm Tắt Đơn Hàng</h3>

            <div className="summary-details">
              <div className="summary-row">
                <span>Số lượng xe:</span>
                <span>{cartItems.length} xe</span>
              </div>

              <div className="summary-row">
                <span>Tổng tiền thuê:</span>
                <span>{formatPrice(subtotal, "VNĐ")}</span>
              </div>

              <div className="summary-row total">
                <span>Tổng thanh toán:</span>
                <span>{formatPrice(total, "VNĐ")}</span>
              </div>
            </div>

            <div className="security-info">
              <h4>🔒 Thanh toán an toàn</h4>
              <ul>
                <li>✅ Mã hóa SSL 256-bit</li>
                <li>✅ Không lưu trữ thông tin thẻ</li>
                <li>✅ Bảo vệ thông tin cá nhân</li>
                <li>✅ Hoàn tiền 100% nếu hủy trước 24h</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
