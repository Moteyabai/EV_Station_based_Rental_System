import React from "react";
import { Dropdown, Button, Space, Avatar } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

export default function TestDropdown() {
  const items = [
    {
      key: "1",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
    },
    {
      key: "2",
      label: "Lịch sử thuê xe",
      icon: <HistoryOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    console.log("Clicked:", key);
  };

  return (
    <div
      style={{
        padding: "50px",
        backgroundColor: "#f0f0f0",
        minHeight: "100vh",
      }}
    >
      <h1>Test Dropdown</h1>

      <div style={{ marginTop: "30px" }}>
        <h3>Test 1: Simple Dropdown</h3>
        <Dropdown
          menu={{
            items,
            onClick: handleMenuClick,
          }}
        >
          <Button>Click me</Button>
        </Dropdown>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>Test 2: Dropdown with Avatar</h3>
        <Dropdown
          menu={{
            items,
            onClick: handleMenuClick,
          }}
        >
          <Button type="text">
            <Space>
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: "#4db6ac" }}
              />
              <span>Huy Nguyen</span>
            </Space>
          </Button>
        </Dropdown>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>Test 3: Dropdown with trigger click</h3>
        <Dropdown
          menu={{
            items,
            onClick: handleMenuClick,
          }}
          trigger={["click"]}
        >
          <Button>Click trigger</Button>
        </Dropdown>
      </div>
    </div>
  );
}
