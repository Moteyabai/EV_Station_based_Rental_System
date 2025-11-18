import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Badge,
  Dropdown,
  Avatar,
  Space,
  Button,
  Popover,
} from "antd";
import {
  HomeOutlined,
  CarOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
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
  const [userMenuVisible, setUserMenuVisible] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }) => {
    setUserMenuVisible(false); // Đóng menu sau khi click
    switch (key) {
      case "logout":
        logout();
        navigate("/");
        break;
      case "profile":
        navigate("/profile");
        break;
      case "history":
        navigate("/history");
        break;
      default:
        break;
    }
  };

  // Kiểm tra role để hiển thị menu phù hợp
  const userRoleId = user?.roleID || user?.RoleID;
  const isStaffOrAdmin = userRoleId === 2 || userRoleId === 3;

  // Menu items cho User (không hiển thị cho Staff/Admin)
  const profileHistoryItems = isStaffOrAdmin ? [] : [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "history",
      icon: <HistoryOutlined />,
      label: "Lịch sử thuê xe",
    },
  ];

  // Tạo menu items đầy đủ
  const allMenuItems = [
    ...profileHistoryItems,
    ...(profileHistoryItems.length > 0 ? [{ type: "divider" }] : []),
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  const userMenuContent = (
    <Menu
      onClick={handleUserMenuClick}
      style={{ minWidth: 200 }}
      items={allMenuItems}
    />
  );

  const userMenuItems = allMenuItems;

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
                size="large"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#595959",
                }}
              >
                📋Đơn Thuê Xe
              </Button>
            </Badge>
          </Link>

          {/* User Actions */}
          {user ? (
            <div style={{ position: "relative" }}>
              <Button
                type="text"
                style={{ height: "auto", padding: "4px 8px" }}
                onClick={() => {
                  setUserMenuVisible(!userMenuVisible);
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

              {userMenuVisible && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "8px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow:
                      "0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05)",
                    zIndex: 1000,
                    minWidth: "200px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                    onClick={() => {
                      setUserMenuVisible(false);
                      navigate("/profile");
                    }}
                  >
                    <UserOutlined />
                    <span>Thông tin cá nhân</span>
                  </div>

                  <div
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                    onClick={() => {
                      setUserMenuVisible(false);
                      navigate("/history");
                    }}
                  >
                    <HistoryOutlined />
                    <span>Lịch sử thuê xe</span>
                  </div>

                  <div
                    style={{ borderTop: "1px solid #f0f0f0", margin: "4px 0" }}
                  />

                  <div
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#ff4d4f",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fff1f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                    onClick={() => {
                      setUserMenuVisible(false);
                      logout();
                      navigate("/");
                    }}
                  >
                    <LogoutOutlined />
                    <span>Đăng xuất</span>
                  </div>
                </div>
              )}
            </div>
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
