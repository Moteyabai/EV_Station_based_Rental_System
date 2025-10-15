import React from "react";
import { Card, Rate, Empty, Avatar, Tag } from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useReview } from "../contexts/ReviewContext";

export default function ReviewList({ vehicleId, stationId }) {
  const { getReviews, getAverageRating } = useReview();

  const reviews = vehicleId ? getReviews(vehicleId, stationId) : [];

  const averageRating = vehicleId ? getAverageRating(vehicleId, stationId) : 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;

    return date.toLocaleDateString("vi-VN");
  };

  if (!reviews || reviews.length === 0) {
    return (
      <Card style={{ marginTop: "24px" }}>
        <Empty
          description="Chưa có đánh giá nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div style={{ marginTop: "24px" }}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <StarOutlined style={{ color: "#4db6ac", fontSize: "20px" }} />
            <span>Đánh giá từ khách hàng</span>
            <Tag color="#4db6ac" style={{ marginLeft: "auto" }}>
              {reviews.length} đánh giá
            </Tag>
          </div>
        }
      >
        {/* Tổng quan đánh giá */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "16px",
            background: "#f0f9ff",
            borderRadius: "8px",
            marginBottom: "24px",
            borderLeft: "4px solid #4db6ac",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "36px", fontWeight: "bold", color: "#4db6ac" }}
            >
              {averageRating.toFixed(1)}
            </div>
            <Rate
              disabled
              allowHalf
              value={averageRating}
              style={{ fontSize: "16px", color: "#4db6ac" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "16px", fontWeight: 500, color: "#333" }}>
              Đánh giá trung bình
            </div>
            <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
              Dựa trên {reviews.length} đánh giá từ khách hàng
            </div>
          </div>
        </div>

        {/* Danh sách đánh giá */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {reviews.map((review) => (
            <Card
              key={review.id}
              type="inner"
              style={{
                borderLeft: "3px solid #4db6ac",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", gap: "12px" }}>
                <Avatar
                  size={48}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#4db6ac", flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, color: "#333" }}>
                        {review.userName || "Khách hàng"}
                      </div>
                      <Rate
                        disabled
                        value={review.rating}
                        style={{ fontSize: "14px", color: "#4db6ac" }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#999",
                        fontSize: "13px",
                      }}
                    >
                      <ClockCircleOutlined />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>

                  {review.comment && (
                    <div
                      style={{
                        color: "#555",
                        lineHeight: "1.6",
                        marginTop: "8px",
                        padding: "12px",
                        background: "#fafafa",
                        borderRadius: "6px",
                      }}
                    >
                      {review.comment}
                    </div>
                  )}

                  {(review.vehicleName || review.stationName) && (
                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "13px",
                        color: "#666",
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      {review.vehicleName && (
                        <Tag color="blue">Xe: {review.vehicleName}</Tag>
                      )}
                      {review.stationName && (
                        <Tag color="green">Trạm: {review.stationName}</Tag>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
