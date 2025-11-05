import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Auth.css";
import { setToken } from "../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Gọi API backend để đăng nhập
      const response = await fetch("http://localhost:5168/api/Account/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Xử lý lỗi từ backend
        throw new Error(data.error || "Đăng nhập thất bại");
      }

      // Lưu token và user vào storage (token key standardized to ev_token)
      const tokenValue = data.token || data.Token;
      setToken(tokenValue, remember);

      // Prepare user object and call AuthContext.login with remember flag
      const userToStore = {
        accountID: data.accountID || data.AccountID,
        fullName: data.fullName || data.FullName,
        email: data.email || data.Email,
        roleID: data.roleID || data.RoleID,
        roleName: data.roleName || data.RoleName,
      };
      try {
        if (remember) localStorage.setItem("user", JSON.stringify(userToStore));
        else sessionStorage.setItem("user", JSON.stringify(userToStore));
      } catch (e) {}

      // Update auth context (this will persist user state as well)
      login(userToStore, remember);

      // Chuyển hướng dựa trên role
      // roleID: 1 - Customer, 2 - Staff, 3 - Admin
      const roleId = data.roleID || data.RoleID;
      if (roleId === 2) {
        // Nếu là staff, chuyển đến trang staff
        navigate("/staff");
      } else if (roleId === 3) {
        // Nếu là admin, chuyển đến trang admin (tạo sau)
        navigate("/admin");
      } else {
        // Nếu là customer, chuyển về trang chủ
        navigate("/");
      }
    } catch (err) {
      setError(
        err.message || "Thông tin đăng nhập không hợp lệ. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Đăng nhập EV Rental</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form vertical">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email.cua.ban@example.com"
              required
            />
          </label>

          <label>
            Mật khẩu
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu của bạn"
                required
                style={{ paddingRight: "3.5rem" }}
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  // eye-off / hidden icon
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 3L21 21"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.58 10.58A3 3 0 0113.42 13.42"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.53 5.11A11.47 11.47 0 0112 4.5c5 0 9.27 3.11 11 7.5a17.72 17.72 0 01-2.5 4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3.5 12a17.72 17.72 0 002.5 4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  // eye / visible icon
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </label>

          <label
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />{" "}
            Ghi nhớ đăng nhập
          </label>

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Chưa có tài khoản?{" "}
            <Link to="/register" className="auth-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
