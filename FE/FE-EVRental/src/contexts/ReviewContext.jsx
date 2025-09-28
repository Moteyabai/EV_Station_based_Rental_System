import React, { createContext, useState, useContext, useEffect } from "react";

// Tạo context
export const ReviewContext = createContext();

// Provider component
export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState({});

  // Lấy reviews từ localStorage khi component mount
  useEffect(() => {
    const storedReviews = localStorage.getItem("vehicle_station_reviews");
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    }
  }, []);

  // Lưu reviews vào localStorage khi state thay đổi
  useEffect(() => {
    if (Object.keys(reviews).length > 0) {
      localStorage.setItem("vehicle_station_reviews", JSON.stringify(reviews));
    }
  }, [reviews]);

  // Thêm đánh giá mới
  const addReview = (review) => {
    const { vehicleId, stationId } = review;

    // Tạo key để lưu đánh giá theo xe và trạm
    let vehicleKey = `vehicle_${vehicleId}`;
    let stationKey = `station_${stationId}`;

    setReviews((prevReviews) => {
      // Clone đối tượng reviews cũ
      const updatedReviews = { ...prevReviews };

      // Thêm đánh giá cho xe
      if (vehicleId) {
        updatedReviews[vehicleKey] = [
          ...(updatedReviews[vehicleKey] || []),
          review,
        ];
      }

      // Thêm đánh giá cho trạm
      if (stationId) {
        updatedReviews[stationKey] = [
          ...(updatedReviews[stationKey] || []),
          review,
        ];
      }

      return updatedReviews;
    });
  };

  // Lấy đánh giá cho xe
  const getVehicleReviews = (vehicleId) => {
    const key = `vehicle_${vehicleId}`;
    return reviews[key] || [];
  };

  // Lấy đánh giá cho trạm
  const getStationReviews = (stationId) => {
    const key = `station_${stationId}`;
    return reviews[key] || [];
  };

  // Tính điểm đánh giá trung bình cho xe
  const getAverageVehicleRating = (vehicleId) => {
    const vehicleReviews = getVehicleReviews(vehicleId);
    if (vehicleReviews.length === 0) return 0;

    const sum = vehicleReviews.reduce(
      (total, review) => total + review.rating,
      0
    );
    return (sum / vehicleReviews.length).toFixed(1);
  };

  // Tính điểm đánh giá trung bình cho trạm
  const getAverageStationRating = (stationId) => {
    const stationReviews = getStationReviews(stationId);
    if (stationReviews.length === 0) return 0;

    const sum = stationReviews.reduce(
      (total, review) => total + review.rating,
      0
    );
    return (sum / stationReviews.length).toFixed(1);
  };

  // Context value
  const value = {
    addReview,
    getVehicleReviews,
    getStationReviews,
    getAverageVehicleRating,
    getAverageStationRating,
  };

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng review context
export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewProvider");
  }
  return context;
};
