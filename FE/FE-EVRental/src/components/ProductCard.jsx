import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Button,
  Typography,
  Space,
  Tag,
  Row,
  Col,
  Image,
  Badge,
} from "antd";
import {
  CarOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  BatteryOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useCart } from "../contexts/CartContext";
import BookingForm from "./BookingForm";
import { formatPrice, getBrandTag, getStatusBadge } from "../utils/helpers";

const { Text, Title } = Typography;
const { Meta } = Card;

export default function ProductCard({ p, isSelected, onSelect }) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { addToCart } = useCart();

  const handleSelectVehicle = () => {
    if (onSelect) {
      onSelect(p.id);
    }
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (formData, rentalDetails) => {
    setShowBookingForm(false);
    // Navigate to cart or show success message
    alert("✅ Đã thêm xe vào giỏ hàng thành công!");
  };

  // Get brand and status configuration
  const brandTag = getBrandTag(p.name);
  const status = getStatusBadge(p.status);

  return (
    <>
      <Badge.Ribbon text={status.text} color={status.color} placement="start">
        <Card
          hoverable
          style={{
            width: "100%",
            height: "100%",
            border: isSelected ? "2px solid #4db6ac" : "1px solid #d9d9d9",
            transition: "all 0.3s ease",
          }}
          cover={
            <div style={{ position: "relative", height: 200 }}>
              <Image
                alt={p.name}
                src={p.image}
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  borderRadius: "8px 8px 0 0",
                }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                preview={false}
              />
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1,
                }}
              >
                {getBrandTag()}
              </div>
            </div>
          }
          actions={[
            <Link to={`/product/${p.id}`} key="view">
              <Button
                type="text"
                icon={<EyeOutlined />}
                style={{ border: "none", color: "#4db6ac" }}
              >
                Xem chi tiết
              </Button>
            </Link>,
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={handleSelectVehicle}
              disabled={p.status !== "available"}
              key="book"
              style={{ backgroundColor: "#4db6ac", borderColor: "#4db6ac" }}
            >
              Đặt xe
            </Button>,
          ]}
        >
          <Meta
            title={
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Title level={4} style={{ margin: 0, color: "#262626" }}>
                  {p.name}
                </Title>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {p.short}
                </Text>
              </Space>
            }
            description={
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                {/* Specs */}
                <Row gutter={[8, 4]}>
                  <Col span={12}>
                    <Space size="small">
                      <BatteryOutlined style={{ color: "#4db6ac" }} />
                      <Text style={{ fontSize: "12px" }}>
                        {p.range || "120km"}
                      </Text>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space size="small">
                      <ThunderboltOutlined style={{ color: "#ff7043" }} />
                      <Text style={{ fontSize: "12px" }}>
                        {p.power || "3000W"}
                      </Text>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space size="small">
                      <UserOutlined style={{ color: "#26a69a" }} />
                      <Text style={{ fontSize: "12px" }}>
                        {p.seats || "2"} chỗ
                      </Text>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space size="small">
                      <CarOutlined style={{ color: "#4db6ac" }} />
                      <Text style={{ fontSize: "12px" }}>
                        {p.type || "Xe máy điện"}
                      </Text>
                    </Space>
                  </Col>
                </Row>

                {/* Price */}
                <div
                  style={{
                    textAlign: "center",
                    marginTop: 16,
                    padding: "8px 0",
                    backgroundColor: "#f6f6f6",
                    borderRadius: "6px",
                  }}
                >
                  <Text strong style={{ fontSize: "18px", color: "#f50" }}>
                    {formatPrice(p.price, p.priceUnit)}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {p.priceUnit}
                  </Text>
                </div>

                {/* Tags */}
                <div style={{ marginTop: 8 }}>
                  <Tag color={brandTag.color}>{brandTag.text}</Tag>
                </div>
              </Space>
            }
          />
        </Card>
      </Badge.Ribbon>

      {showBookingForm && (
        <BookingForm
          vehicle={p}
          onSubmit={handleBookingSubmit}
          onCancel={() => setShowBookingForm(false)}
        />
      )}
    </>
  );
}
