import React, { useState } from "react";
import { Modal, Form, Rate, Input, Button, message } from "antd";
import { StarOutlined } from "@ant-design/icons";
import { useReview } from "../contexts/ReviewContext";

const { TextArea } = Input;

export default function ReviewForm({
  visible,
  onClose,
  vehicleId,
  vehicleName,
  stationId,
  stationName,
}) {
  const [form] = Form.useForm();
  const { addReview } = useReview();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);

    try {
      const review = {
        id: Date.now(),
        vehicleId: vehicleId,
        vehicleName: vehicleName,
        stationId: stationId,
        stationName: stationName,
        rating: values.rating,
        comment: values.comment,
        userName: values.userName || "Khách hàng",
        createdAt: new Date().toISOString(),
      };

      addReview(review);

      message.success("Cảm ơn bạn đã đánh giá!");
      form.resetFields();
      onClose();
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <StarOutlined style={{ color: "#4db6ac", fontSize: "20px" }} />
          <span>Đánh giá dịch vụ</span>
        </div>
      }
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          rating: 5,
        }}
      >
        {vehicleName && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              background: "#f0f9ff",
              borderRadius: "8px",
              borderLeft: "4px solid #4db6ac",
            }}
          >
            <div style={{ fontWeight: 500, color: "#333" }}>
              Xe: {vehicleName}
            </div>
            {stationName && (
              <div
                style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}
              >
                Trạm: {stationName}
              </div>
            )}
          </div>
        )}

        <Form.Item name="userName" label="Tên của bạn">
          <Input placeholder="Nhập tên của bạn (không bắt buộc)" />
        </Form.Item>

        <Form.Item
          name="rating"
          label="Đánh giá của bạn"
          rules={[{ required: true, message: "Vui lòng chọn số sao!" }]}
        >
          <Rate
            style={{ fontSize: "32px", color: "#4db6ac" }}
            character={<StarOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="comment"
          label="Nhận xét"
          rules={[{ required: true, message: "Vui lòng nhập nhận xét!" }]}
        >
          <TextArea
            rows={4}
            placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ thuê xe..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item>
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
          >
            <Button onClick={onClose}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ backgroundColor: "#4db6ac", borderColor: "#4db6ac" }}
            >
              Gửi đánh giá
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
