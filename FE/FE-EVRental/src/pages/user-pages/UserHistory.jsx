import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Card, Badge, Empty, Statistic, Row, Col, Tabs, Tag, Spin } from "antd";
import {
  CarOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  LoadingOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { formatPrice, formatDate } from "../../utils/helpers";
import { getRentalsByAccountID, getRenterByAccountID } from "../../api/rentals";
import { fetchStationById } from "../../api/stations";
import { getToken } from "../../utils/auth";
import "../../styles/UserHistory.css";

export default function UserHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [renterInfo, setRenterInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate duration in days between two dates
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Ch?n Staff (roleID = 2) và Admin (roleID = 3)
    const userRoleId = user?.roleID || user?.RoleID;
    if (userRoleId === 2 || userRoleId === 3) {
      console.log('UserHistory: Access denied for Staff/Admin, redirecting...');
      if (userRoleId === 2) {
        navigate("/staff");
      } else {
        navigate("/admin");
      }
      return;
    }
    
    fetchUserRentals();
  }, [user, navigate]);

  const fetchUserRentals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      const accountID = user?.accountID || user?.AccountID;
      
      if (!accountID) {
        throw new Error('Không tìm th?y thông tin tài kho?n');
      }
      
      console.log('?? Fetching rentals for account:', accountID);
      
      // Fetch renter information and rentals from API
      const [renterData, rentals] = await Promise.all([
        getRenterByAccountID(accountID, token),
        getRentalsByAccountID(accountID, token)
      ]);
      
      console.log('? Renter info from API:', renterData);
      console.log('? Rentals from API:', rentals);
      
      setRenterInfo(renterData);
      
      // Log the first rental to see its structure
      if (rentals && rentals.length > 0) {
        console.log('?? First rental structure:', JSON.stringify(rentals[0], null, 2));
      }
      
      // Map API response to rental format
      const mappedRentals = await Promise.all(rentals.map(async (rental) => {
        console.log('?? Processing rental:', rental);
        
        // Extract bike data directly from rental response
        const bikeName = rental.bikeName || rental.BikeName || 'Xe di?n';
        const licensePlate = rental.licensePlate || rental.LicensePlate || '';
        
        // Get bike image from rental response, or use default
        const bikeImage = rental.bikeImage || rental.BikeImage || 
                         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=300&q=60';
        
        // Extract station IDs for fetching station names
        const pickupStationID = rental.pickupStationID || rental.PickupStationID;
        const returnStationID = rental.returnStationID || rental.ReturnStationID;
        
        // Fetch station names only if we have valid IDs
        let pickupStationName = 'Chua xác d?nh';
        let returnStationName = 'Chua xác d?nh';
        
        try {
          if (pickupStationID && typeof pickupStationID === 'number' && pickupStationID > 0) {
            console.log('?? Fetching pickup station for ID:', pickupStationID);
            const pickupStation = await fetchStationById(pickupStationID, token);
            if (pickupStation && !pickupStation.notFound) {
              pickupStationName = pickupStation.stationName || pickupStation.StationName || pickupStationName;
            }
          }
          
          if (returnStationID && typeof returnStationID === 'number' && returnStationID > 0) {
            console.log('?? Fetching return station for ID:', returnStationID);
            const returnStation = await fetchStationById(returnStationID, token);
            if (returnStation && !returnStation.notFound) {
              returnStationName = returnStation.stationName || returnStation.StationName || returnStationName;
            }
          }
        } catch (err) {
          console.warn('?? Failed to fetch station details:', err);
        }
        
        // Map status from API
        // 0 = Pending, 1 = Reserved, 2 = OnGoing, 3 = Cancelled, 4 = Completed
        let status = 'pending_payment';
        const rentalStatus = rental.status || rental.Status;
        
        if (rentalStatus === 0) {
          status = 'pending_payment'; // Pending
        } else if (rentalStatus === 1) {
          status = 'confirmed'; // Reserved
        } else if (rentalStatus === 2) {
          status = 'renting'; // OnGoing
        } else if (rentalStatus === 3) {
          status = 'cancelled'; // Cancelled
        } else if (rentalStatus === 4) {
          status = 'completed'; // Completed
        }
        
        return {
          rentalID: rental.rentalID || rental.RentalID,
          vehicleName: bikeName,
          vehicleImage: bikeImage,
          image: bikeImage,
          pickupDate: rental.handoverDate || rental.HandoverDate || "Chua nh?n xe",
          returnDate: rental.returnDate || rental.ReturnDate || "Chua tr? xe",
          pickupStation: rental.stationName,
          returnStation: rental.stationName,
          stationAddress: rental.stationAddress || rental.StationAddress || '',
          status: status,
          totalPrice: rental.deposit || 0,
          createdAt: rental.createdAt || rental.CreatedAt,
          startDate: rental.startDate || rental.StartDate,
          endDate: rental.endDate || rental.EndDate,
          fee: rental.fee || rental.Fee || 0,
          payment: {
            amount: rental.fee || rental.Fee || 0,
            method: rental.paymentMethod || rental.PaymentMethod || 0, // 1 = PayOS, 2 = Cash
            methodType: (rental.paymentMethod || rental.PaymentMethod) === 1 ? 'payos' : 
                       (rental.paymentMethod || rental.PaymentMethod) === 2 ? 'cash' : 'unknown'
          },
          // Additional fields from API
          licensePlate: licensePlate,
          phoneNumber: rental.phoneNumber || rental.PhoneNumber,
          email: rental.email || rental.Email,
          initialBattery: rental.initialBattery || rental.InitialBattery,
          finalBattery: rental.finalBattery || rental.FinalBattery,
          deposit: rental.deposit || rental.Deposit,
          assignedStaff: rental.assignedStaff || rental.AssignedStaff,
        };
      }));
      
      // Sort by creation date (most recent first)
      mappedRentals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setRentals(mappedRentals);
    } catch (err) {
      console.error('? Error fetching user rentals:', err);
      setError(err.message || 'Không th? t?i l?ch s? thuê xe');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          padding: "40px 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin
          size="large"
          indicator={<LoadingOutlined style={{ fontSize: 48, color: "#4db6ac" }} spin />}
          tip="Ðang t?i l?ch s? thuê xe..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          padding: "40px 20px",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <Card>
            <Empty
              description={
                <div>
                  <p style={{ color: "#ff4d4f", fontSize: "16px", marginBottom: "8px" }}>
                    {error}
                  </p>
                  <button
                    className="btn primary"
                    onClick={fetchUserRentals}
                    style={{
                      padding: "8px 24px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      marginTop: "16px",
                    }}
                  >
                    Th? l?i
                  </button>
                </div>
              }
            />
          </Card>
        </div>
      </div>
    );
  }

  const totalRentals = rentals.length;
  const totalSpent = renterInfo?.totalSpent || renterInfo?.TotalSpent || 0;
  const totalRental = renterInfo?.totalRental || renterInfo?.TotalRental || rentals.length;

  const getFilteredRentals = () => {
    if (activeTab === "all") return rentals;
    if (activeTab === "confirmed")
      return rentals.filter((r) => r.status === "confirmed" || r.status === "booked");
    if (activeTab === "renting")
      return rentals.filter((r) => r.status === "renting");
    if (activeTab === "completed")
      return rentals.filter((r) => r.status === "completed");
    return rentals;
  };

  const filteredRentals = getFilteredRentals();

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending_payment":
        return <Badge status="warning" text="Ch? thanh toán" />;
      case "booked":
        return <Badge status="processing" text="Ðã d?t xe" />;
      case "confirmed":
        return <Badge status="processing" text="Ðã xác nh?n" />;
      case "renting":
        return <Badge status="success" text="Ðang thuê xe" />;
      case "completed":
        return <Badge status="success" text="Hoàn thành" />;
      case "cancelled":
        return <Badge status="error" text="Ðã h?y" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending_payment":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      case "booked":
        return <CheckCircleOutlined style={{ color: "#1890ff" }} />;
      case "confirmed":
        return <SyncOutlined spin style={{ color: "#1890ff" }} />;
      case "renting":
        return <ThunderboltOutlined style={{ color: "#52c41a" }} />;
      case "completed":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "cancelled":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <ClockCircleOutlined style={{ color: "#d9d9d9" }} />;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#1a1a1a",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <HistoryOutlined style={{ color: "#4db6ac" }} /> L?ch s? thuê xe
          </h1>
          <p style={{ fontSize: "16px", color: "#666" }}>
            Qu?n lý và theo dõi các don thuê xe c?a b?n
          </p>
        </div>
        <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="T?ng don thuê"
                value={totalRentals}
                prefix={<ThunderboltOutlined style={{ color: "#4db6ac" }} />}
                valueStyle={{ color: "#4db6ac" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="T?ng s? xe dã thuê"
                value={totalRental}
                prefix={<ThunderboltOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="T?ng chi tiêu"
                value={formatPrice(totalSpent, "VNÐ")}
                prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a", fontSize: "20px" }}
              />
            </Card>
          </Col>
        </Row>
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: "all", label: `T?t c? (${rentals.length})` },
              {
                key: "confirmed",
                label: `Ðã d?t xe (${
                  rentals.filter((r) => r.status === "confirmed" || r.status === "booked").length
                })`,
              },
              {
                key: "renting",
                label: `Ðang thuê (${
                  rentals.filter((r) => r.status === "renting").length
                })`,
              },
              {
                key: "completed",
                label: `Hoàn thành (${
                  rentals.filter((r) => r.status === "completed").length
                })`,
              },
            ]}
          />
          {filteredRentals.length === 0 ? (
            <Empty
              description="Chua có don thuê xe nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <button
                className="btn primary"
                onClick={() => navigate("/vehicles")}
                style={{
                  backgroundColor: "#4db6ac",
                  borderColor: "#4db6ac",
                  padding: "8px 24px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Thuê xe ngay
              </button>
            </Empty>
          ) : (
            <div style={{ marginTop: "24px" }}>
              {filteredRentals.map((rental) => (
                <Card
                  key={rental.rentalId}
                  style={{
                    marginBottom: "16px",
                    borderLeft: "4px solid #4db6ac",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: 600,
                          color: "#1a1a1a",
                        }}
                      >
                        {getStatusIcon(rental.status)}
                        <span style={{ marginLeft: "8px" }}>
                          Mã don: {rental.rentalID}
                        </span>
                      </h3>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          color: "#666",
                          fontSize: "14px",
                        }}
                      >
                        <CalendarOutlined /> {formatDate(rental.createdAt)}
                      </p>
                    </div>
                    <div>{getStatusBadge(rental.status)}</div>
                  </div>
                  {/* Thông tin xe thuê */}
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      marginBottom: "20px",
                      padding: "16px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                    }}
                  >
                    {/* Hình ?nh xe */}
                    <div style={{ flexShrink: 0 }}>
                      <img
                        src={rental.vehicleImage || rental.image}
                        alt={rental.vehicleName}
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=300&q=60";
                        }}
                      />
                      {/* Bi?n s? xe */}
                      {rental.licensePlate && (
                        <div
                          style={{
                            marginTop: "8px",
                            padding: "6px 12px",
                            background: "linear-gradient(135deg, #4db6ac, #26a69a)",
                            borderRadius: "6px",
                            textAlign: "center",
                            boxShadow: "0 2px 6px rgba(77, 182, 172, 0.3)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              color: "rgba(255, 255, 255, 0.9)",
                              fontWeight: 600,
                              marginBottom: "2px",
                            }}
                          >
                            Bi?n s?
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              color: "white",
                              fontWeight: 700,
                              letterSpacing: "1px",
                            }}
                          >
                            {rental.licensePlate}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Thông tin chi ti?t */}
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          margin: "0 0 12px 0",
                          fontSize: "20px",
                          fontWeight: 600,
                          color: "#1a1a1a",
                        }}
                      >
                        <ThunderboltOutlined style={{ color: "#4db6ac", marginRight: "8px" }} />
                        {rental.vehicleName}
                      </h3>

                      {/* Grid thông tin */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "12px",
                        }}
                      >
                        {/* Ngày gi? nh?n xe */}
                        <div
                          style={{
                            background: "white",
                            padding: "12px",
                            borderRadius: "6px",
                            border: "1px solid #e8e8e8",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#999",
                              marginBottom: "4px",
                            }}
                          >
                            <CalendarOutlined /> Nh?n xe lúc
                          </div>
                          {rental.pickupDate && rental.pickupDate !== "Chua nh?n xe" ? (
                            <>
                              <div
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#1a1a1a",
                                }}
                              >
                                {new Date(rental.pickupDate).toLocaleDateString('vi-VN')}
                              </div>
                              <div style={{ fontSize: "13px", color: "#666" }}>
                                <ClockCircleOutlined /> {new Date(rental.pickupDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </>
                          ) : (
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#999",
                              }}
                            >
                              Chua nh?n xe
                            </div>
                          )}
                        </div>

                        {/* Ngày gi? tr? xe */}
                        <div
                          style={{
                            background: "white",
                            padding: "12px",
                            borderRadius: "6px",
                            border: "1px solid #e8e8e8",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#999",
                              marginBottom: "4px",
                            }}
                          >
                            <CalendarOutlined /> Tr? xe lúc
                          </div>
                          {rental.returnDate && rental.returnDate !== "Chua tr? xe" ? (
                            <>
                              <div
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#1a1a1a",
                                }}
                              >
                                {new Date(rental.returnDate).toLocaleDateString('vi-VN')}
                              </div>
                              <div style={{ fontSize: "13px", color: "#666" }}>
                                <ClockCircleOutlined /> {new Date(rental.returnDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </>
                          ) : (
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#999",
                              }}
                            >
                              Chua tr? xe
                            </div>
                          )}
                        </div>

                        {/* Ði?m thuê/tr? xe */}
                        <div
                          style={{
                            background: "white",
                            padding: "12px",
                            borderRadius: "6px",
                            border: "1px solid #e8e8e8",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#999",
                              marginBottom: "4px",
                            }}
                          >
                            <EnvironmentOutlined style={{ color: "#4db6ac" }} /> Tr?m thuê/tr?
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#1a1a1a",
                            }}
                          >
                            {rental.pickupStation || "Chua xác d?nh"}
                          </div>
                          {rental.stationAddress && (
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                marginTop: "6px",
                                lineHeight: "1.4",
                              }}
                            >
                              ?? {rental.stationAddress}
                            </div>
                          )}
                        </div>

                        {/* Th?i gian thuê */}
                        <div
                          style={{
                            background: "white",
                            padding: "12px",
                            borderRadius: "6px",
                            border: "1px solid #e8e8e8",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#999",
                              marginBottom: "4px",
                            }}
                          >
                            <ClockCircleOutlined style={{ color: "#1890ff" }} /> Th?i gian thuê
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "#1a1a1a",
                              lineHeight: "1.5",
                            }}
                          >
                            {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                            <div style={{ color: "#666", marginTop: "4px" }}>
                              ({calculateDuration(rental.startDate, rental.endDate)} ngày)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* S? ngày thuê */}
                      {rental.days && (
                        <div style={{ marginTop: "12px" }}>
                          <Tag
                            color="blue"
                            style={{ fontSize: "14px", padding: "4px 12px" }}
                          >
                            <ClockCircleOutlined /> Th?i gian thuê: {rental.days} ngày
                          </Tag>
                        </div>
                      )}
                    </div>

                    {/* Giá ti?n */}
                    
                  </div>
                  
                  {/* Thông tin bàn giao xe */}
                  {rental.status === "renting" && rental.handoverAt && (
                    <div
                      style={{
                        background: "#e6f7ff",
                        border: "1px solid #91d5ff",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <CheckCircleOutlined style={{ color: "#1890ff", fontSize: "18px" }} />
                        <strong style={{ color: "#1890ff" }}>Xe dã du?c bàn giao</strong>
                      </div>
                      <div style={{ fontSize: "13px", color: "#666", marginLeft: "26px" }}>
                        <CalendarOutlined /> Th?i gian nh?n xe: {formatDate(rental.handoverAt)}
                      </div>
                    </div>
                  )}
                  
                  {/* Thông tin hoàn thành */}
                  {rental.status === "completed" && rental.completedAt && (
                    <div
                      style={{
                        background: "#f6ffed",
                        border: "1px solid #b7eb8f",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "18px" }} />
                        <strong style={{ color: "#52c41a" }}>Ðã hoàn thành thuê xe</strong>
                      </div>
                      {rental.handoverAt && (
                        <div style={{ fontSize: "13px", color: "#666", marginLeft: "26px" }}>
                          <CalendarOutlined /> Nh?n xe: {formatDate(rental.handoverAt)}
                        </div>
                      )}
                      {rental.returnedAt && (
                        <div style={{ fontSize: "13px", color: "#666", marginLeft: "26px" }}>
                          <CalendarOutlined /> Tr? xe: {formatDate(rental.returnedAt)}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "16px",
                      borderTop: "1px solid #e8e8e8",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        alignItems: "center",
                      }}
                    >
                      <Tag color={rental.payment?.methodType === 'payos' ? "blue" : "green"}>
                        {rental.payment?.methodType === 'payos' 
                          ? "?? PayOS" 
                          : rental.payment?.methodType === 'cash'
                          ? "?? Ti?n m?t"
                          : "? Chua xác d?nh"}
                      </Tag>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "4px",
                        }}
                      >
                        Phí phát sinh:
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: 600,
                          color: "#ff4d4f",
                          marginBottom: "12px",
                        }}
                      >
                        {formatPrice(rental.fee|| 0, "VNÐ")}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          marginBottom: "4px",
                        }}
                      >
                        T?ng ti?n:
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#4db6ac",
                        }}
                      >
                        {formatPrice(rental.deposit || 0, "VNÐ")}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
