import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Checkbox,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Card,
  Divider,
  Alert,
  InputNumber,
  message,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useCart } from "../contexts/CartContext";
import { mockStations, serviceOptions } from "../constants/mockData";
import {
  calculateRentalDays,
  calculateTotalPrice,
  formatPrice,
} from "../utils/helpers";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function BookingForm({ vehicle, onSubmit, onCancel }) {
  const { addToCart } = useCart();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [rentalDays, setRentalDays] = useState(0);

  // Giữ nguyên logic state như cũ để tránh lỗi
  const [formData, setFormData] = useState({
    customerInfo: {
      fullName: "",
      email: "",
      phone: "",
      idNumber: "",
      driverLicense: "",
    },
    rentalInfo: {
      pickupDate: "",
      returnDate: "",
      pickupTime: "09:00",
      returnTime: "18:00",
      pickupStationId: "",
      returnStationId: "",
      specialRequests: "",
    },
    additionalServices: {
      insurance: false,
      gps: false,
      childSeat: false,
      wifi: false,
      extraDriver: false,
    },
  });

  // Calculate rental duration
  const getRentalDays = () => {
    if (formData.rentalInfo.pickupDate && formData.rentalInfo.returnDate) {
      return calculateRentalDays(
        formData.rentalInfo.pickupDate,
        formData.rentalInfo.returnDate
      );
    }
    return 1;
  };

  // Calculate total price with services
  const getTotalPrice = () => {
    const days = getRentalDays();
    const basePrice =
      typeof vehicle.price === "string"
        ? parseFloat(vehicle.price.replace(/[^\d]/g, ""))
        : vehicle.price;

    const selectedServices = Object.entries(formData.additionalServices)
      .filter(([_, isSelected]) => isSelected)
      .map(([serviceId]) => serviceOptions.find((s) => s.id === serviceId))
      .filter(Boolean);

    return calculateTotalPrice(basePrice, days, selectedServices);
  };

  // Cập nhật giá khi thay đổi ngày hoặc dịch vụ
  useEffect(() => {
    setRentalDays(getRentalDays());
    setTotalPrice(getTotalPrice());
  }, [
    formData.rentalInfo.pickupDate,
    formData.rentalInfo.returnDate,
    formData.additionalServices,
  ]);

  // Giữ nguyên logic validate
  const validateForm = () => {
    const newErrors = {};

    // Validate customer info (giữ nguyên logic nhưng không hiển thị UI)
    if (!formData.customerInfo.fullName.trim()) {
      newErrors["customerInfo.fullName"] = "Họ tên là bắt buộc";
    }
    if (!formData.customerInfo.email.trim()) {
      newErrors["customerInfo.email"] = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.customerInfo.email)) {
      newErrors["customerInfo.email"] = "Email không hợp lệ";
    }
    if (!formData.customerInfo.phone.trim()) {
      newErrors["customerInfo.phone"] = "Số điện thoại là bắt buộc";
    } else if (
      !/^[0-9]{10,11}$/.test(formData.customerInfo.phone.replace(/\s/g, ""))
    ) {
      newErrors["customerInfo.phone"] = "Số điện thoại không hợp lệ";
    }
    if (!formData.customerInfo.idNumber.trim()) {
      newErrors["customerInfo.idNumber"] = "Số CMND/CCCD là bắt buộc";
    }
    if (!formData.customerInfo.driverLicense.trim()) {
      newErrors["customerInfo.driverLicense"] = "Số bằng lái xe là bắt buộc";
    }

    // Validate rental info
    if (!formData.rentalInfo.pickupDate) {
      newErrors["rentalInfo.pickupDate"] = "Ngày nhận xe là bắt buộc";
    }
    if (!formData.rentalInfo.returnDate) {
      newErrors["rentalInfo.returnDate"] = "Ngày trả xe là bắt buộc";
    }
    if (formData.rentalInfo.pickupDate && formData.rentalInfo.returnDate) {
      const pickupDate = new Date(formData.rentalInfo.pickupDate);
      const returnDate = new Date(formData.rentalInfo.returnDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (pickupDate < today) {
        newErrors["rentalInfo.pickupDate"] =
          "Ngày nhận xe không thể là quá khứ";
      }
      if (returnDate <= pickupDate) {
        newErrors["rentalInfo.returnDate"] =
          "Ngày trả xe phải sau ngày nhận xe";
      }
    }
    if (!formData.rentalInfo.pickupStationId) {
      newErrors["rentalInfo.pickupStationId"] = "Vui lòng chọn điểm nhận xe";
    }
    if (!formData.rentalInfo.returnStationId) {
      newErrors["rentalInfo.returnStationId"] = "Vui lòng chọn điểm trả xe";
    }

    return Object.keys(newErrors).length === 0;
  };

  // Giữ nguyên logic submit
  const handleSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      // Cập nhật formData từ Ant Design form values
      const updatedFormData = {
        ...formData,
        rentalInfo: {
          ...formData.rentalInfo,
          pickupDate: values.pickupDate?.format("YYYY-MM-DD") || "",
          returnDate: values.returnDate?.format("YYYY-MM-DD") || "",
          pickupTime: values.pickupTime?.format("HH:mm") || "09:00",
          returnTime: values.returnTime?.format("HH:mm") || "18:00",
          pickupStationId: values.pickupStationId || "",
          returnStationId: values.returnStationId || "",
          specialRequests: values.specialRequests || "",
        },
        additionalServices: {
          ...formData.additionalServices,
          ...(values.additionalServices || []).reduce((acc, service) => {
            acc[service] = true;
            return acc;
          }, {}),
        },
      };

      setFormData(updatedFormData);

      const rentalDetails = {
        ...updatedFormData.rentalInfo,
        pickupStation: stations.find(
          (s) => s.id === updatedFormData.rentalInfo.pickupStationId
        ),
        returnStation: stations.find(
          (s) => s.id === updatedFormData.rentalInfo.returnStationId
        ),
        days: rentalDays,
        additionalServices: updatedFormData.additionalServices,
        customerInfo: updatedFormData.customerInfo,
        totalPrice: totalPrice,
      };

      // Add to cart
      addToCart(vehicle, rentalDetails);

      // Call onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(updatedFormData, rentalDetails);
      }

      message.success("Đặt xe thành công!");
    } catch (error) {
      console.error("Error submitting booking:", error);
      message.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  return (
    <Modal
      open={true}
      onCancel={onCancel}
      footer={null}
      width={800}
      title={
        <Space>
          <CarOutlined style={{ color: "#4db6ac" }} />
          <span>Đặt xe: {vehicle.name}</span>
        </Space>
      }
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          pickupDate: dayjs(),
          returnDate: dayjs().add(1, "day"),
          pickupTime: dayjs().hour(9).minute(0),
          returnTime: dayjs().hour(18).minute(0),
        }}
      >
        {/* Vehicle Info */}
        <Alert
          message={
            <Space direction="vertical" size="small">
              <Text strong style={{ fontSize: "16px" }}>
                {vehicle.name}
              </Text>
              <Text type="secondary">{vehicle.short}</Text>
              <Text strong style={{ color: "#f50", fontSize: "14px" }}>
                {typeof vehicle.price === "string"
                  ? vehicle.price
                  : `${vehicle.price?.toLocaleString()}đ/ngày`}
              </Text>
            </Space>
          }
          type="info"
          style={{ marginBottom: 24 }}
        />

        {/* Rental Information */}
        <Card
          title={
            <Space>
              <CalendarOutlined />
              <span>Thông tin thuê xe</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pickupStationId"
                label="Điểm nhận xe"
                rules={[
                  { required: true, message: "Vui lòng chọn điểm nhận xe!" },
                ]}
              >
                <Select placeholder="Chọn điểm nhận xe">
                  {stations.map((station) => (
                    <Option key={station.id} value={station.id}>
                      <div>
                        <div style={{ fontWeight: "bold" }}>{station.name}</div>
                        <div style={{ fontSize: "12px", color: "#999" }}>
                          {station.address}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="returnStationId"
                label="Điểm trả xe"
                rules={[
                  { required: true, message: "Vui lòng chọn điểm trả xe!" },
                ]}
              >
                <Select placeholder="Chọn điểm trả xe">
                  {stations.map((station) => (
                    <Option key={station.id} value={station.id}>
                      <div>
                        <div style={{ fontWeight: "bold" }}>{station.name}</div>
                        <div style={{ fontSize: "12px", color: "#999" }}>
                          {station.address}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pickupDate"
                label="Ngày nhận xe"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày nhận xe!" },
                ]}
              >
                <DatePicker
                  placeholder="Chọn ngày nhận xe"
                  disabledDate={disabledDate}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pickupTime"
                label="Giờ nhận xe"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ nhận xe!" },
                ]}
              >
                <TimePicker
                  placeholder="Chọn giờ nhận xe"
                  format="HH:mm"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="returnDate"
                label="Ngày trả xe"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày trả xe!" },
                ]}
              >
                <DatePicker
                  placeholder="Chọn ngày trả xe"
                  disabledDate={disabledDate}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="returnTime"
                label="Giờ trả xe"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ trả xe!" },
                ]}
              >
                <TimePicker
                  placeholder="Chọn giờ trả xe"
                  format="HH:mm"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="specialRequests" label="Yêu cầu đặc biệt">
            <TextArea
              rows={2}
              placeholder="Nhập yêu cầu đặc biệt (nếu có)..."
            />
          </Form.Item>
        </Card>

        {/* Additional Services */}
        <Card
          title={
            <Space>
              <CheckCircleOutlined />
              <span>Dịch vụ bổ sung</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Form.Item name="additionalServices">
            <Checkbox.Group style={{ width: "100%" }}>
              <Row gutter={[16, 16]}>
                {serviceOptions.map((service) => (
                  <Col span={24} key={service.id}>
                    <Checkbox value={service.id}>
                      <Space direction="vertical" size={0}>
                        <Space>
                          <Text strong>{service.name}</Text>
                          <Text type="success" strong>
                            +{formatPrice(service.price)}/ngày
                          </Text>
                        </Space>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {service.description}
                        </Text>
                      </Space>
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Card>

        {/* Price Summary */}
        <Card
          title={
            <Space>
              <DollarOutlined />
              <span>Tổng kết thanh toán</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Row justify="space-between">
              <Text>Số ngày thuê:</Text>
              <Text strong>{rentalDays} ngày</Text>
            </Row>
            <Row justify="space-between">
              <Text>Giá thuê xe:</Text>
              <Text>
                {formatPrice(
                  (typeof vehicle.price === "string"
                    ? parseFloat(vehicle.price.replace(/[^\d]/g, ""))
                    : vehicle.price) * rentalDays
                )}
              </Text>
            </Row>
            <Divider style={{ margin: "8px 0" }} />
            <Row justify="space-between">
              <Text strong style={{ fontSize: "16px" }}>
                Tổng cộng:
              </Text>
              <Text strong style={{ fontSize: "18px", color: "#f50" }}>
                {formatPrice(totalPrice)}
              </Text>
            </Row>
          </Space>
        </Card>

        {/* Form Actions */}
        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button size="large" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={isSubmitting}
            icon={<CarOutlined />}
            style={{ backgroundColor: "#4db6ac", borderColor: "#4db6ac" }}
          >
            Đặt xe ngay
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}
