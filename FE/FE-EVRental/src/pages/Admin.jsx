import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import * as adminService from "../services/adminService";
import { getToken } from "../utils/auth";
import "../styles/Admin.css";

const Admin = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddStationModal, setShowAddStationModal] = useState(false);
  const [showEditStationModal, setShowEditStationModal] = useState(false);
  const [showStationDetailModal, setShowStationDetailModal] = useState(false);
  const [showStationVehiclesModal, setShowStationVehiclesModal] =
    useState(false);
  const [showStationStaffModal, setShowStationStaffModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  // Bike type management modals
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Bike brand and type management
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [showEditBrandModal, setShowEditBrandModal] = useState(false);
  const [showAddBikeTypeModal, setShowAddBikeTypeModal] = useState(false);
  const [showEditBikeTypeModal, setShowEditBikeTypeModal] = useState(false);
  const [showAddBikeInstanceModal, setShowAddBikeInstanceModal] =
    useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedBikeType, setSelectedBikeType] = useState(null);
  const [selectedBike, setSelectedBike] = useState(null);
  const [brands, setBrands] = useState([]);
  const [bikeTypes, setBikeTypes] = useState([]);
  const [bikeInstances, setBikeInstances] = useState([]);
  const [viewMode, setViewMode] = useState("brands"); // 'brands' or 'bikeTypes'

  // Search and filter states for stations
  const [stationSearchTerm, setStationSearchTerm] = useState("");
  const [stationStatusFilter, setStationStatusFilter] = useState("all");

  // Search and filter states for staff
  const [staffSearchTerm, setStaffSearchTerm] = useState("");
  const [staffStationFilter, setStaffStationFilter] = useState("all");
  const [staffRoleFilter, setStaffRoleFilter] = useState("all");

  // Search state for bike instances
  const [bikeInstanceSearchTerm, setBikeInstanceSearchTerm] = useState("");

  const [newStation, setNewStation] = useState({
    name: "",
    address: "",
    totalVehicles: 0,
    chargingStations: 0,
  });

  const [newVehicle, setNewVehicle] = useState({
    name: "",
    brandId: "",
    modelYear: new Date().getFullYear(),
    color: "",
    licensePlate: "",
    batteryCapacity: 0,
    maxSpeed: 0,
    stationId: "",
    status: "available",
  });

  const [newBikeType, setNewBikeType] = useState({
    name: "",
    brandId: "",
    description: "",
    pricePerHour: 0,
    pricePerDay: 0,
    batteryCapacity: 0,
    maxSpeed: 0,
    range: 0,
    frontImg: null,
    backImg: null,
  });

  const [newBrand, setNewBrand] = useState({
    name: "",
    country: "",
    description: "",
  });

  const [newBikeInstance, setNewBikeInstance] = useState({
    licensePlate: "",
    color: 0,
    modelYear: new Date().getFullYear(),
    stationId: "",
    status: 1,
  });

  // Check role access for Admin
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const userRoleId = user?.roleID || user?.RoleID;
    console.log("Admin page: User:", user, "RoleID:", userRoleId);

    // Chỉ cho phép Admin (roleID = 3)
    if (userRoleId !== 3) {
      console.log("Admin page: Access denied, redirecting...");
      if (userRoleId === 2) {
        navigate("/staff");
      } else {
        navigate("/");
      }
      return;
    }

    // Thay thế history state để ngăn back về trang trước
    window.history.replaceState(null, "", "/admin");
  }, [user, navigate]);

  // Xử lý nút back của trình duyệt
  useEffect(() => {
    const handlePopState = (event) => {
      const userRoleId = user?.roleID || user?.RoleID;

      // Nếu là Admin, ngăn không cho back về trang user/staff
      if (userRoleId === 3) {
        console.log("Admin trying to go back - preventing navigation");
        event.preventDefault();

        // Giữ lại ở trang admin
        window.history.pushState(null, "", "/admin");

        // Hiển thị cảnh báo (tùy chọn)
        alert(
          "⚠️ Bạn không thể quay lại trang trước. Vui lòng sử dụng menu điều hướng hoặc đăng xuất."
        );
      }
    };

    // Thêm state ban đầu để có thể catch popstate
    window.history.pushState(null, "", window.location.pathname);

    // Lắng nghe sự kiện popstate (nút back/forward)
    window.addEventListener("popstate", handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [user]);

  // Loading and error states
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationsError, setStationsError] = useState(null);

  const [stats, setStats] = useState({
    totalVehicles: 125,
    activeRentals: 48,
    totalCustomers: 356,
    totalStaff: 24,
    revenue: 45680000,
    vehiclesInUse: 48,
    availableVehicles: 77,
  });

  // Mock data - thay thế bằng API calls thực tế
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      name: "VinFast Klara S",
      station: "Quận 1",
      status: "available",
      battery: 95,
      lastMaintenance: "2025-10-01",
    },
    {
      id: 2,
      name: "DatBike Weaver 200",
      station: "Quận 3",
      status: "rented",
      battery: 78,
      lastMaintenance: "2025-09-28",
    },
    {
      id: 3,
      name: "VinFast Feliz S",
      station: "Quận 7",
      status: "maintenance",
      battery: 45,
      lastMaintenance: "2025-10-05",
    },
  ]);

  const [stations, setStations] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // staff list will be loaded from API; start empty to avoid showing mock data
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState(null);
  const [deletingStaffId, setDeletingStaffId] = useState(null);
  const [editingStaffId, setEditingStaffId] = useState(null);

  // Add staff modal & form state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    stationId: "", // Station assignment
    role: "", // Staff role
    avatarFile: null, // Store File object instead of base64
    avatarPreview: null, // Store preview URL for display
  });
  const [apiErrors, setApiErrors] = useState({});

  const [reports, setReports] = useState({
    revenueByStation: [
      { station: "Quận 1", revenue: 18500000, rentals: 45 },
      { station: "Quận 3", revenue: 15200000, rentals: 38 },
      { station: "Quận 7", revenue: 11980000, rentals: 29 },
    ],
    peakHours: [
      { hour: "7-9h", usage: 85 },
      { hour: "12-14h", usage: 72 },
      { hour: "17-19h", usage: 93 },
    ],
  });

  // Fetch stations from API
  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setStationsLoading(true);
    setStationsError(null);

    try {
      const data = await adminService.getAllStations();
      console.log("Stations loaded from API:", data);

      // Transform API data to match component structure
      const transformedStations = data.map((station) => ({
        id: station.stationID,
        name: station.name,
        address: station.address,
        availableVehicles: station.bikeCapacity || 0, // This should come from bike count API
        totalVehicles: station.bikeCapacity || 0,
        chargingStations: 0, // Not in API, keep as 0 or add to API
        status: station.isActive ? "active" : "maintenance",
      }));

      setStations(transformedStations);
    } catch (error) {
      console.error("Error loading stations:", error);
      setStationsError("Không thể tải danh sách trạm. Vui lòng thử lại.");
    } finally {
      setStationsLoading(false);
    }
  };

  // Bike Type Management Handlers
  const handleAddBrand = async () => {
    if (!newBrand.name) {
      alert("Vui lòng nhập tên hãng xe");
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        alert("❌ Vui lòng đăng nhập lại");
        return;
      }

      const brandData = {
        brandName: newBrand.name,
        country: newBrand.country || "",
        description: newBrand.description || "",
      };

      const response = await fetch(
        "http://localhost:5168/api/Brand/CreateBrand",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(brandData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Brand created:", result);

      // Refresh brands list
      await fetchBrands();

      setShowAddBrandModal(false);
      setNewBrand({
        name: "",
        country: "",
        description: "",
      });
      alert("✅ Đã thêm hãng xe mới thành công!");
    } catch (error) {
      console.error("Error adding brand:", error);
      alert("❌ Không thể thêm hãng xe: " + error.message);
    }
  };

  const handleUpdateBrand = async () => {
    if (!selectedBrand.name) {
      alert("Vui lòng nhập tên hãng xe");
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        alert("❌ Vui lòng đăng nhập lại");
        return;
      }

      const brandData = {
        brandID: selectedBrand.id,
        brandName: selectedBrand.name,
        country: selectedBrand.country || "",
        description: selectedBrand.description || "",
      };

      const response = await fetch(
        "http://localhost:5168/api/Brand/UpdateBrand",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(brandData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Brand updated:", result);

      // Refresh brands list
      await fetchBrands();

      setShowEditBrandModal(false);
      setSelectedBrand(null);
      alert("✅ Đã cập nhật hãng xe thành công!");
    } catch (error) {
      console.error("Error updating brand:", error);
      alert("❌ Không thể cập nhật hãng xe: " + error.message);
    }
  };

  const handleDeleteBrand = async (brandId) => {
    const bikesOfBrand = bikeTypes.filter((bt) => bt.brandId === brandId);
    if (bikesOfBrand.length > 0) {
      alert("⚠️ Không thể xóa hãng này vì còn xe thuộc hãng!");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa hãng xe này?")) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        alert("❌ Vui lòng đăng nhập lại");
        return;
      }

      const response = await fetch(
        `http://localhost:5168/api/Brand/DeleteBrand/${brandId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Brand deleted:", brandId);

      // Refresh brands list
      await fetchBrands();

      alert("✅ Đã xóa hãng xe!");
    } catch (error) {
      console.error("Error deleting brand:", error);
      alert("❌ Không thể xóa hãng xe: " + error.message);
    }
  };

  // Delete staff handler - call backend API and update local state
  const handleDeleteStaff = async (staffId, staffName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhân viên ${staffName}?`)) return;

    try {
      setDeletingStaffId(staffId);
      await adminService.deleteStaff(staffId);

      // remove from local state
      setStaff((prev) => prev.filter((s) => s.id !== staffId));
      alert("✅ Đã xóa nhân viên!");
    } catch (error) {
      console.error("Error deleting staff:", error);
      alert(error?.message || "Không thể xóa nhân viên. Vui lòng thử lại.");
    } finally {
      setDeletingStaffId(null);
    }
  };

  // Open edit modal with staff data
  const handleOpenEditStaff = (member) => {
    setEditingStaffId(member.id);
    setNewStaff({
      fullName: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      password: "", // leave empty unless admin wants to reset
      stationId: member.stationId || "",
      role: member.role || "",
      avatarFile: null,
      avatarPreview: member.avatar || null,
    });
    setApiErrors({});
    setShowAddStaffModal(true);
  };

  // Update staff handler
  const handleUpdateStaff = async () => {
    if (!editingStaffId) return;

    // basic validation (password optional on update)
    const errors = {};
    if (!newStaff.fullName || newStaff.fullName.trim().length === 0)
      errors.fullName = "Vui lòng nhập họ tên";
    if (!newStaff.email || newStaff.email.trim().length === 0)
      errors.email = "Vui lòng nhập email";
    const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
    if (newStaff.phone && !phoneRegex.test(newStaff.phone))
      errors.phone =
        "Vui lòng nhập đúng định dạng số điện thoại Việt Nam (0xxxxxxxxx)";

    if (Object.keys(errors).length > 0) {
      setApiErrors(errors);
      alert("⚠️ Vui lòng sửa lỗi trước khi lưu");
      return;
    }

    try {
      setCreatingStaff(true);
      const formData = new FormData();
      formData.append("FullName", newStaff.fullName);
      formData.append("Email", newStaff.email);
      if (newStaff.password) formData.append("Password", newStaff.password);
      formData.append("Phone", newStaff.phone || "");
      if (newStaff.stationId) formData.append("StationID", newStaff.stationId);
      if (newStaff.role) formData.append("Role", newStaff.role);
      if (newStaff.avatarFile)
        formData.append("AvatarPicture", newStaff.avatarFile);

      const result = await adminService.updateStaff(editingStaffId, formData);
      console.log("✅ updateStaff result:", result);

      // Refresh list and reset modal
      await fetchStaff();
      setShowAddStaffModal(false);
      setEditingStaffId(null);
      setNewStaff({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        stationId: "",
        role: "",
        avatarFile: null,
        avatarPreview: null,
      });
      setApiErrors({});
      alert("✅ Cập nhật nhân viên thành công!");
    } catch (err) {
      console.error("Error updating staff:", err);
      alert(err?.message || "Không thể cập nhật nhân viên. Vui lòng thử lại.");
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleViewBrandBikes = (brand) => {
    setSelectedBrand(brand);
    setViewMode("bikeTypes");
  };

  const handleAddBikeType = async () => {
    if (!newBikeType.name || !newBikeType.brandId || !newBikeType.pricePerDay) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc (tên, hãng, giá/ngày)");
      return;
    }

    if (!newBikeType.frontImg || !newBikeType.backImg) {
      alert("Vui lòng tải lên ảnh mặt trước và mặt sau của xe");
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        alert("❌ Vui lòng đăng nhập lại");
        return;
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append("BikeName", newBikeType.name);
      formData.append("BrandID", parseInt(newBikeType.brandId));
      formData.append("FrontImg", newBikeType.frontImg);
      formData.append("BackImg", newBikeType.backImg);
      formData.append("MaxSpeed", parseInt(newBikeType.maxSpeed) || 0);
      formData.append("MaxDistance", parseInt(newBikeType.range) || 0);
      formData.append("Description", newBikeType.description || "");
      formData.append("PricePerDay", parseFloat(newBikeType.pricePerDay));

      console.log("Sending bike data as FormData");

      const response = await fetch("http://localhost:5168/api/EVBike/AddBike", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type, browser will set it with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Bike created:", result);

      // Refresh brands list to update bike count
      await fetchBrands();
      // Refresh bikes list to show the new bike
      if (selectedBrand?.id) {
        await fetchBikes(selectedBrand.id);
      }

      setShowAddBikeTypeModal(false);
      setNewBikeType({
        name: "",
        brandId: "",
        description: "",
        pricePerHour: 0,
        pricePerDay: 0,
        batteryCapacity: 0,
        maxSpeed: 0,
        range: 0,
        frontImg: null,
        backImg: null,
      });
      alert("✅ Đã thêm loại xe mới thành công!");
    } catch (error) {
      console.error("Error adding bike:", error);
      alert("❌ Không thể thêm loại xe: " + error.message);
    }
  };

  const handleUpdateBikeType = () => {
    if (
      !selectedBikeType.name ||
      !selectedBikeType.brandId ||
      !selectedBikeType.pricePerHour ||
      !selectedBikeType.pricePerDay
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setBikeTypes(
      bikeTypes.map((bt) =>
        bt.id === selectedBikeType.id ? selectedBikeType : bt
      )
    );

    setShowEditBikeTypeModal(false);
    setSelectedBikeType(null);
    alert("✅ Đã cập nhật loại xe thành công!");
  };

  const handleDeleteBikeType = (bikeTypeId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa loại xe này?")) {
      const bikeType = bikeTypes.find((bt) => bt.id === bikeTypeId);
      setBikeTypes(bikeTypes.filter((bt) => bt.id !== bikeTypeId));

      // Update brand bike count
      if (bikeType) {
        setBrands(
          brands.map((b) =>
            b.id === bikeType.brandId
              ? { ...b, bikeCount: Math.max(0, (b.bikeCount || 0) - 1) }
              : b
          )
        );
      }

      alert("✅ Đã xóa loại xe!");
    }
  };

  const handleAddBikeInstance = async () => {
    if (!newBikeInstance.licensePlate || !newBikeInstance.stationId) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc (biển số xe, trạm)");
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        alert("❌ Vui lòng đăng nhập lại");
        return;
      }

      const requestBody = {
        bikeID: selectedBike.id,
        color: parseInt(newBikeInstance.color) || 0,
        stationID: parseInt(newBikeInstance.stationId),
        licensePlate: newBikeInstance.licensePlate,
      };

      console.log("Sending bike instance data:", requestBody);

      const response = await fetch(
        "http://localhost:5168/api/EVBike_Stocks/AddEVBikeStock",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Bike instance created:", result);

      // Refresh bike instances list
      if (selectedBike?.id) {
        await fetchBikeInstances(selectedBike.id);
      }

      setShowAddBikeInstanceModal(false);
      setNewBikeInstance({
        licensePlate: "",
        color: 0,
        modelYear: new Date().getFullYear(),
        stationId: "",
        status: 1,
      });
      alert("✅ Đã thêm xe mới thành công!");
    } catch (error) {
      console.error("Error adding bike instance:", error);
      alert("❌ Không thể thêm xe: " + error.message);
    }
  };

  // Logout function
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch customers from API
  useEffect(() => {
    if (activeTab === "customers") {
      fetchCustomers();
    }
  }, [activeTab]);

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    setCustomersError(null);

    try {
      // Use centralized adminService which handles auth headers
      const data = await adminService.getAllAccounts();

      console.log("Raw accounts response:", data);

      // Normalize response: accept Array, object with data/accounts, or array-like object
      let accountsArray = [];

      if (Array.isArray(data)) {
        accountsArray = data;
      } else if (data && Array.isArray(data.data)) {
        accountsArray = data.data;
      } else if (data && Array.isArray(data.accounts)) {
        accountsArray = data.accounts;
      } else if (data && typeof data === "object") {
        // Some APIs return objects with numeric keys (0,1,2...) — coerce to values
        const keys = Object.keys(data);
        const allNumericKeys =
          keys.length > 0 && keys.every((k) => String(Number(k)) === k);
        if (allNumericKeys) {
          accountsArray = Object.values(data);
        } else {
          // Fallback: keep as empty array to avoid UI errors
          accountsArray = [];
        }
      }

      // Log counts by role for debugging
      const roleCounts = accountsArray.reduce((acc, a) => {
        const r = a.roleID ?? a.roleId ?? a.role ?? "unknown";
        acc[r] = (acc[r] || 0) + 1;
        return acc;
      }, {});
      console.log(
        "Account role counts:",
        roleCounts,
        "total:",
        accountsArray.length
      );

      // Lọc chỉ lấy accounts có roleID = 1 (khách hàng)
      const customerAccounts = accountsArray.filter((account) => {
        // handle different property names
        const role = account.roleID ?? account.roleId ?? account.role;
        return Number(role) === 1;
      });

      console.log(
        "✅ Loaded customers (normalized):",
        customerAccounts.length,
        customerAccounts
      );
      setCustomers(customerAccounts);
    } catch (error) {
      console.error("❌ Error fetching customers:", error);
      setCustomersError(error.message || "Không thể tải khách hàng");

      // If the API returned 401 or token issues, prompt logout
      if (
        error.message &&
        (error.message.includes("401") || error.message.includes("đăng nhập"))
      ) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        handleLogout();
      }
    } finally {
      setCustomersLoading(false);
    }
  };

  // Fetch staff from API
  useEffect(() => {
    if (activeTab === "staff") {
      fetchStaff();
    }
  }, [activeTab]);

  const fetchStaff = async () => {
    console.log("🔵 fetchStaff called");
    setStaffLoading(true);
    setStaffError(null);
    // clear previous/mock staff while loading
    setStaff([]);

    try {
      const token = getToken();
      if (!token) {
        console.error("❌ No token found");
        throw new Error("Vui lòng đăng nhập lại");
      }

      console.log("📤 Fetching staff from API...");
      console.log("🔑 Using token:", token.substring(0, 20) + "...");

      const url = "http://localhost:5168/api/StationStaff/GetAllStaff";
      console.log("🌐 Calling URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📥 Staff API response status:", response.status);
      console.log(
        "📥 Staff API response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        }
        if (response.status === 404) {
          console.warn(
            "⚠️ API endpoint GetAllStaff not found (404). Backend may not be running or route not implemented."
          );
          throw new Error(
            "API GetAllStaff không tồn tại. Vui lòng kiểm tra backend hoặc liên hệ admin."
          );
        }
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("✅ Staff data received:", data);

      // Map API response to existing staff shape (fall back to sensible defaults)
      const mapped = Array.isArray(data)
        ? data.map((s) => ({
            id: s.staffID || s.id || s.accountID || s.accountId || 0,
            name: s.fullName || s.fullname || s.name || s.userName || "",
            stationId: s.stationID || s.stationId || s.station || "",
            station: s.stationName || s.station || "",
            role: s.roleName || s.role || (s.roleID ? `Role ${s.roleID}` : ""),
            performance: s.performance || 0,
            totalDeliveries: s.totalDeliveries || 0,
            phone: s.phone || s.phoneNumber || s.mobile || "",
            email: s.email || s.userEmail || s.emailAddress || "",
            avatar: s.avatarPicture || s.avatar || s.profilePicture || null,
          }))
        : [];

      console.log("✅ Mapped staff:", mapped);
      console.log(`✅ Total staff count: ${mapped.length}`);
      setStaff(mapped);
    } catch (error) {
      console.error("❌ Error fetching staff:", error);
      setStaffError(error.message || "Lỗi khi tải danh sách nhân viên");
      // clear staff on error to avoid showing stale/mock data
      setStaff([]);
    } finally {
      setStaffLoading(false);
      console.log("🏁 fetchStaff finished");
    }
  };

  // Open add-staff modal
  const handleOpenAddStaff = (stationId = "") => {
    setNewStaff({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      stationId: stationId,
      role: "",
      avatarFile: null,
      avatarPreview: null,
    });
    setApiErrors({});
    setShowAddStaffModal(true);
  };

  // Create staff via API
  const handleCreateStaff = async () => {
    console.log("🔵 handleCreateStaff called");
    console.log("Current newStaff:", newStaff);

    // client-side validation
    const errors = {};
    if (!newStaff.fullName || newStaff.fullName.trim().length === 0)
      errors.fullName = "Vui lòng nhập họ tên";
    if (!newStaff.email || newStaff.email.trim().length === 0)
      errors.email = "Vui lòng nhập email";
    if (!newStaff.password || newStaff.password.length < 6)
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    if (!newStaff.phone || newStaff.phone.trim().length === 0)
      errors.phone = "Vui lòng nhập số điện thoại";
    // Vietnamese phone number basic check
    const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
    if (newStaff.phone && !phoneRegex.test(newStaff.phone))
      errors.phone =
        "Vui lòng nhập đúng định dạng số điện thoại Việt Nam (0xxxxxxxxx)";
    if (!newStaff.avatarFile) errors.avatar = "Vui lòng tải ảnh đại diện";

    if (Object.keys(errors).length > 0) {
      console.log("❌ Validation errors:", errors);
      setApiErrors(errors);
      alert("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      console.log("⏳ Starting staff creation...");
      setCreatingStaff(true);
      setApiErrors({});
      const token = getToken();
      if (!token) {
        alert("❌ Vui lòng đăng nhập lại");
        setCreatingStaff(false);
        return;
      }

      // Backend expects multipart/form-data, NOT JSON
      const formData = new FormData();
      formData.append("FullName", newStaff.fullName);
      formData.append("Email", newStaff.email);
      formData.append("Password", newStaff.password);
      formData.append("Phone", newStaff.phone);
      if (newStaff.stationId) {
        formData.append("StationID", newStaff.stationId);
      }
      if (newStaff.role) {
        formData.append("Role", newStaff.role);
      }

      // Add avatar file directly (already a File object)
      if (newStaff.avatarFile) {
        formData.append("AvatarPicture", newStaff.avatarFile);
      }

      console.log("📤 Sending FormData with fields:");
      for (let [key, value] of formData.entries()) {
        if (key === "Password") {
          console.log(`  ${key}: ***`);
        } else if (key === "AvatarPicture") {
          console.log(
            `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      const resp = await fetch(
        "http://localhost:5168/api/StationStaff/CreateStaff",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Do NOT set Content-Type for FormData - browser will set it with boundary
          },
          body: formData,
        }
      );

      console.log("📥 Response status:", resp.status);

      if (!resp.ok) {
        // try to parse structured validation errors (common from ASP.NET)
        let bodyText = await resp.text();
        console.log("❌ Error response body:", bodyText);

        try {
          const json = JSON.parse(bodyText);
          if (json && json.errors) {
            const serverErrors = {};
            const errorMessages = [];

            Object.keys(json.errors).forEach((k) => {
              // join messages array if present
              const val = json.errors[k];
              const message = Array.isArray(val) ? val.join(" ") : String(val);
              serverErrors[k.toLowerCase()] = message;
              errorMessages.push(`${k}: ${message}`);
            });

            console.log("Server validation errors:", serverErrors);
            console.log("Error messages:", errorMessages);

            setApiErrors(serverErrors);
            setCreatingStaff(false);

            // Show detailed error in alert
            alert("❌ Có lỗi validation:\n\n" + errorMessages.join("\n"));
            return;
          }
        } catch (e) {
          console.log("Response is not JSON");
        }

        setCreatingStaff(false);
        alert(`❌ Lỗi: HTTP ${resp.status} - ${bodyText}`);
        throw new Error(`HTTP ${resp.status} - ${bodyText}`);
      }

      // Parse success response
      const result = await resp.json();
      console.log("✅ Success response:", result);

      // success: refresh staff list
      console.log("🔄 Refreshing staff list...");
      await fetchStaff();

      // Reset form
      setNewStaff({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        stationId: "",
        role: "",
        avatarFile: null,
        avatarPreview: null,
      });
      setApiErrors({});

      // Close modal
      setShowAddStaffModal(false);

      // Show success message
      console.log("✅ Staff added successfully!");
      alert("✅ Đã thêm nhân viên thành công!");
    } catch (err) {
      console.error("💥 Exception in handleCreateStaff:", err);
      alert("❌ Không thể thêm nhân viên: " + (err.message || err));
    } finally {
      setCreatingStaff(false);
      console.log("🏁 handleCreateStaff finished");
    }
  };

  // Handle avatar file selection
  const handleAvatarChange = (file) => {
    if (!file) {
      setNewStaff((s) => ({ ...s, avatarFile: null, avatarPreview: null }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setApiErrors((prev) => ({ ...prev, avatar: "Vui lòng chọn file ảnh" }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setApiErrors((prev) => ({
        ...prev,
        avatar: "Kích thước ảnh tối đa 5MB",
      }));
      return;
    }

    // Store file object and create preview URL
    const previewUrl = URL.createObjectURL(file);
    setNewStaff((s) => ({
      ...s,
      avatarFile: file,
      avatarPreview: previewUrl,
    }));

    // Clear avatar error if any
    setApiErrors((prev) => {
      const { avatar, ...rest } = prev;
      return rest;
    });

    console.log(
      "📸 Avatar file selected:",
      file.name,
      file.size,
      "bytes",
      file.type
    );
  };

  const getError = (keys) => {
    if (!apiErrors || Object.keys(apiErrors).length === 0) return null;

    for (const k of keys) {
      const lowerKey = k.toLowerCase();
      // Check both original key and lowercase version
      if (apiErrors[k]) {
        console.log(`Found error for key "${k}":`, apiErrors[k]);
        return apiErrors[k];
      }
      if (apiErrors[lowerKey]) {
        console.log(
          `Found error for lowercase key "${lowerKey}":`,
          apiErrors[lowerKey]
        );
        return apiErrors[lowerKey];
      }
    }

    // Debug: show what keys are available
    console.log(
      `No error found for keys [${keys.join(", ")}]. Available error keys:`,
      Object.keys(apiErrors)
    );
    return null;
  };

  // Fetch brands from API
  useEffect(() => {
    if (activeTab === "bikeTypes") {
      fetchBrands();
      // Reset to brands view when entering bikeTypes tab
      setViewMode("brands");
      setSelectedBrand(null);
      setSelectedBike(null);
      setBikeTypes([]); // Clear bikes list
      setBikeInstances([]); // Clear bike instances
    }
  }, [activeTab]);

  const fetchBrands = async () => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error("Vui lòng đăng nhập lại");
      }

      const response = await fetch(
        "http://localhost:5168/api/Brand/GetAllBrands",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Brands fetched:", data);

      // Map API data to match our state structure
      const mappedBrands = data.map((brand) => ({
        id: brand.brandID || brand.id,
        name: brand.brandName || brand.name,
        country: brand.country || "",
        description: brand.description || "",
        bikeCount: brand.bikeCount || 0,
      }));

      setBrands(mappedBrands);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchBikes = async (brandId = null) => {
    if (!brandId) {
      // If no brandId provided, clear the bikes list
      setBikeTypes([]);
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Vui lòng đăng nhập lại");
      }

      const response = await fetch(
        `http://localhost:5168/api/EVBike/GetBikesByBrandID/${brandId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        }
        if (response.status === 404) {
          // No bikes found for this brand, just set empty array
          setBikeTypes([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Bikes fetched for brand", brandId, ":", data);

      // Map API data to match our state structure
      const mappedBikes = data.map((bike) => ({
        id: bike.bikeID,
        name: bike.bikeName,
        brandId: bike.brandID,
        brandName: bike.brandName,
        frontImg: bike.frontImg,
        backImg: bike.backImg,
        maxSpeed: bike.maxSpeed,
        maxDistance: bike.maxDistance,
        timeRented: bike.timeRented,
        quantity: bike.quantity,
        description: bike.description,
        pricePerDay: bike.pricePerDay,
        // Keep these for backward compatibility
        range: bike.maxDistance,
      }));

      setBikeTypes(mappedBikes);
    } catch (error) {
      console.error("Error fetching bikes:", error);
      alert("Không thể tải danh sách xe: " + error.message);
    }
  };

  const fetchBikeInstances = async (bikeId = null) => {
    if (!bikeId) {
      setBikeInstances([]);
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Vui lòng đăng nhập lại");
      }

      const response = await fetch(
        `http://localhost:5168/api/EVBike_Stocks/GetStocksByBikeID/${bikeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        }
        if (response.status === 404) {
          // No bike instances found
          setBikeInstances([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Bike instances fetched for bike", bikeId, ":", data);

      // Map API data to match our state structure
      const mappedInstances = data.map((instance) => ({
        id: instance.stockID,
        bikeInstanceID: instance.stockID,
        bikeID: instance.bikeID,
        color: instance.color,
        stationID: instance.stationID,
        stationName: instance.stationName,
        licensePlate: instance.licensePlate,
        batteryCapacity: instance.batteryCapacity,
        status: instance.status,
      }));

      setBikeInstances(mappedInstances);
    } catch (error) {
      console.error("Error fetching bike instances:", error);
      alert("Không thể tải danh sách xe: " + error.message);
    }
  };

  // Get status badge and text
  const getStatusInfo = (status) => {
    switch (status) {
      case 0:
        return { text: "Pending", class: "status-pending", icon: "⏳" };
      case 1:
        return { text: "Active", class: "status-active", icon: "✅" };
      case 2:
        return { text: "Suspended", class: "status-suspended", icon: "🚫" };
      default:
        return { text: "Unknown", class: "status-unknown", icon: "❓" };
    }
  };

  // Get color name from color code
  const getColorName = (colorCode) => {
    const colors = {
      0: "Không xác định",
      1: "Trắng",
      2: "Đen",
      3: "Đỏ",
      4: "Xanh dương",
      5: "Xanh lá",
      6: "Vàng",
      7: "Xám",
      8: "Bạc",
    };
    return colors[colorCode] || "N/A";
  };

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    // Filter by search term
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      customer.fullName?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(searchTerm) ||
      customer.accountId?.toString().includes(searchTerm);

    // Filter by status
    const matchesStatus =
      statusFilter === "all" || customer.status === parseInt(statusFilter);

    return matchesSearch && matchesStatus;
  });

  // Station management functions
  const handleAddStation = () => {
    if (!newStation.name || !newStation.address) {
      alert("Vui lòng điền đầy đủ thông tin trạm");
      return;
    }

    const station = {
      id: `s${stations.length + 1}`,
      name: newStation.name,
      address: newStation.address,
      availableVehicles: 0,
      totalVehicles: parseInt(newStation.totalVehicles) || 0,
      chargingStations: parseInt(newStation.chargingStations) || 0,
      status: "active",
    };

    setStations([...stations, station]);
    setShowAddStationModal(false);
    setNewStation({
      name: "",
      address: "",
      totalVehicles: 0,
      chargingStations: 0,
    });
    alert("✅ Đã thêm trạm mới thành công!");
  };

  const handleViewStationDetail = (station) => {
    console.log("View station detail:", station);
    setSelectedStation(station);
    setShowStationDetailModal(true);
  };

  const handleEditStation = (station) => {
    console.log("Edit station:", station);
    setSelectedStation(station);
    setNewStation({
      name: station.name,
      address: station.address,
      totalVehicles: station.totalVehicles,
      chargingStations: station.chargingStations,
    });
    setShowEditStationModal(true);
  };

  const handleUpdateStation = () => {
    if (!newStation.name || !newStation.address) {
      alert("Vui lòng điền đầy đủ thông tin trạm");
      return;
    }

    setStations(
      stations.map((s) =>
        s.id === selectedStation.id
          ? {
              ...s,
              name: newStation.name,
              address: newStation.address,
              totalVehicles: parseInt(newStation.totalVehicles),
              chargingStations: parseInt(newStation.chargingStations),
            }
          : s
      )
    );

    setShowEditStationModal(false);
    setSelectedStation(null);
    setNewStation({
      name: "",
      address: "",
      totalVehicles: 0,
      chargingStations: 0,
    });
    alert("✅ Đã cập nhật thông tin trạm!");
  };

  const handleManageStationVehicles = (station) => {
    console.log("Manage station vehicles:", station);
    setSelectedStation(station);
    setShowStationVehiclesModal(true);
  };

  const handleManageStationStaff = (station) => {
    console.log("Manage station staff:", station);
    setSelectedStation(station);
    setShowStationStaffModal(true);
  };

  const handleDeleteStation = (stationId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa trạm này?")) {
      setStations(stations.filter((s) => s.id !== stationId));
      alert("✅ Đã xóa trạm!");
    }
  };

  // Vehicle handlers
  const handleAddVehicle = () => {
    setNewVehicle({
      name: "",
      brandId: "",
      modelYear: new Date().getFullYear(),
      color: "",
      licensePlate: "",
      batteryCapacity: 0,
      maxSpeed: 0,
      stationId: "",
      status: "available",
    });
    setShowAddVehicleModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setNewVehicle(vehicle);
    setShowEditVehicleModal(true);
  };

  const handleDeleteVehicle = (vehicleId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa xe này?")) {
      setVehicles(vehicles.filter((v) => v.id !== vehicleId));
      alert("✅ Đã xóa xe!");
    }
  };

  const handleSaveVehicle = () => {
    if (!newVehicle.name || !newVehicle.licensePlate || !newVehicle.stationId) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (selectedVehicle) {
      // Update existing vehicle
      setVehicles(
        vehicles.map((v) =>
          v.id === selectedVehicle.id ? { ...newVehicle, id: v.id } : v
        )
      );
      alert("✅ Đã cập nhật xe!");
      setShowEditVehicleModal(false);
    } else {
      // Add new vehicle
      const newId =
        vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.id)) + 1 : 1;
      setVehicles([...vehicles, { ...newVehicle, id: newId }]);
      alert("✅ Đã thêm xe mới!");
      setShowAddVehicleModal(false);
    }

    setSelectedVehicle(null);
  };

  const handleVehicleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <h2>Tổng quan hệ thống</h2>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">🏍️</div>
          <div className="stat-info">
            <h3>Tổng số xe</h3>
            <p className="stat-number">{stats.totalVehicles}</p>
            <span className="stat-detail">
              {stats.availableVehicles} xe khả dụng
            </span>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Đang cho thuê</h3>
            <p className="stat-number">{stats.activeRentals}</p>
            <span className="stat-detail">Hôm nay</span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Khách hàng</h3>
            <p className="stat-number">{stats.totalCustomers}</p>
            <span className="stat-detail">Tổng số</span>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>
              Doanh thu tháng {new Date().getMonth() + 1}/
              {new Date().getFullYear()}
            </h3>
            <p className="stat-number">
              {(stats.revenue / 1000000).toFixed(1)}M
            </p>
            <span className="stat-detail">VNĐ</span>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Doanh thu theo điểm</h3>
          <div className="bar-chart">
            {reports.revenueByStation.map((item, index) => (
              <div key={index} className="bar-item">
                <div className="bar-label">{item.station}</div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{ width: `${(item.revenue / 20000000) * 100}%` }}
                  ></div>
                </div>
                <div className="bar-value">
                  {(item.revenue / 1000000).toFixed(1)}M
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Giờ cao điểm</h3>
          <div className="peak-hours">
            {reports.peakHours.map((item, index) => (
              <div key={index} className="peak-item">
                <div className="peak-label">{item.hour}</div>
                <div className="peak-bar">
                  <div
                    className="peak-fill"
                    style={{ width: `${item.usage}%` }}
                  >
                    {item.usage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderVehicleManagement = () => {
    // Filter stations based on search and status
    const filteredStations = stations.filter((station) => {
      if (
        stationStatusFilter !== "all" &&
        station.status !== stationStatusFilter
      ) {
        return false;
      }
      if (stationSearchTerm) {
        const searchLower = stationSearchTerm.toLowerCase();
        const matchesSearch =
          station.name.toLowerCase().includes(searchLower) ||
          station.address.toLowerCase().includes(searchLower);
        console.log(
          "Search:",
          searchLower,
          "Station:",
          station.name,
          "Matches:",
          matchesSearch
        );
        return matchesSearch;
      }
      return true;
    });

    console.log(
      "Filter - Search term:",
      stationSearchTerm,
      "Status:",
      stationStatusFilter
    );
    console.log(
      "Total stations:",
      stations.length,
      "Filtered:",
      filteredStations.length
    );

    return (
      <div className="management-content">
        {staffLoading && (
          <div style={{ padding: "1rem 0", color: "#6b7280" }}>
            Đang tải danh sách nhân viên...
          </div>
        )}
        {staffError && (
          <div style={{ padding: "1rem 0", color: "#e11d48" }}>
            {staffError}
          </div>
        )}
        <div className="section-header">
          <h2>
            Quản lý trạm thuê xe{" "}
            <span
              style={{
                color: "#6b7280",
                fontSize: "0.9rem",
                fontWeight: "normal",
              }}
            >
              ({filteredStations.length} trạm)
            </span>
          </h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn-primary"
              onClick={() => {
                console.log("TEST: Opening detail modal for first station");
                if (stations.length > 0) {
                  handleViewStationDetail(stations[0]);
                }
              }}
              style={{ background: "#10b981" }}
            >
              🧪 Test Chi tiết
            </button>
            <button
              className="btn-primary"
              onClick={() => setShowAddStationModal(true)}
            >
              + Thêm trạm mới
            </button>
          </div>
        </div>

        <div className="filters">
          <select
            className="filter-select"
            value={stationStatusFilter}
            onChange={(e) => {
              console.log("Status filter changed to:", e.target.value);
              setStationStatusFilter(e.target.value);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="maintenance">Bảo trì</option>
          </select>
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm trạm..."
            value={stationSearchTerm}
            onChange={(e) => {
              console.log("Search term changed to:", e.target.value);
              setStationSearchTerm(e.target.value);
            }}
          />
        </div>

        {/* Stations Table */}
        <div className="stations-table-container">
          <table className="stations-table">
            <thead>
              <tr>
                <th>Trạm</th>
                <th>Địa chỉ</th>
                <th>Số lượng xe</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStations.map((station) => {
                const usageRate =
                  ((station.totalVehicles - station.availableVehicles) /
                    station.totalVehicles) *
                  100;
                return (
                  <tr key={station.id}>
                    <td>
                      <div className="station-name-cell">
                        <div className="station-icon">�</div>
                        <span>{station.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="address-cell">📍 {station.address}</div>
                    </td>
                    <td>
                      <div className="vehicle-count-cell">
                        <span className="count-value">
                          {station.availableVehicles}/{station.totalVehicles}
                        </span>
                        <div className="mini-progress-bar">
                          <div
                            className="mini-progress-fill"
                            style={{
                              width: `${usageRate}%`,
                              backgroundColor:
                                station.availableVehicles < 5
                                  ? "#f44336"
                                  : station.availableVehicles < 10
                                  ? "#ff9800"
                                  : "#4caf50",
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${station.status}`}>
                        {station.status === "active"
                          ? "Hoạt động"
                          : "Không hoạt động"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-table-action btn-view"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(
                              "Chi tiết button clicked for station:",
                              station
                            );
                            handleViewStationDetail(station);
                          }}
                          title="Chi tiết"
                        >
                          📊
                        </button>
                        <button
                          className="btn-table-action btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(
                              "Sửa button clicked for station:",
                              station
                            );
                            handleEditStation(station);
                          }}
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-table-action btn-manage"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(
                              "Quản lý nhân viên button clicked for station:",
                              station
                            );
                            handleManageStationStaff(station);
                          }}
                          title="Quản lý nhân viên"
                        >
                          👥
                        </button>
                        <button
                          className="btn-table-action btn-manage"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(
                              "Quản lý xe button clicked for station:",
                              station
                            );
                            handleViewStationVehicles(station);
                          }}
                          title="Quản lý xe"
                        >
                          🚗
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStations.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#6b7280",
                    }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                      🔍
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "500" }}>
                      Không tìm thấy trạm nào
                    </div>
                    <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                      Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Station Modal */}
        {showAddStationModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowAddStationModal(false)}
          >
            <div
              className="modal-content add-station-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>➕ Thêm trạm thuê xe mới</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowAddStationModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Tên trạm <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newStation.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Trạm EV Quận 1"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Địa chỉ <span className="required">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={newStation.address}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ đầy đủ của trạm"
                    className="form-textarea"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số lượng xe</label>
                    <input
                      type="number"
                      name="totalVehicles"
                      value={newStation.totalVehicles}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="form-input"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Số trạm sạc</label>
                    <input
                      type="number"
                      name="chargingStations"
                      value={newStation.chargingStations}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="form-input"
                      min="0"
                    />
                  </div>
                </div>

                <div className="info-note">
                  <span className="note-icon">💡</span>
                  <p>
                    Thông tin về số lượng xe và trạm sạc có thể cập nhật sau khi
                    tạo trạm.
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setShowAddStationModal(false)}
                >
                  Hủy
                </button>
                <button className="btn-confirm" onClick={handleAddStation}>
                  Thêm trạm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Station Modal */}
        {showEditStationModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowEditStationModal(false)}
          >
            <div
              className="modal-content add-station-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>✏️ Sửa thông tin trạm</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowEditStationModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Tên trạm <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newStation.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Trạm EV Quận 1"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Địa chỉ <span className="required">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={newStation.address}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ đầy đủ của trạm"
                    className="form-textarea"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số lượng xe</label>
                    <input
                      type="number"
                      name="totalVehicles"
                      value={newStation.totalVehicles}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="form-input"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Số trạm sạc</label>
                    <input
                      type="number"
                      name="chargingStations"
                      value={newStation.chargingStations}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="form-input"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setShowEditStationModal(false)}
                >
                  Hủy
                </button>
                <button className="btn-confirm" onClick={handleUpdateStation}>
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Station Detail Modal */}
        {console.log(
          "showStationDetailModal:",
          showStationDetailModal,
          "selectedStation:",
          selectedStation
        )}
        {showStationDetailModal && selectedStation && (
          <div
            className="modal-overlay"
            onClick={() => setShowStationDetailModal(false)}
          >
            <div
              className="modal-content station-detail-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>📊 Chi tiết trạm</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowStationDetailModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="station-detail-info">
                  <h3>⚡ {selectedStation.name}</h3>
                  <div className="detail-row">
                    <span className="detail-label">📍 Địa chỉ:</span>
                    <span className="detail-value">
                      {selectedStation.address}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🏍️ Tổng số xe:</span>
                    <span className="detail-value">
                      {selectedStation.totalVehicles} xe
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">✅ Xe khả dụng:</span>
                    <span className="detail-value">
                      {selectedStation.availableVehicles} xe
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🚴 Xe đang cho thuê:</span>
                    <span className="detail-value">
                      {selectedStation.totalVehicles -
                        selectedStation.availableVehicles}{" "}
                      xe
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🔌 Trạm sạc:</span>
                    <span className="detail-value">
                      {selectedStation.chargingStations} trạm
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📊 Trạng thái:</span>
                    <span className={`status-badge ${selectedStation.status}`}>
                      {selectedStation.status === "active"
                        ? "✅ Hoạt động"
                        : "🚫 Không hoạt động"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📈 Tỷ lệ sử dụng:</span>
                    <span className="detail-value">
                      {(
                        ((selectedStation.totalVehicles -
                          selectedStation.availableVehicles) /
                          selectedStation.totalVehicles) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setShowStationDetailModal(false)}
                >
                  Đóng
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShowStationDetailModal(false);
                    handleEditStation(selectedStation);
                  }}
                >
                  ✏️ Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Station Vehicles Management Modal */}
        {showStationVehiclesModal && selectedStation && (
          <div
            className="modal-overlay"
            onClick={() => setShowStationVehiclesModal(false)}
          >
            <div
              className="modal-content station-vehicles-modal"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "1000px" }}
            >
              <div className="modal-header">
                <h2>🏍️ Quản lý xe tại {selectedStation.name}</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowStationVehiclesModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="vehicles-info">
                  <div className="info-summary">
                    <div className="summary-item">
                      <span className="summary-icon">🏍️</span>
                      <div>
                        <p className="summary-label">Tổng số xe</p>
                        <p className="summary-number">
                          {
                            vehicles.filter(
                              (v) => v.stationId === selectedStation.id
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                    <div className="summary-item">
                      <span className="summary-icon">✅</span>
                      <div>
                        <p className="summary-label">Khả dụng</p>
                        <p className="summary-number">
                          {
                            vehicles.filter(
                              (v) =>
                                v.stationId === selectedStation.id &&
                                v.status === "available"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                    <div className="summary-item">
                      <span className="summary-icon">🚴</span>
                      <div>
                        <p className="summary-label">Đang thuê</p>
                        <p className="summary-number">
                          {
                            vehicles.filter(
                              (v) =>
                                v.stationId === selectedStation.id &&
                                v.status === "rented"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="vehicles-actions"
                    style={{ marginTop: "1.5rem" }}
                  >
                    <button
                      className="btn-primary"
                      onClick={() => {
                        setNewVehicle({
                          name: "",
                          brandId: "",
                          modelYear: new Date().getFullYear(),
                          color: "",
                          licensePlate: "",
                          batteryCapacity: 0,
                          maxSpeed: 0,
                          stationId: selectedStation.id,
                          status: "available",
                        });
                        setShowAddVehicleModal(true);
                      }}
                    >
                      ➕ Thêm xe mới
                    </button>
                  </div>

                  {/* Vehicles Table */}
                  <div
                    className="data-table"
                    style={{
                      marginTop: "1.5rem",
                      maxHeight: "400px",
                      overflow: "auto",
                    }}
                  >
                    <table>
                      <thead>
                        <tr>
                          <th>Tên xe</th>
                          <th>Biển số</th>
                          <th>Màu sắc</th>
                          <th>Pin (Ah)</th>
                          <th>Tốc độ (km/h)</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles
                          .filter((v) => v.stationId === selectedStation.id)
                          .map((vehicle) => (
                            <tr key={vehicle.id}>
                              <td>{vehicle.name}</td>
                              <td>
                                <strong>{vehicle.licensePlate}</strong>
                              </td>
                              <td>{vehicle.color}</td>
                              <td>{vehicle.batteryCapacity} Ah</td>
                              <td>{vehicle.maxSpeed} km/h</td>
                              <td>
                                <span
                                  className={`status-badge ${vehicle.status}`}
                                >
                                  {vehicle.status === "available"
                                    ? "✅ Khả dụng"
                                    : vehicle.status === "rented"
                                    ? "🚴 Đang thuê"
                                    : vehicle.status === "maintenance"
                                    ? "🔧 Bảo trì"
                                    : "❌ Hỏng"}
                                </span>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    className="btn-table-action btn-edit"
                                    onClick={() => handleEditVehicle(vehicle)}
                                    title="Sửa"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="btn-table-action btn-delete"
                                    onClick={() =>
                                      handleDeleteVehicle(vehicle.id)
                                    }
                                    title="Xóa"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {vehicles.filter(
                          (v) => v.stationId === selectedStation.id
                        ).length === 0 && (
                          <tr>
                            <td
                              colSpan="7"
                              style={{
                                textAlign: "center",
                                padding: "2rem",
                                color: "#6b7280",
                              }}
                            >
                              <div style={{ fontSize: "2rem" }}>🏍️</div>
                              <p>Chưa có xe nào tại trạm này</p>
                              <p
                                style={{
                                  fontSize: "0.9rem",
                                  marginTop: "0.5rem",
                                }}
                              >
                                Nhấn "Thêm xe mới" để bắt đầu
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setShowStationVehiclesModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Station Staff Management Modal */}
        {showStationStaffModal && selectedStation && (
          <div
            className="modal-overlay"
            onClick={() => setShowStationStaffModal(false)}
          >
            <div
              className="modal-content station-staff-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>👥 Quản lý nhân viên tại {selectedStation.name}</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowStationStaffModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="staff-info">
                  {(() => {
                    const stationStaff = staff.filter(
                      (s) => s.stationId === selectedStation.id
                    );
                    const avgPerformance =
                      stationStaff.length > 0
                        ? (
                            stationStaff.reduce(
                              (sum, s) => sum + s.performance,
                              0
                            ) / stationStaff.length
                          ).toFixed(0)
                        : 0;

                    return (
                      <>
                        <div className="info-summary">
                          <div className="summary-item">
                            <span className="summary-icon">👥</span>
                            <div>
                              <p className="summary-label">Tổng nhân viên</p>
                              <p className="summary-number">
                                {stationStaff.length}
                              </p>
                            </div>
                          </div>
                          <div className="summary-item">
                            <span className="summary-icon">📊</span>
                            <div>
                              <p className="summary-label">Hiệu suất TB</p>
                              <p className="summary-number">
                                {avgPerformance}%
                              </p>
                            </div>
                          </div>
                          <div className="summary-item">
                            <span className="summary-icon">🚚</span>
                            <div>
                              <p className="summary-label">Tổng giao/nhận</p>
                              <p className="summary-number">
                                {stationStaff.reduce(
                                  (sum, s) => sum + s.totalDeliveries,
                                  0
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="staff-list-section">
                          <h3>Danh sách nhân viên</h3>
                          {stationStaff.length === 0 ? (
                            <div className="empty-state">
                              <p>⚠️ Chưa có nhân viên nào tại trạm này</p>
                            </div>
                          ) : (
                            <div className="staff-table-wrapper">
                              <table className="staff-table">
                                <thead>
                                  <tr>
                                    <th>Họ tên</th>
                                    <th>Vai trò</th>
                                    <th>Hiệu suất</th>
                                    <th>Số lượt</th>
                                    <th>Thao tác</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {stationStaff.map((member) => (
                                    <tr key={member.id}>
                                      <td className="staff-name">
                                        {member.name}
                                      </td>
                                      <td>{member.role}</td>
                                      <td>
                                        <div className="performance-bar">
                                          <div
                                            className="performance-fill"
                                            style={{
                                              width: `${member.performance}%`,
                                              backgroundColor:
                                                member.performance > 90
                                                  ? "#4caf50"
                                                  : member.performance > 70
                                                  ? "#ff9800"
                                                  : "#f44336",
                                            }}
                                          >
                                            {member.performance}%
                                          </div>
                                        </div>
                                      </td>
                                      <td>{member.totalDeliveries}</td>
                                      <td>
                                        <div className="table-actions">
                                          <button
                                            className="btn-action btn-edit"
                                            title="Chỉnh sửa"
                                            onClick={() => {
                                              setShowStationStaffModal(false);
                                              handleOpenEditStaff(member);
                                            }}
                                          >
                                            ✏️
                                          </button>
                                          <button
                                            className="btn-action btn-delete"
                                            title="Xóa"
                                            onClick={() =>
                                              handleDeleteStaff(
                                                member.id,
                                                member.name
                                              )
                                            }
                                            disabled={
                                              deletingStaffId === member.id
                                            }
                                            style={{
                                              opacity:
                                                deletingStaffId === member.id
                                                  ? 0.5
                                                  : 1,
                                              cursor:
                                                deletingStaffId === member.id
                                                  ? "not-allowed"
                                                  : "pointer",
                                            }}
                                          >
                                            {deletingStaffId === member.id
                                              ? "⏳"
                                              : "🗑️"}
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        <div className="staff-actions">
                          <button
                            className="btn-primary btn-full-width"
                            onClick={() => {
                              setShowStationStaffModal(false);
                              setActiveTab("staff");
                            }}
                          >
                            👥 Đi đến Quản lý toàn bộ nhân viên
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setShowStationStaffModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Vehicle Modal */}
        {showAddVehicleModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowAddVehicleModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>➕ Thêm xe mới</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowAddVehicleModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Tên xe *</label>
                  <input
                    type="text"
                    name="name"
                    value={newVehicle.name}
                    onChange={handleVehicleInputChange}
                    placeholder="VD: Honda Vision 2024"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Hãng xe *</label>
                    <select
                      name="brandId"
                      value={newVehicle.brandId}
                      onChange={handleVehicleInputChange}
                      required
                    >
                      <option value="">-- Chọn hãng --</option>
                      <option value="1">Honda</option>
                      <option value="2">Yamaha</option>
                      <option value="3">Vinfast</option>
                      <option value="4">Pega</option>
                      <option value="5">Yadea</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Năm sản xuất</label>
                    <input
                      type="number"
                      name="modelYear"
                      value={newVehicle.modelYear}
                      onChange={handleVehicleInputChange}
                      min="2000"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Màu sắc</label>
                    <input
                      type="text"
                      name="color"
                      value={newVehicle.color}
                      onChange={handleVehicleInputChange}
                      placeholder="VD: Đỏ, Xanh, Trắng"
                    />
                  </div>

                  <div className="form-group">
                    <label>Biển số xe *</label>
                    <input
                      type="text"
                      name="licensePlate"
                      value={newVehicle.licensePlate}
                      onChange={handleVehicleInputChange}
                      placeholder="VD: 29A-12345"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Dung lượng pin (Ah)</label>
                    <input
                      type="number"
                      name="batteryCapacity"
                      value={newVehicle.batteryCapacity}
                      onChange={handleVehicleInputChange}
                      min="0"
                      step="0.1"
                      placeholder="VD: 12.5"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tốc độ tối đa (km/h)</label>
                    <input
                      type="number"
                      name="maxSpeed"
                      value={newVehicle.maxSpeed}
                      onChange={handleVehicleInputChange}
                      min="0"
                      placeholder="VD: 45"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Trạm *</label>
                    <select
                      name="stationId"
                      value={newVehicle.stationId}
                      onChange={handleVehicleInputChange}
                      required
                    >
                      <option value="">-- Chọn trạm --</option>
                      {stations.map((station) => (
                        <option key={station.id} value={station.id}>
                          {station.name} - {station.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                      name="status"
                      value={newVehicle.status}
                      onChange={handleVehicleInputChange}
                    >
                      <option value="available">✅ Khả dụng</option>
                      <option value="rented">🚴 Đang thuê</option>
                      <option value="maintenance">🔧 Bảo trì</option>
                      <option value="broken">❌ Hỏng</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setShowAddVehicleModal(false)}
                >
                  Hủy
                </button>
                <button className="btn-primary" onClick={handleSaveVehicle}>
                  ➕ Thêm xe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Vehicle Modal */}
        {showEditVehicleModal && selectedVehicle && (
          <div
            className="modal-overlay"
            onClick={() => setShowEditVehicleModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>✏️ Chỉnh sửa thông tin xe</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowEditVehicleModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Tên xe *</label>
                  <input
                    type="text"
                    name="name"
                    value={newVehicle.name}
                    onChange={handleVehicleInputChange}
                    placeholder="VD: Honda Vision 2024"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Hãng xe *</label>
                    <select
                      name="brandId"
                      value={newVehicle.brandId}
                      onChange={handleVehicleInputChange}
                      required
                    >
                      <option value="">-- Chọn hãng --</option>
                      <option value="1">Honda</option>
                      <option value="2">Yamaha</option>
                      <option value="3">Vinfast</option>
                      <option value="4">Pega</option>
                      <option value="5">Yadea</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Năm sản xuất</label>
                    <input
                      type="number"
                      name="modelYear"
                      value={newVehicle.modelYear}
                      onChange={handleVehicleInputChange}
                      min="2000"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Màu sắc</label>
                    <input
                      type="text"
                      name="color"
                      value={newVehicle.color}
                      onChange={handleVehicleInputChange}
                      placeholder="VD: Đỏ, Xanh, Trắng"
                    />
                  </div>

                  <div className="form-group">
                    <label>Biển số xe *</label>
                    <input
                      type="text"
                      name="licensePlate"
                      value={newVehicle.licensePlate}
                      onChange={handleVehicleInputChange}
                      placeholder="VD: 29A-12345"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Dung lượng pin (Ah)</label>
                    <input
                      type="number"
                      name="batteryCapacity"
                      value={newVehicle.batteryCapacity}
                      onChange={handleVehicleInputChange}
                      min="0"
                      step="0.1"
                      placeholder="VD: 12.5"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tốc độ tối đa (km/h)</label>
                    <input
                      type="number"
                      name="maxSpeed"
                      value={newVehicle.maxSpeed}
                      onChange={handleVehicleInputChange}
                      min="0"
                      placeholder="VD: 45"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Trạm *</label>
                    <select
                      name="stationId"
                      value={newVehicle.stationId}
                      onChange={handleVehicleInputChange}
                      required
                    >
                      <option value="">-- Chọn trạm --</option>
                      {stations.map((station) => (
                        <option key={station.id} value={station.id}>
                          {station.name} - {station.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                      name="status"
                      value={newVehicle.status}
                      onChange={handleVehicleInputChange}
                    >
                      <option value="available">✅ Khả dụng</option>
                      <option value="rented">🚴 Đang thuê</option>
                      <option value="maintenance">🔧 Bảo trì</option>
                      <option value="broken">❌ Hỏng</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setShowEditVehicleModal(false)}
                >
                  Hủy
                </button>
                <button className="btn-primary" onClick={handleSaveVehicle}>
                  💾 Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCustomerManagement = () => (
    <div className="management-content">
      <div className="section-header">
        <h2>👥 Quản lý khách hàng</h2>
        <div className="header-actions">
          <button
            className="btn-refresh"
            onClick={fetchCustomers}
            disabled={customersLoading}
          >
            {customersLoading ? "🔄 Đang tải..." : "🔄 Làm mới"}
          </button>
          <button className="btn-primary">📊 Xuất báo cáo</button>
        </div>
      </div>

      <div className="filters">
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="0">⏳ Pending</option>
          <option value="1">✅ Active</option>
          <option value="2">🚫 Suspended</option>
        </select>
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm theo tên, email, SĐT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {customersError && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <span>{customersError}</span>
          <button onClick={fetchCustomers}>Thử lại</button>
        </div>
      )}

      {customersLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải danh sách khách hàng...</p>
        </div>
      ) : (
        <>
          <div className="stats-summary">
            <div className="summary-item">
              <span className="summary-label">Tổng khách hàng:</span>
              <span className="summary-value">{customers.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">⏳ Pending:</span>
              <span className="summary-value pending">
                {customers.filter((c) => c.status === 0).length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">✅ Active:</span>
              <span className="summary-value active">
                {customers.filter((c) => c.status === 1).length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">🚫 Suspended:</span>
              <span className="summary-value suspended">
                {customers.filter((c) => c.status === 2).length}
              </span>
            </div>
          </div>

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Avatar</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Lịch sử thuê</th>
                  <th>Mức độ rủi ro</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="empty-state">
                      {searchTerm || statusFilter !== "all"
                        ? "🔍 Không tìm thấy khách hàng phù hợp"
                        : "📭 Chưa có khách hàng nào"}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const statusInfo = getStatusInfo(customer.status);
                    // Calculate rental history and risk level (mock data for now)
                    const rentalCount = Math.floor(Math.random() * 20);
                    const violationCount = Math.floor(Math.random() * 5);
                    const damageCount = Math.floor(Math.random() * 3);
                    const riskLevel =
                      violationCount + damageCount > 3
                        ? "high"
                        : violationCount + damageCount > 1
                        ? "medium"
                        : "low";
                    const riskInfo = {
                      high: { label: "Cao", icon: "🔴", color: "#ef4444" },
                      medium: {
                        label: "Trung bình",
                        icon: "🟡",
                        color: "#f59e0b",
                      },
                      low: { label: "Thấp", icon: "🟢", color: "#10b981" },
                    };

                    return (
                      <tr key={customer.accountId}>
                        <td>#{customer.accountId}</td>
                        <td>
                          <div className="avatar-cell">
                            {customer.avatar ? (
                              <img
                                src={customer.avatar}
                                alt={customer.fullName}
                                className="customer-avatar"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/40?text=N/A";
                                }}
                              />
                            ) : (
                              <div className="avatar-placeholder">
                                {customer.fullName?.charAt(0).toUpperCase() ||
                                  "?"}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="customer-name">
                          <div className="name-cell">
                            <span className="name">
                              {customer.fullName || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="customer-email">{customer.email}</td>
                        <td>{customer.phone || "N/A"}</td>
                        <td>
                          <div style={{ textAlign: "center" }}>
                            <div
                              style={{
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                color: "#3b82f6",
                              }}
                            >
                              {rentalCount}
                            </div>
                            <div
                              style={{ fontSize: "0.75rem", color: "#6b7280" }}
                            >
                              {violationCount > 0 &&
                                `⚠️ ${violationCount} vi phạm`}
                              {damageCount > 0 && ` 🔧 ${damageCount} hư hỏng`}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className="risk-badge"
                            style={{
                              background: riskInfo[riskLevel].color + "20",
                              color: riskInfo[riskLevel].color,
                              padding: "0.25rem 0.75rem",
                              borderRadius: "12px",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            {riskInfo[riskLevel].icon}{" "}
                            {riskInfo[riskLevel].label}
                          </span>
                        </td>
                        <td className="date-cell">
                          {customer.createdAt
                            ? new Date(customer.createdAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </td>
                        <td>
                          <span className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.icon} {statusInfo.text}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-view"
                              title="Xem lịch sử thuê"
                            >
                              📋
                            </button>
                            <button
                              className="btn-action btn-view"
                              title="Xem chi tiết"
                            >
                              👁️
                            </button>
                            {customer.status === 1 && (
                              <button
                                className="btn-action btn-suspend"
                                title="Khóa tài khoản"
                              >
                                🚫
                              </button>
                            )}
                            {customer.status === 2 && (
                              <button
                                className="btn-action btn-activate"
                                title="Kích hoạt"
                              >
                                ✅
                              </button>
                            )}
                            {customer.status === 0 && (
                              <button
                                className="btn-action btn-approve"
                                title="Phê duyệt"
                              >
                                ✔️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  const renderStaffManagement = () => {
    // Show loading state
    if (staffLoading) {
      return (
        <div className="management-content">
          <div className="section-header">
            <h2>Quản lý nhân viên</h2>
          </div>
          <div
            style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "500" }}>
              Đang tải danh sách nhân viên...
            </div>
          </div>
        </div>
      );
    }

    // Show error state
    if (staffError) {
      return (
        <div className="management-content">
          <div className="section-header">
            <h2>Quản lý nhân viên</h2>
            <button
              className="btn-primary"
              onClick={() => handleOpenAddStaff()}
            >
              + Thêm nhân viên
            </button>
          </div>
          <div
            style={{ textAlign: "center", padding: "3rem", color: "#ef4444" }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "500",
                marginBottom: "1rem",
              }}
            >
              {staffError}
            </div>
            <button className="btn-primary" onClick={fetchStaff}>
              🔄 Thử lại
            </button>
          </div>
        </div>
      );
    }

    // Filter staff based on search and filters
    const filteredStaff = staff.filter((member) => {
      // Filter by station
      if (
        staffStationFilter !== "all" &&
        member.stationId !== staffStationFilter
      ) {
        return false;
      }

      // Filter by role
      if (staffRoleFilter !== "all" && member.role !== staffRoleFilter) {
        return false;
      }

      // Filter by search term
      if (staffSearchTerm) {
        const searchLower = staffSearchTerm.toLowerCase();
        return (
          member.name.toLowerCase().includes(searchLower) ||
          member.station.toLowerCase().includes(searchLower) ||
          member.role.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    // Get unique stations and roles for dropdowns
    const uniqueStations = [
      ...new Set(staff.map((s) => ({ id: s.stationId, name: s.station }))),
    ];
    const uniqueRoles = [...new Set(staff.map((s) => s.role))];

    return (
      <div className="management-content">
        <div className="section-header">
          <h2>
            Quản lý nhân viên{" "}
            <span
              style={{
                color: "#6b7280",
                fontSize: "0.9rem",
                fontWeight: "normal",
              }}
            >
              ({filteredStaff.length} nhân viên)
            </span>
          </h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn-primary"
              onClick={() => {
                console.log("Test - Current filters:", {
                  staffSearchTerm,
                  staffStationFilter,
                  staffRoleFilter,
                });
                alert("Search: " + staffSearchTerm);
              }}
              style={{ background: "#10b981" }}
            >
              🧪 Test Filters
            </button>
            <button
              className="btn-primary"
              onClick={() => handleOpenAddStaff()}
            >
              + Thêm nhân viên
            </button>
          </div>
        </div>

        <div className="filters">
          <select
            className="filter-select"
            value={staffStationFilter}
            onChange={(e) => {
              console.log("Staff station filter changed to:", e.target.value);
              setStaffStationFilter(e.target.value);
            }}
          >
            <option value="all">Tất cả điểm</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={staffRoleFilter}
            onChange={(e) => {
              console.log("Staff role filter changed to:", e.target.value);
              setStaffRoleFilter(e.target.value);
            }}
          >
            <option value="all">Tất cả vai trò</option>
            {uniqueRoles.map((role, index) => (
              <option key={index} value={role}>
                {role}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm nhân viên..."
            value={staffSearchTerm}
            onChange={(e) => {
              console.log("Staff search term changed to:", e.target.value);
              setStaffSearchTerm(e.target.value);
            }}
          />
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Avatar</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Trạm làm việc</th>
                <th>Vai trò</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => (
                <tr key={member.id}>
                  <td>#{member.id}</td>
                  <td>
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #e2e8f0",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "#0baf8c",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          margin: "0 auto",
                        }}
                      >
                        {member.name
                          ? member.name.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                    )}
                  </td>
                  <td className="staff-name">
                    {member.name || (
                      <span style={{ color: "#6b7280", fontStyle: "italic" }}>
                        Chưa có tên
                      </span>
                    )}
                  </td>
                  <td>
                    {member.email || (
                      <span style={{ color: "#6b7280", fontStyle: "italic" }}>
                        Chưa có email
                      </span>
                    )}
                  </td>
                  <td>
                    {member.phone || (
                      <span style={{ color: "#6b7280", fontStyle: "italic" }}>
                        Chưa có SĐT
                      </span>
                    )}
                  </td>
                  <td>
                    {member.station || (
                      <span style={{ color: "#6b7280", fontStyle: "italic" }}>
                        Chưa phân trạm
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        background: "#eff6ff",
                        color: "#3b82f6",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                      }}
                    >
                      {member.role || "N/A"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-action"
                      onClick={() => handleOpenEditStaff(member)}
                      style={{ background: "#3b82f6" }}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="btn-action"
                      onClick={() => handleDeleteStaff(member.id, member.name)}
                      disabled={deletingStaffId === member.id}
                      style={{
                        background: "#ef4444",
                        opacity: deletingStaffId === member.id ? 0.5 : 1,
                        cursor:
                          deletingStaffId === member.id
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {deletingStaffId === member.id ? "⏳" : "🗑️"} Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#6b7280",
                    }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                      🔍
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "500" }}>
                      Không tìm thấy nhân viên nào
                    </div>
                    <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                      Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDeliveryHistory = () => {
    // Mock delivery history data
    const deliveryHistory = [
      {
        id: 1,
        type: "pickup",
        customer: "Nguyễn Văn A",
        bike: "VinFast Klara S",
        station: "Trạm EV Công Viên Tao Đàn",
        staff: "Phạm Văn D",
        time: "2025-10-28 08:30",
        status: "completed",
      },
      {
        id: 2,
        type: "return",
        customer: "Trần Thị B",
        bike: "DatBike Weaver 200",
        station: "Trạm EV Bờ Sông Sài Gòn",
        staff: "Hoàng Thị E",
        time: "2025-10-28 09:15",
        status: "completed",
      },
      {
        id: 3,
        type: "pickup",
        customer: "Lê Văn C",
        bike: "VinFast Feliz S",
        station: "Trạm EV Trung Tâm Quận 1",
        staff: "Võ Văn F",
        time: "2025-10-28 10:00",
        status: "in_progress",
      },
      {
        id: 4,
        type: "return",
        customer: "Phạm Thị D",
        bike: "VinFast Klara S",
        station: "Trạm EV Khu Công Nghệ Cao",
        staff: "Trần Văn G",
        time: "2025-10-28 10:30",
        status: "pending",
      },
      {
        id: 5,
        type: "pickup",
        customer: "Hoàng Văn E",
        bike: "DatBike Weaver 200",
        station: "Trạm EV Sân Bay Tân Sơn Nhất",
        staff: "Nguyễn Thị H",
        time: "2025-10-28 11:00",
        status: "completed",
      },
    ];

    const typeInfo = {
      pickup: { label: "Giao xe", icon: "🚀", color: "#3b82f6" },
      return: { label: "Nhận xe", icon: "🏁", color: "#10b981" },
    };

    const statusInfo = {
      completed: { label: "Hoàn thành", icon: "✅", color: "#10b981" },
      in_progress: { label: "Đang thực hiện", icon: "⏳", color: "#f59e0b" },
      pending: { label: "Chờ xử lý", icon: "📋", color: "#6b7280" },
    };

    return (
      <div className="management-content">
        <div className="section-header">
          <h2>🚚 Lịch sử giao/nhận xe</h2>
          <div className="header-actions">
            <button className="btn-primary">📊 Xuất báo cáo</button>
          </div>
        </div>

        <div className="filters">
          <select className="filter-select">
            <option value="all">Tất cả loại</option>
            <option value="pickup">Giao xe</option>
            <option value="return">Nhận xe</option>
          </select>
          <select className="filter-select">
            <option value="all">Tất cả trạm</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
          <select className="filter-select">
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Hoàn thành</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="pending">Chờ xử lý</option>
          </select>
          <input
            type="date"
            className="filter-select"
            defaultValue={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="stats-summary">
          <div className="summary-item">
            <span className="summary-label">Tổng giao dịch hôm nay:</span>
            <span className="summary-value">{deliveryHistory.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">🚀 Giao xe:</span>
            <span className="summary-value" style={{ color: "#3b82f6" }}>
              {deliveryHistory.filter((d) => d.type === "pickup").length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">🏁 Nhận xe:</span>
            <span className="summary-value" style={{ color: "#10b981" }}>
              {deliveryHistory.filter((d) => d.type === "return").length}
            </span>
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Loại</th>
                <th>Khách hàng</th>
                <th>Xe</th>
                <th>Trạm</th>
                <th>Nhân viên</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {deliveryHistory.map((record) => (
                <tr key={record.id}>
                  <td>#{record.id}</td>
                  <td>
                    <span
                      style={{
                        background: typeInfo[record.type].color + "20",
                        color: typeInfo[record.type].color,
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      {typeInfo[record.type].icon} {typeInfo[record.type].label}
                    </span>
                  </td>
                  <td>{record.customer}</td>
                  <td>{record.bike}</td>
                  <td>{record.station}</td>
                  <td>{record.staff}</td>
                  <td>{record.time}</td>
                  <td>
                    <span
                      style={{
                        background: statusInfo[record.status].color + "20",
                        color: statusInfo[record.status].color,
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      {statusInfo[record.status].icon}{" "}
                      {statusInfo[record.status].label}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-view"
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBikeTypeManagement = () => {
    const filteredBikeTypes = selectedBrand
      ? bikeTypes.filter((bt) => bt.brandId === selectedBrand.id)
      : [];

    return (
      <div className="management-content">
        {/* Brands Section */}
        <div className="section-header">
          <h2>Quản lý Hãng Xe</h2>
          <button
            className="btn-primary"
            onClick={() => setShowAddBrandModal(true)}
          >
            ➕ Thêm hãng xe mới
          </button>
        </div>

        <div className="brands-grid">
          {brands.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                gridColumn: "1 / -1",
              }}
            >
              <p style={{ fontSize: "1.2rem", color: "#64748b" }}>
                Chưa có hãng xe nào. Thêm hãng xe mới để bắt đầu.
              </p>
            </div>
          ) : (
            brands.map((brand) => (
              <div
                key={brand.id}
                className={`brand-card ${
                  selectedBrand?.id === brand.id ? "selected" : ""
                }`}
                onClick={() => {
                  if (selectedBrand?.id === brand.id) {
                    setSelectedBrand(null);
                    fetchBikes(null);
                  } else {
                    setSelectedBrand(brand);
                    fetchBikes(brand.id);
                  }
                }}
              >
                <div className="brand-header">
                  <h3>{brand.name}</h3>
                  <span className="brand-country">
                    {brand.country || "N/A"}
                  </span>
                </div>
                <p className="brand-description">
                  {brand.description || "Không có mô tả"}
                </p>
                <div className="brand-stats">
                  <span className="bike-count">
                    🏍️ {brand.bikeCount || 0} loại xe
                  </span>
                </div>
                <div
                  className="brand-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn-edit-small"
                    onClick={() => {
                      setShowEditBrandModal(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-delete-small"
                    onClick={() => handleDeleteBrand(brand.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bike Types Section - shown when a brand is selected */}
        {selectedBrand && (
          <>
            <div
              className="section-header"
              style={{
                marginTop: "2rem",
                borderTop: "2px solid #e2e8f0",
                paddingTop: "2rem",
              }}
            >
              <div>
                <h2>Xe của hãng {selectedBrand.name}</h2>
                <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
                  Quản lý các loại xe thuộc hãng này
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => {
                  setNewBikeType({ ...newBikeType, brandId: selectedBrand.id });
                  setShowAddBikeTypeModal(true);
                }}
              >
                ➕ Thêm loại xe mới
              </button>
            </div>

            <div className="brands-grid">
              {filteredBikeTypes.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "3rem",
                    color: "#64748b",
                  }}
                >
                  <p style={{ fontSize: "1.1rem" }}>
                    Hãng này chưa có loại xe nào. Thêm loại xe mới để bắt đầu.
                  </p>
                </div>
              ) : (
                filteredBikeTypes.map((bikeType) => (
                  <div
                    key={bikeType.id}
                    className={`brand-card ${
                      selectedBike?.id === bikeType.id ? "selected" : ""
                    }`}
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "stretch",
                    }}
                    onClick={() => {
                      if (selectedBike?.id === bikeType.id) {
                        setSelectedBike(null);
                        fetchBikeInstances(null);
                      } else {
                        setSelectedBike(bikeType);
                        fetchBikeInstances(bikeType.id);
                      }
                    }}
                  >
                    {bikeType.frontImg && (
                      <div
                        style={{
                          flexShrink: 0,
                          width: "120px",
                          height: "120px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          backgroundColor: "#f1f5f9",
                        }}
                      >
                        <img
                          src={bikeType.frontImg}
                          alt={bikeType.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div className="brand-header">
                        <h3>{bikeType.name}</h3>
                        <span className="brand-country">
                          {bikeType.pricePerDay?.toLocaleString()} VNĐ/ngày
                        </span>
                      </div>
                      <p className="brand-description">
                        {bikeType.description || "Không có mô tả"}
                      </p>
                      <div className="brand-stats">
                        <span className="bike-count">
                          ⚡ {bikeType.maxSpeed} km/h
                        </span>
                        <span className="bike-count">
                          🔋 {bikeType.range} km
                        </span>
                        <span className="bike-count">
                          🏍️ {bikeType.quantity || 0} xe
                        </span>
                      </div>
                      <div
                        className="brand-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="btn-edit-small"
                          onClick={() => {
                            setSelectedBikeType(bikeType);
                            setShowEditBikeTypeModal(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete-small"
                          onClick={() => handleDeleteBikeType(bikeType.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bike Instances Section - shown when a bike is selected */}
            {selectedBike && (
              <div
                style={{
                  marginTop: "2rem",
                  borderTop: "2px solid #e2e8f0",
                  paddingTop: "2rem",
                }}
              >
                <div className="section-header">
                  <div>
                    <h3>Danh sách xe {selectedBike.name}</h3>
                    <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
                      Các xe thực tế với biển số khác nhau
                    </p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => setShowAddBikeInstanceModal(true)}
                  >
                    ➕ Thêm xe mới
                  </button>
                </div>

                {/* Search bar for bike instances */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo biển số xe..."
                    value={bikeInstanceSearchTerm}
                    onChange={(e) => setBikeInstanceSearchTerm(e.target.value)}
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      padding: "0.75rem 1rem",
                      border: "2px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                <div
                  className="table-container"
                  style={{ overflowX: "auto", width: "100%" }}
                >
                  <table className="data-table" style={{ minWidth: "800px" }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: "60px" }}>ID</th>
                        <th style={{ minWidth: "120px" }}>Biển số xe</th>
                        <th style={{ minWidth: "150px" }}>Trạm hiện tại</th>
                        <th style={{ minWidth: "120px" }}>Trạng thái</th>
                        <th style={{ minWidth: "100px" }}>Màu sắc</th>
                        <th style={{ minWidth: "120px" }}>Dung lượng pin</th>
                        <th style={{ minWidth: "150px" }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bikeInstances.filter((instance) =>
                        instance.licensePlate
                          ?.toLowerCase()
                          .includes(bikeInstanceSearchTerm.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            style={{ textAlign: "center", padding: "2rem" }}
                          >
                            {bikeInstanceSearchTerm
                              ? "Không tìm thấy xe với biển số này."
                              : "Chưa có xe nào cho loại xe này."}
                          </td>
                        </tr>
                      ) : (
                        bikeInstances
                          .filter((instance) =>
                            instance.licensePlate
                              ?.toLowerCase()
                              .includes(bikeInstanceSearchTerm.toLowerCase())
                          )
                          .map((instance) => (
                            <tr key={instance.bikeInstanceID || instance.id}>
                              <td>{instance.id}</td>
                              <td>
                                <strong>{instance.licensePlate}</strong>
                              </td>
                              <td>{instance.stationName || "N/A"}</td>
                              <td>
                                <span
                                  className={`status-badge ${
                                    instance.status === 1
                                      ? "status-active"
                                      : "status-pending"
                                  }`}
                                >
                                  {instance.status === 1
                                    ? "✅ Sẵn sàng"
                                    : "⏳ Bảo trì"}
                                </span>
                              </td>
                              <td>{getColorName(instance.color)}</td>
                              <td>
                                {instance.batteryCapacity
                                  ? `${instance.batteryCapacity}%`
                                  : "N/A"}
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button className="btn-edit">✏️ Sửa</button>
                                  <button className="btn-delete">🗑️ Xóa</button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Add Brand Modal */}
        {showAddBrandModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowAddBrandModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Thêm Hãng Xe Mới</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowAddBrandModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên hãng xe *</label>
                  <input
                    type="text"
                    value={newBrand.name}
                    onChange={(e) =>
                      setNewBrand({ ...newBrand, name: e.target.value })
                    }
                    placeholder="VD: Honda, Yamaha, VinFast..."
                  />
                </div>
                <div className="form-group">
                  <label>Quốc gia</label>
                  <input
                    type="text"
                    value={newBrand.country}
                    onChange={(e) =>
                      setNewBrand({ ...newBrand, country: e.target.value })
                    }
                    placeholder="VD: Nhật Bản, Việt Nam..."
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={newBrand.description}
                    onChange={(e) =>
                      setNewBrand({ ...newBrand, description: e.target.value })
                    }
                    placeholder="Mô tả về hãng xe..."
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setShowAddBrandModal(false)}
                >
                  Hủy
                </button>
                <button className="btn-confirm" onClick={handleAddBrand}>
                  Thêm hãng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Brand Modal */}
        {showEditBrandModal && selectedBrand && (
          <div
            className="modal-overlay"
            onClick={() => setShowEditBrandModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Chỉnh sửa Hãng Xe</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowEditBrandModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên hãng xe *</label>
                  <input
                    type="text"
                    value={selectedBrand.name}
                    onChange={(e) =>
                      setSelectedBrand({
                        ...selectedBrand,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Quốc gia</label>
                  <input
                    type="text"
                    value={selectedBrand.country}
                    onChange={(e) =>
                      setSelectedBrand({
                        ...selectedBrand,
                        country: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={selectedBrand.description}
                    onChange={(e) =>
                      setSelectedBrand({
                        ...selectedBrand,
                        description: e.target.value,
                      })
                    }
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setShowEditBrandModal(false)}
                >
                  Hủy
                </button>
                <button className="btn-confirm" onClick={handleUpdateBrand}>
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Bike Type Modal */}
        {showAddBikeTypeModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowAddBikeTypeModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Thêm Loại Xe Mới</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowAddBikeTypeModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Hãng xe *</label>
                  <select
                    value={newBikeType.brandId}
                    onChange={(e) =>
                      setNewBikeType({
                        ...newBikeType,
                        brandId: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "2px solid #e2e8f0",
                      fontSize: "0.95rem",
                    }}
                  >
                    <option value="">-- Chọn hãng xe --</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tên loại xe *</label>
                  <input
                    type="text"
                    value={newBikeType.name}
                    onChange={(e) =>
                      setNewBikeType({ ...newBikeType, name: e.target.value })
                    }
                    placeholder="VD: Honda Vision 2024"
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={newBikeType.description}
                    onChange={(e) =>
                      setNewBikeType({
                        ...newBikeType,
                        description: e.target.value,
                      })
                    }
                    placeholder="Mô tả chi tiết về loại xe..."
                    rows="3"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Ảnh mặt trước *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setNewBikeType({
                          ...newBikeType,
                          frontImg: e.target.files[0],
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    {newBikeType.frontImg && (
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#0baf8c",
                          marginTop: "0.5rem",
                        }}
                      >
                        ✓ {newBikeType.frontImg.name}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Ảnh mặt sau *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setNewBikeType({
                          ...newBikeType,
                          backImg: e.target.files[0],
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    {newBikeType.backImg && (
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#0baf8c",
                          marginTop: "0.5rem",
                        }}
                      >
                        ✓ {newBikeType.backImg.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Giá thuê/ngày (VNĐ) *</label>
                    <input
                      type="number"
                      value={newBikeType.pricePerDay}
                      onChange={(e) =>
                        setNewBikeType({
                          ...newBikeType,
                          pricePerDay: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="VD: 150000"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tốc độ tối đa (km/h)</label>
                    <input
                      type="number"
                      value={newBikeType.maxSpeed}
                      onChange={(e) =>
                        setNewBikeType({
                          ...newBikeType,
                          maxSpeed: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="VD: 80"
                    />
                  </div>
                  <div className="form-group">
                    <label>Quãng đường (km)</label>
                    <input
                      type="number"
                      value={newBikeType.range}
                      onChange={(e) =>
                        setNewBikeType({
                          ...newBikeType,
                          range: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="VD: 100"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setShowAddBikeTypeModal(false)}
                >
                  Hủy
                </button>
                <button className="btn-confirm" onClick={handleAddBikeType}>
                  Thêm loại xe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Bike Type Modal */}
        {showEditBikeTypeModal && selectedBikeType && (
          <div
            className="modal-overlay"
            onClick={() => setShowEditBikeTypeModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Chỉnh sửa Loại Xe</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowEditBikeTypeModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên loại xe *</label>
                  <input
                    type="text"
                    value={selectedBikeType.name}
                    onChange={(e) =>
                      setSelectedBikeType({
                        ...selectedBikeType,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={selectedBikeType.description}
                    onChange={(e) =>
                      setSelectedBikeType({
                        ...selectedBikeType,
                        description: e.target.value,
                      })
                    }
                    rows="3"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Giá thuê/giờ (VNĐ) *</label>
                    <input
                      type="number"
                      value={selectedBikeType.pricePerHour}
                      onChange={(e) =>
                        setSelectedBikeType({
                          ...selectedBikeType,
                          pricePerHour: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Giá thuê/ngày (VNĐ) *</label>
                    <input
                      type="number"
                      value={selectedBikeType.pricePerDay}
                      onChange={(e) =>
                        setSelectedBikeType({
                          ...selectedBikeType,
                          pricePerDay: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Dung lượng pin (kWh)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedBikeType.batteryCapacity}
                      onChange={(e) =>
                        setSelectedBikeType({
                          ...selectedBikeType,
                          batteryCapacity: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Tốc độ tối đa (km/h)</label>
                    <input
                      type="number"
                      value={selectedBikeType.maxSpeed}
                      onChange={(e) =>
                        setSelectedBikeType({
                          ...selectedBikeType,
                          maxSpeed: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Quãng đường (km)</label>
                    <input
                      type="number"
                      value={selectedBikeType.range}
                      onChange={(e) =>
                        setSelectedBikeType({
                          ...selectedBikeType,
                          range: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setShowEditBikeTypeModal(false)}
                >
                  Hủy
                </button>
                <button className="btn-confirm" onClick={handleUpdateBikeType}>
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Bike Instance Modal */}
        {showAddBikeInstanceModal && selectedBike && (
          <div
            className="modal-overlay"
            onClick={() => setShowAddBikeInstanceModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Thêm Xe Mới - {selectedBike.name}</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowAddBikeInstanceModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Biển số xe *</label>
                  <input
                    type="text"
                    value={newBikeInstance.licensePlate}
                    onChange={(e) =>
                      setNewBikeInstance({
                        ...newBikeInstance,
                        licensePlate: e.target.value,
                      })
                    }
                    placeholder="VD: 29A-12345"
                  />
                </div>
                <div className="form-group">
                  <label>Màu sắc</label>
                  <select
                    value={newBikeInstance.color}
                    onChange={(e) =>
                      setNewBikeInstance({
                        ...newBikeInstance,
                        color: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "2px solid #e2e8f0",
                      fontSize: "0.95rem",
                    }}
                  >
                    <option value="">-- Chọn màu --</option>
                    <option value="1">Trắng</option>
                    <option value="2">Đen</option>
                    <option value="3">Đỏ</option>
                    <option value="4">Xanh dương</option>
                    <option value="5">Xanh lá</option>
                    <option value="6">Vàng</option>
                    <option value="7">Xám</option>
                    <option value="8">Bạc</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trạm hiện tại *</label>
                  <select
                    value={newBikeInstance.stationId}
                    onChange={(e) =>
                      setNewBikeInstance({
                        ...newBikeInstance,
                        stationId: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "2px solid #e2e8f0",
                      fontSize: "0.95rem",
                    }}
                  >
                    <option value="">-- Chọn trạm --</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setShowAddBikeInstanceModal(false)}
                >
                  Hủy
                </button>
                <button className="btn-confirm" onClick={handleAddBikeInstance}>
                  Thêm xe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReports = () => (
    <div className="management-content">
      <div className="section-header">
        <h2>Báo cáo & Phân tích</h2>
        <div className="report-actions">
          <select className="filter-select">
            <option>Tháng này</option>
            <option>Tháng trước</option>
            <option>Quý này</option>
            <option>Năm nay</option>
          </select>
          <button className="btn-primary">Xuất PDF</button>
        </div>
      </div>

      <div className="report-grid">
        <div className="report-card">
          <h3>Doanh thu theo điểm thuê</h3>
          <div className="report-content">
            {reports.revenueByStation.map((item, index) => (
              <div key={index} className="revenue-item">
                <div className="revenue-header">
                  <span className="revenue-station">{item.station}</span>
                  <span className="revenue-amount">
                    {(item.revenue / 1000000).toFixed(1)}M VNĐ
                  </span>
                </div>
                <div className="revenue-details">
                  <span>Số lượt thuê: {item.rentals}</span>
                  <span>
                    Trung bình:{" "}
                    {(item.revenue / item.rentals / 1000).toFixed(0)}K/lượt
                  </span>
                </div>
                <div className="revenue-progress">
                  <div
                    className="revenue-bar"
                    style={{ width: `${(item.revenue / 20000000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-card">
          <h3>Tỷ lệ sử dụng xe</h3>
          <div className="usage-stats">
            <div className="usage-circle">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#4caf50"
                  strokeWidth="10"
                  strokeDasharray={`${
                    (stats.vehiclesInUse / stats.totalVehicles) * 283
                  } 283`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="usage-text">
                <span className="usage-percent">
                  {((stats.vehiclesInUse / stats.totalVehicles) * 100).toFixed(
                    0
                  )}
                  %
                </span>
                <span className="usage-label">Đang sử dụng</span>
              </div>
            </div>
            <div className="usage-details">
              <p>
                Xe đang cho thuê: <strong>{stats.vehiclesInUse}</strong>
              </p>
              <p>
                Xe khả dụng: <strong>{stats.availableVehicles}</strong>
              </p>
              <p>
                Tổng số xe: <strong>{stats.totalVehicles}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3>Giờ cao điểm</h3>
          <div className="peak-analysis">
            {reports.peakHours.map((item, index) => (
              <div key={index} className="peak-detail">
                <div className="peak-time">{item.hour}</div>
                <div className="peak-meter">
                  <div
                    className="peak-meter-fill"
                    style={{ width: `${item.usage}%` }}
                  >
                    {item.usage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="peak-summary">
            <p>
              📊 Giờ cao điểm nhất: <strong>17-19h (93%)</strong>
            </p>
            <p>
              📈 Khuyến nghị: Tăng cường xe tại các điểm chính vào khung giờ này
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>⚡ EV Rental Admin</h2>
        </div>

        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="nav-icon">📊</span>
            Bảng phân tích
          </button>

          <button
            className={`nav-item ${activeTab === "vehicles" ? "active" : ""}`}
            onClick={() => setActiveTab("vehicles")}
          >
            <span className="nav-icon">🏍️</span>
            Các trạm thuê xe
          </button>

          <button
            className={`nav-item ${activeTab === "delivery" ? "active" : ""}`}
            onClick={() => setActiveTab("delivery")}
          >
            <span className="nav-icon">🚚</span>
            Lịch sử giao/nhận
          </button>

          <button
            className={`nav-item ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            <span className="nav-icon">👥</span>
            Khách hàng
          </button>

          <button
            className={`nav-item ${activeTab === "staff" ? "active" : ""}`}
            onClick={() => setActiveTab("staff")}
          >
            <span className="nav-icon">👔</span>
            Nhân viên
          </button>

          <button
            className={`nav-item ${activeTab === "bikeTypes" ? "active" : ""}`}
            onClick={() => setActiveTab("bikeTypes")}
          >
            <span className="nav-icon">🏍️</span>
            Loại xe
          </button>

          <button
            className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <span className="nav-icon">📈</span>
            Báo cáo
          </button>
        </nav>

        <div className="admin-footer">
          <button className="nav-item logout" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="admin-main">
        <div className="admin-header">
          <h1>
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "vehicles" && "Quản lý Trạm Thuê Xe"}
            {activeTab === "delivery" && "Lịch sử Giao/Nhận Xe"}
            {activeTab === "customers" && "Quản lý Khách hàng"}
            {activeTab === "staff" && "Quản lý Nhân viên"}
            {activeTab === "bikeTypes" && "Quản lý Loại Xe"}
            {activeTab === "reports" && "Báo cáo & Phân tích"}
          </h1>
          <div className="admin-user">
            <span>Admin User</span>
            <div className="avatar">A</div>
          </div>
        </div>

        <div className="admin-content">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "vehicles" && renderVehicleManagement()}
          {activeTab === "delivery" && renderDeliveryHistory()}
          {activeTab === "customers" && renderCustomerManagement()}
          {activeTab === "staff" && renderStaffManagement()}
          {activeTab === "bikeTypes" && renderBikeTypeManagement()}
          {activeTab === "reports" && renderReports()}
        </div>
        {/* Add Staff Modal (global) */}
        {showAddStaffModal && (
          <div
            className="modal-overlay"
            onMouseDown={(e) => {
              if (e.target.classList.contains("modal-overlay")) {
                setShowAddStaffModal(false);
              }
            }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h2>
                  {editingStaffId
                    ? "✏️ Chỉnh sửa nhân viên"
                    : "➕ Thêm nhân viên mới"}
                </h2>
                <button
                  className="btn-close"
                  onClick={() => {
                    setShowAddStaffModal(false);
                    setEditingStaffId(null);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                {/* Show all validation errors at the top */}
                {apiErrors && Object.keys(apiErrors).length > 0 && (
                  <div
                    style={{
                      background: "#fee2e2",
                      border: "1px solid #ef4444",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "#dc2626",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span>⚠️</span>
                      <span>Lỗi validation:</span>
                    </div>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "24px",
                        color: "#991b1b",
                      }}
                    >
                      {Object.entries(apiErrors).map(([key, value]) => (
                        <li key={key} style={{ marginBottom: "4px" }}>
                          <strong>{key}:</strong> {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="form-group">
                  <label>Họ tên *</label>
                  <input
                    type="text"
                    name="staff-fullname"
                    autoComplete="off"
                    value={newStaff.fullName}
                    onChange={(e) =>
                      setNewStaff((s) => ({ ...s, fullName: e.target.value }))
                    }
                  />
                  {getError(["fullName", "fullname"]) && (
                    <div className="input-error">
                      {getError(["fullName", "fullname"])}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="staff-email"
                    autoComplete="off"
                    value={newStaff.email}
                    onChange={(e) =>
                      setNewStaff((s) => ({ ...s, email: e.target.value }))
                    }
                  />
                  {getError(["email"]) && (
                    <div className="input-error">{getError(["email"])}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Điện thoại</label>
                  <input
                    type="tel"
                    name="staff-phone"
                    autoComplete="off"
                    placeholder="0xxxxxxxxx"
                    value={newStaff.phone}
                    onChange={(e) =>
                      setNewStaff((s) => ({ ...s, phone: e.target.value }))
                    }
                  />
                  {getError(["phone"]) && (
                    <div className="input-error">{getError(["phone"])}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Trạm làm việc</label>
                  <select
                    name="staff-station"
                    value={newStaff.stationId}
                    onChange={(e) =>
                      setNewStaff((s) => ({ ...s, stationId: e.target.value }))
                    }
                  >
                    <option value="">-- Chọn trạm --</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                  {getError(["stationId", "stationid", "station"]) && (
                    <div className="input-error">
                      {getError(["stationId", "stationid", "station"])}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Vai trò</label>
                  <input
                    type="text"
                    name="staff-role"
                    autoComplete="off"
                    placeholder="VD: Nhân viên trạm, Quản lý trạm..."
                    value={newStaff.role}
                    onChange={(e) =>
                      setNewStaff((s) => ({ ...s, role: e.target.value }))
                    }
                  />
                  {getError(["role"]) && (
                    <div className="input-error">{getError(["role"])}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    {editingStaffId
                      ? "Mật khẩu (để trống nếu không đổi)"
                      : "Mật khẩu *"}
                  </label>
                  <input
                    type="password"
                    name="staff-password"
                    autoComplete="new-password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={newStaff.password}
                    onChange={(e) =>
                      setNewStaff((s) => ({ ...s, password: e.target.value }))
                    }
                  />
                  {getError(["password", "Password"]) && (
                    <div className="input-error">
                      {getError(["password", "Password"])}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    {editingStaffId
                      ? "Ảnh đại diện (tùy chọn)"
                      : "Ảnh đại diện *"}
                  </label>
                  <input
                    type="file"
                    name="staff-avatar"
                    accept="image/*"
                    onChange={(e) => handleAvatarChange(e.target.files[0])}
                  />
                  {newStaff.avatarPreview && (
                    <div className="avatar-preview" style={{ marginTop: 12 }}>
                      <img
                        src={newStaff.avatarPreview}
                        alt="preview"
                        style={{
                          maxWidth: 120,
                          maxHeight: 120,
                          borderRadius: 8,
                          border: "2px solid #e2e8f0",
                          objectFit: "cover",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "#6b7280",
                          marginTop: 4,
                        }}
                      >
                        {newStaff.avatarFile?.name} (
                        {(newStaff.avatarFile?.size / 1024).toFixed(1)} KB)
                      </div>
                    </div>
                  )}
                  {getError(["avatar", "avatarpicture"]) && (
                    <div className="input-error">
                      {getError(["avatar", "avatarpicture"])}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowAddStaffModal(false);
                    setEditingStaffId(null);
                  }}
                  disabled={creatingStaff}
                >
                  Hủy
                </button>
                <button
                  className="btn-primary"
                  onClick={
                    editingStaffId ? handleUpdateStaff : handleCreateStaff
                  }
                  disabled={creatingStaff}
                  style={{
                    opacity: creatingStaff ? 0.7 : 1,
                    cursor: creatingStaff ? "not-allowed" : "pointer",
                  }}
                >
                  {creatingStaff
                    ? "⏳ Đang lưu..."
                    : editingStaffId
                    ? "💾 Cập nhật"
                    : "💾 Lưu nhân viên"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
