import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Card,
  Divider,
  Alert,
  message,
  notification,
} from "antd";
import {
  CalendarOutlined,
  CarOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { fetchActiveStations } from "../api/stations";
import { calculateRentalDays, formatPrice } from "../utils/helpers";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function BookingForm({ vehicle, onSubmit, onCancel }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [rentalDays, setRentalDays] = useState(0);
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);

  // Load stations from API
  useEffect(() => {
    let isMounted = true;
    async function loadStations() {
      try {
        // Use the new API endpoint with bikeID
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:5168/api/Station/AvailableStockInStationsByBikeID?bikeID=${vehicle.id}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch stations');
        }
        
        const apiStations = await response.json();
        if (!isMounted) return;
        const mapped = apiStations.map((s) => ({
          id: s.stationID || s.StationID || s.id,
          name: s.name || s.Name,
          address: s.address || s.Address,
        }));
        setStations(mapped);
      } catch (error) {
        console.error("Error loading stations:", error);
        message.error("Không thể tải danh sách trạm");
        setStations([]);
      } finally {
        if (isMounted) setLoadingStations(false);
      }
    }
    loadStations();
    return () => { isMounted = false; };
  }, [vehicle.id]);

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

  // Calculate total price (base price x days)
  const getTotalPrice = () => {
    const days = getRentalDays();
    const basePrice =
      typeof vehicle.price === "string"
        ? parseFloat(vehicle.price.replace(/[^\d]/g, ""))
        : vehicle.price;

    return basePrice * days;
  };

  // Cập nhật giá khi thay đổi ngày từ form
  const handleDateChange = () => {
    const pickupDate = form.getFieldValue('pickupDate');
    const returnDate = form.getFieldValue('returnDate');
    
    if (pickupDate && returnDate) {
      const days = calculateRentalDays(pickupDate, returnDate);
      setRentalDays(days);
      
      const basePrice =
        typeof vehicle.price === "string"
          ? parseFloat(vehicle.price.replace(/[^\d]/g, ""))
          : vehicle.price;
      setTotalPrice(basePrice * days);
    }
  };

  // Cập nhật giá khi thay đổi ngày
  useEffect(() => {
    setRentalDays(getRentalDays());
    setTotalPrice(getTotalPrice());
  }, [formData.rentalInfo.pickupDate, formData.rentalInfo.returnDate]);

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
      console.log("Form values:", values);

      // Cập nhật formData từ native HTML form values
      const updatedFormData = {
        ...formData,
        rentalInfo: {
          ...formData.rentalInfo,
          pickupDate: values.pickupDate || "",
          returnDate: values.returnDate || "",
          pickupTime: values.pickupTime || "09:00",
          returnTime: values.returnTime || "18:00",
          pickupStationId: values.pickupStationId || "",
          returnStationId: values.returnStationId || "",
          specialRequests: values.specialRequests || "",
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
        customerInfo: updatedFormData.customerInfo,
        totalPrice: totalPrice,
      };

      // Add to cart
      addToCart(vehicle, rentalDetails);

      // Show success message
      message.success({
        content: `✅ Đã thêm xe ${vehicle.name} vào giỏ hàng!`,
        duration: 2,
      });

      // Reset form
      form.resetFields();

      // Tự động chuyển đến trang giỏ hàng
      setTimeout(() => {
        navigate('/cart');
        if (onCancel) {
          onCancel(); // Đóng modal
        }
      }, 500);
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
      styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      maskClosable={false}
      destroyOnClose={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          pickupDate: new Date().toISOString().split("T")[0],
          returnDate: new Date(Date.now() + 86400000)
            .toISOString()
            .split("T")[0],
          pickupTime: "09:00",
          returnTime: "18:00",
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
            <Col span={24}>
              <Form.Item
                name="pickupStationId"
                label="Điểm nhận và trả xe"
                rules={[
                  { required: true, message: "Vui lòng chọn điểm nhận và trả xe!" },
                ]}
              >
                <select
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #d9d9d9",
                    fontSize: "14px",
                  }}
                  onChange={(e) => {
                    form.setFieldValue("pickupStationId", e.target.value);
                    form.setFieldValue("returnStationId", e.target.value);
                    console.log("Selected station:", e.target.value);
                  }}
                >
                  <option value="">Chọn điểm nhận và trả xe</option>
                  {stations && stations.length > 0 ? (
                    stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name} - {station.address}
                      </option>
                    ))
                  ) : (
                    <option disabled>Không có trạm nào</option>
                  )}
                </select>
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
                <input
                  type="date"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #d9d9d9",
                    fontSize: "14px",
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    form.setFieldValue("pickupDate", e.target.value);
                    handleDateChange();
                  }}
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
                <input
                  type="time"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #d9d9d9",
                    fontSize: "14px",
                  }}
                  defaultValue="09:00"
                  onChange={(e) => {
                    form.setFieldValue("pickupTime", e.target.value);
                  }}
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
                <input
                  type="date"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #d9d9d9",
                    fontSize: "14px",
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    form.setFieldValue("returnDate", e.target.value);
                    handleDateChange();
                  }}
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
                <input
                  type="time"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #d9d9d9",
                    fontSize: "14px",
                  }}
                  defaultValue="18:00"
                  onChange={(e) => {
                    form.setFieldValue("returnTime", e.target.value);
                  }}
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
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Row justify="space-between">
              <Text>Giá thuê mỗi ngày:</Text>
              <Text strong>
                {formatPrice(
                  typeof vehicle.price === "string"
                    ? parseFloat(vehicle.price.replace(/[^\d]/g, ""))
                    : vehicle.price
                )}
              </Text>
            </Row>
            <Row justify="space-between">
              <Text>Số ngày thuê:</Text>
              <Text strong>{rentalDays} ngày</Text>
            </Row>
            <Divider style={{ margin: "8px 0" }} />
            <Row justify="space-between">
              <Text strong style={{ fontSize: "16px" }}>
                Tổng tiền:
              </Text>
              <Text strong style={{ fontSize: "20px", color: "#4db6ac" }}>
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
