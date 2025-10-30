import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import App from "./App.jsx";
import "./index.css";
import "./styles/scrollbar.css";
import "./styles/antd-patch.css";
import "./styles/responsive.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ConfigProvider locale={viVN}>
    <App />
  </ConfigProvider>
);
