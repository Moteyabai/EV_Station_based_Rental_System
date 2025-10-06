import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Badge, Dropdown, Avatar, Space, Button } from "antd";
import {
  HomeOutlined,
  CarOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

const { Header } = Layout;

export default function NavBar() {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => navigate("/profile"),
    },
    {
      key: "history",
      icon: <HistoryOutlined />,
      label: "Lịch sử thuê xe",
      onClick: () => navigate("/history"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: "/vehicles",
      icon: <CarOutlined />,
      label: <Link to="/vehicles">Xe máy điện</Link>,
    },
    {
      key: "/stations",
      icon: <EnvironmentOutlined />,
      label: <Link to="/stations">Điểm thuê</Link>,
    },
    {
      key: "/about",
      icon: <InfoCircleOutlined />,
      label: <Link to="/about">Giới thiệu</Link>,
    },
  ];

  return (
    <Header
      style={{
        position: "fixed",
        zIndex: 1000,
        width: "100%",
        backgroundColor: "#fff",
        borderBottom: "1px solid #f0f0f0",
        padding: "0 20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#4db6ac",
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span style={{ color: "#4db6ac" }}>EV</span> Rental
          </Link>
        </div>

        {/* Menu */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            border: "none",
            backgroundColor: "transparent",
            flex: 1,
            justifyContent: "center",
          }}
        />

        {/* Actions */}
        <Space size="middle">
          {/* Cart */}
          <Link to="/cart">
            <Badge count={getItemCount()} showZero={false}>
              <Button
                type="text"
                icon={<ShoppingCartOutlined />}
                size="large"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#595959",
                }}
              >
                Giỏ hàng
              </Button>
            </Badge>
          </Link>

          {/* User Actions */}
          {user ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Button
                type="text"
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 8px",
                }}
              >
                <Space>
                  <Avatar
                    icon={<UserOutlined />}
                    size="small"
                    style={{ backgroundColor: "#4db6ac" }}
                  />
                  <span style={{ color: "#262626" }}>
                    {user.fullName || user.email}
                  </span>
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Space>
              <Link to="/login">
                <Button type="default">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button
                  type="primary"
                  style={{ backgroundColor: "#4db6ac", borderColor: "#4db6ac" }}
                >
                  Đăng ký
                </Button>
              </Link>
            </Space>
          )}
        </Space>
      </div>
    </Header>
  );
}
