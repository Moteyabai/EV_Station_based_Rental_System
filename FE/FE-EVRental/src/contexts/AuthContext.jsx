import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { removeToken } from "../utils/auth";

const AuthContext = createContext();

// Session timeout: 1 giờ (3600000 milliseconds)
const SESSION_TIMEOUT = 60 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const loginTime =
        localStorage.getItem("ev_login_time") ||
        sessionStorage.getItem("ev_login_time");

      if (raw && loginTime) {
        const elapsed = Date.now() - parseInt(loginTime, 10);
        // Nếu đã quá SESSION_TIMEOUT, xóa session
        if (elapsed > SESSION_TIMEOUT) {
          localStorage.removeItem("user");
          localStorage.removeItem("ev_login_time");
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("ev_login_time");
          removeToken();
          return null;
        }
        return JSON.parse(raw);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [verificationStatus, setVerificationStatus] = useState(() => {
    try {
      const raw = localStorage.getItem("ev_verification_status");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const timeoutRef = useRef(null);

  // Hàm logout được gọi khi hết session
  const handleSessionTimeout = useCallback(() => {
    // Session expired - clear and logout
    setUser(null);
    setVerificationStatus(null);
    localStorage.removeItem("user");
    localStorage.removeItem("ev_login_time");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("ev_login_time");
    removeToken();
    localStorage.removeItem("ev_verification_status");
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }, []);

  // Setup session timeout khi user login
  useEffect(() => {
    if (user) {
      const loginTime =
        localStorage.getItem("ev_login_time") ||
        sessionStorage.getItem("ev_login_time");
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime, 10);
        const remaining = SESSION_TIMEOUT - elapsed;

        if (remaining > 0) {
          // Clear timeout cũ nếu có
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Setup timeout mới
          timeoutRef.current = setTimeout(handleSessionTimeout, remaining);
          console.log(
            `⏱️ Session will expire in ${Math.round(
              remaining / 1000 / 60
            )} minutes`
          );
        } else {
          // Session đã hết hạn
          handleSessionTimeout();
        }
      }
    } else {
      // Clear timeout khi user logout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, handleSessionTimeout]);

  useEffect(() => {
    try {
      // If user already exists in sessionStorage, persist there; otherwise default to localStorage
      if (user) {
        if (sessionStorage.getItem("user")) {
          sessionStorage.setItem("user", JSON.stringify(user));
        } else {
          localStorage.setItem("user", JSON.stringify(user));
        }
      } else {
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
      }
    } catch (e) {}
  }, [user]);

  useEffect(() => {
    if (verificationStatus)
      localStorage.setItem(
        "ev_verification_status",
        JSON.stringify(verificationStatus)
      );
    else localStorage.removeItem("ev_verification_status");
  }, [verificationStatus]);

  function login(userData, remember = true) {
    // Lưu thời gian login
    const loginTime = Date.now();
    try {
      if (remember) {
        localStorage.setItem("ev_login_time", loginTime.toString());
      } else {
        sessionStorage.setItem("ev_login_time", loginTime.toString());
      }
    } catch (e) {}

    // Set user state
    setUser({
      ...userData,
      isAuthenticated: true,
    });
  }

  function logout() {
    // Clear timeout khi user logout thủ công
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Clear tất cả session data
    localStorage.removeItem("user");
    localStorage.removeItem("ev_login_time");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("ev_login_time");
    removeToken();
    localStorage.removeItem("ev_verification_status");

    setUser(null);
    setVerificationStatus(null);

    console.log("👋 User logged out");
  }

  function register(userData) {
    // Lưu thời gian đăng ký (cũng tính như login)
    const loginTime = Date.now();
    localStorage.setItem("ev_login_time", loginTime.toString());

    console.log("✅ User registered - session will expire in 1 hour");

    // Trong ứng dụng thực, đây sẽ là API call để đăng ký user
    // và xử lý upload tài liệu

    // Cho mục đích demo, chúng ta sẽ mô phỏng đăng ký thành công
    setUser({
      ...userData,
      isAuthenticated: true,
    });

    // Thiết lập trạng thái xác minh ban đầu
    setVerificationStatus({
      documentsSubmitted: true,
      documentsVerified: false,
      verificationMessage:
        "Tài khoản của bạn đã được tạo. Vui lòng đến bất kỳ điểm thuê nào để hoàn tất xác minh.",
    });
  }

  function updateVerificationStatus(status) {
    setVerificationStatus({
      ...verificationStatus,
      ...status,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        verificationStatus,
        updateVerificationStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
