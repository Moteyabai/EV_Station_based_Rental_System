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
    const allBookings = JSON.parse(localStorage.getItem("ev_bookings") || "[]");
    const userBookings = allBookings.filter(
      (booking) => booking.userId === user.email
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
      return bookings.filter((b) => b.status === "confirmed");
    if (activeTab === "completed")
      return bookings.filter((b) => b.status === "completed");
    return bookings;
  };

  const filteredBookings = getFilteredBookings();

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge status="processing" text="Đã xác nhận" />;
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
      case "confirmed":
        return <SyncOutlined spin style={{ color: "#1890ff" }} />;
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
                label: `Đã xác nhận (${
                  bookings.filter((b) => b.status === "confirmed").length
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
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "8px",
                      padding: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "14px",
                        color: "#666",
                        fontWeight: 600,
                      }}
                    >
                      Thông tin xe thuê:
                    </h4>
                    {booking.items &&
                      booking.items.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px",
                            background: "white",
                            borderRadius: "6px",
                            marginBottom:
                              index < booking.items.length - 1 ? "8px" : 0,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "12px",
                              alignItems: "center",
                              flex: 1,
                            }}
                          >
                            <img
                              src={item.vehicle.image}
                              alt={item.vehicle.name}
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=200&q=60";
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "#1a1a1a",
                                  marginBottom: "4px",
                                }}
                              >
                                {item.vehicle.name}
                              </div>
                              <div style={{ fontSize: "13px", color: "#666" }}>
                                <EnvironmentOutlined />{" "}
                                {item.rentalDetails.pickupStation?.name ||
                                  "Chưa chọn trạm"}
                              </div>
                              <div
                                style={{
                                  fontSize: "13px",
                                  color: "#666",
                                  marginTop: "2px",
                                }}
                              >
                                <ClockCircleOutlined />{" "}
                                {item.rentalDetails.pickupDate}{" "}
                                {item.rentalDetails.returnDate}{" "}
                                <Tag color="blue" style={{ marginLeft: "8px" }}>
                                  {item.rentalDetails.days} ngày
                                </Tag>
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ textAlign: "right", marginLeft: "16px" }}
                          >
                            <div
                              style={{
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "#4db6ac",
                              }}
                            >
                              {formatPrice(item.totalPrice, "VNĐ")}
                            </div>
                            <div style={{ fontSize: "13px", color: "#999" }}>
                              {formatPrice(item.vehicle.price, "VNĐ")}/ngày
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
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
