import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card, Badge, Empty, Statistic, Row, Col, Tabs, Tag } from "antd";
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
} from "@ant-design/icons";
import { formatPrice, formatDate } from "../utils/helpers";
import "../styles/UserHistory.css";

export default function UserHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Chặn Staff (roleID = 2) và Admin (roleID = 3)
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
    
    const allBookings = JSON.parse(localStorage.getItem("ev_rental_bookings") || "[]");
    const userEmail = user.email;
    
    const userBookings = allBookings.filter(
      (booking) => booking.userId === userEmail || booking.userEmail === userEmail
    );
    
    userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setBookings(userBookings);
  }, [user, navigate]);

  if (!user) return null;

  const totalBookings = bookings.length;
  const totalSpent = bookings.reduce(
    (sum, booking) => sum + (booking.payment?.amount || 0),
    0
  );
  const totalVehicles = bookings.reduce(
    (sum, booking) => sum + (booking.items?.length || 0),
    0
  );

  const getFilteredBookings = () => {
    if (activeTab === "all") return bookings;
    if (activeTab === "confirmed")
      return bookings.filter((b) => b.status === "confirmed" || b.status === "booked");
    if (activeTab === "renting")
      return bookings.filter((b) => b.status === "renting");
    if (activeTab === "completed")
      return bookings.filter((b) => b.status === "completed");
    return bookings;
  };

  const filteredBookings = getFilteredBookings();

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending_payment":
        return <Badge status="warning" text="Chờ thanh toán" />;
      case "booked":
        return <Badge status="processing" text="Đã đặt xe" />;
      case "confirmed":
        return <Badge status="processing" text="Đã xác nhận" />;
      case "renting":
        return <Badge status="success" text="Đang thuê xe" />;
      case "completed":
        return <Badge status="success" text="Hoàn thành" />;
      case "cancelled":
        return <Badge status="error" text="Đã hủy" />;
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
        return <CarOutlined style={{ color: "#52c41a" }} />;
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
            <HistoryOutlined style={{ color: "#4db6ac" }} /> Lịch sử thuê xe
          </h1>
          <p style={{ fontSize: "16px", color: "#666" }}>
            Quản lý và theo dõi các đơn thuê xe của bạn
          </p>
        </div>
        <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng đơn thuê"
                value={totalBookings}
                prefix={<CarOutlined style={{ color: "#4db6ac" }} />}
                valueStyle={{ color: "#4db6ac" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng số xe đã thuê"
                value={totalVehicles}
                prefix={<CarOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng chi tiêu"
                value={formatPrice(totalSpent, "VNĐ")}
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
              { key: "all", label: `Tất cả (${bookings.length})` },
              {
                key: "confirmed",
                label: `Đã đặt xe (${
                  bookings.filter((b) => b.status === "confirmed" || b.status === "booked").length
                })`,
              },
              {
                key: "renting",
                label: `Đang thuê (${
                  bookings.filter((b) => b.status === "renting").length
                })`,
              },
              {
                key: "completed",
                label: `Hoàn thành (${
                  bookings.filter((b) => b.status === "completed").length
                })`,
              },
            ]}
          />
          {filteredBookings.length === 0 ? (
            <Empty
              description="Chưa có đơn thuê xe nào"
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
              {filteredBookings.map((booking) => (
                <Card
                  key={booking.bookingId}
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
                        {getStatusIcon(booking.status)}
                        <span style={{ marginLeft: "8px" }}>
                          Mã đơn: {booking.bookingId}
                        </span>
                      </h3>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          color: "#666",
                          fontSize: "14px",
                        }}
                      >
                        <CalendarOutlined /> {formatDate(booking.createdAt)}
                      </p>
                    </div>
                    <div>{getStatusBadge(booking.status)}</div>
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
                    {/* Hình ảnh xe */}
                    <div style={{ flexShrink: 0 }}>
                      <img
                        src={booking.vehicleImage || booking.image}
                        alt={booking.vehicleName}
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
                    </div>

                    {/* Thông tin chi tiết */}
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          margin: "0 0 12px 0",
                          fontSize: "20px",
                          fontWeight: 600,
                          color: "#1a1a1a",
                        }}
                      >
                        <CarOutlined style={{ color: "#4db6ac", marginRight: "8px" }} />
                        {booking.vehicleName}
                      </h3>

                      {/* Grid thông tin */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "12px",
                        }}
                      >
                        {/* Ngày giờ nhận xe */}
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
                            <CalendarOutlined /> Nhận xe
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#1a1a1a",
                            }}
                          >
                            {formatDate(booking.pickupDate)}
                          </div>
                          <div style={{ fontSize: "13px", color: "#666" }}>
                            <ClockCircleOutlined /> {booking.pickupTime || "09:00"}
                          </div>
                        </div>

                        {/* Ngày giờ trả xe */}
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
                            <CalendarOutlined /> Trả xe
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#1a1a1a",
                            }}
                          >
                            {formatDate(booking.returnDate)}
                          </div>
                          <div style={{ fontSize: "13px", color: "#666" }}>
                            <ClockCircleOutlined /> {booking.returnTime || "18:00"}
                          </div>
                        </div>

                        {/* Điểm nhận xe */}
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
                            <EnvironmentOutlined style={{ color: "#52c41a" }} /> Điểm nhận
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#1a1a1a",
                            }}
                          >
                            {booking.pickupStation || "Chưa xác định"}
                          </div>
                        </div>

                        {/* Điểm trả xe */}
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
                            <EnvironmentOutlined style={{ color: "#1890ff" }} /> Điểm trả
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#1a1a1a",
                            }}
                          >
                            {booking.returnStation || booking.pickupStation || "Chưa xác định"}
                          </div>
                        </div>
                      </div>

                      {/* Số ngày thuê */}
                      {booking.days && (
                        <div style={{ marginTop: "12px" }}>
                          <Tag
                            color="blue"
                            style={{ fontSize: "14px", padding: "4px 12px" }}
                          >
                            <ClockCircleOutlined /> Thời gian thuê: {booking.days} ngày
                          </Tag>
                        </div>
                      )}
                    </div>

                    {/* Giá tiền */}
                    <div
                      style={{
                        flexShrink: 0,
                        textAlign: "right",
                        minWidth: "120px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#4db6ac",
                          marginBottom: "4px",
                        }}
                      >
                        {formatPrice(booking.totalPrice || 0, "VNĐ")}
                      </div>
                      <div style={{ fontSize: "13px", color: "#999" }}>
                        Tổng thanh toán
                      </div>
                    </div>
                  </div>
                  
                  {/* Thông tin bàn giao xe */}
                  {booking.status === "renting" && booking.handoverAt && (
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
                        <strong style={{ color: "#1890ff" }}>Xe đã được bàn giao</strong>
                      </div>
                      <div style={{ fontSize: "13px", color: "#666", marginLeft: "26px" }}>
                        <CalendarOutlined /> Thời gian nhận xe: {formatDate(booking.handoverAt)}
                      </div>
                    </div>
                  )}
                  
                  {/* Thông tin hoàn thành */}
                  {booking.status === "completed" && booking.completedAt && (
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
                        <strong style={{ color: "#52c41a" }}>Đã hoàn thành thuê xe</strong>
                      </div>
                      {booking.handoverAt && (
                        <div style={{ fontSize: "13px", color: "#666", marginLeft: "26px" }}>
                          <CalendarOutlined /> Nhận xe: {formatDate(booking.handoverAt)}
                        </div>
                      )}
                      {booking.returnedAt && (
                        <div style={{ fontSize: "13px", color: "#666", marginLeft: "26px" }}>
                          <CalendarOutlined /> Trả xe: {formatDate(booking.returnedAt)}
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
                      <Tag color="green">
                        {booking.payment?.method === "credit_card"
                          ? " Thẻ tín dụng"
                          : booking.payment?.method === "debit_card"
                          ? " Thẻ ghi nợ"
                          : booking.payment?.method === "momo"
                          ? " MoMo"
                          : booking.payment?.method === "zalopay"
                          ? " ZaloPay"
                          : " Tiền mặt"}
                      </Tag>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          marginBottom: "4px",
                        }}
                      >
                        Tổng thanh toán:
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#4db6ac",
                        }}
                      >
                        {formatPrice(booking.payment?.amount || 0, "VNĐ")}
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
