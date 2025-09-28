import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import products from "../data/products";
import BookingForm from "../components/BookingForm";
import ReviewDisplay from "../components/ReviewDisplay";
import ReviewForm from "../components/ReviewForm";
import { useCart } from "../contexts/CartContext";
import { useReviews } from "../contexts/ReviewContext";
import "../styles/ProductDetail.css";
import "../styles/BookingModal.css";
import "../styles/Reviews.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const { getVehicleReviews, addReview } = useReviews();
  const p = products.find((x) => x.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([]);

  if (!p) return <p>Product not found</p>;

  useEffect(() => {
    // Lấy đánh giá cho xe này
    if (id) {
      setReviews(getVehicleReviews(id));
    }
  }, [id, getVehicleReviews]);

  const handleBookingSubmit = async (formData, rentalDetails) => {
    // Booking form will handle adding to cart
    setShowBookingForm(false);
    // Navigate to cart or show success message
    navigate("/cart");
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      // Thêm đánh giá mới
      await addReview({
        ...reviewData,
        userName: localStorage.getItem("userName") || "Khách hàng",
      });

      // Cập nhật danh sách đánh giá
      setReviews(getVehicleReviews(id));

      return true;
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      return false;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price * 1000);
  };

  return (
    <div className="product-page ev-container">
      <div className="product-main">
        <div className="product-media">
          <div
            className="product-image"
            style={
              p.images && p.images.length > 0
                ? { backgroundImage: `url(${p.images[activeImage]})` }
                : {}
            }
          />
          {p.images && p.images.length > 0 && (
            <div className="product-thumbnails">
              {p.images.map((img, index) => (
                <div
                  key={index}
                  className={`product-thumbnail ${
                    activeImage === index ? "active" : ""
                  }`}
                  style={{ backgroundImage: `url(${img})` }}
                  onClick={() => setActiveImage(index)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="product-info">
          <h1>{p.name}</h1>
          <p className="short">{p.short}</p>
          <div className="price">
            {formatPrice(p.price)} <span className="price-unit">mỗi ngày</span>
          </div>
          <p className="desc">{p.description}</p>

          {p.specs && (
            <div className="specs">
              <h3>Specifications</h3>
              <ul>
                {Object.entries(p.specs).map(([key, value]) => (
                  <li key={key}>
                    <strong>
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </strong>{" "}
                    {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {p.features && p.features.length > 0 && (
            <div className="features">
              <h3>Features</h3>
              <ul>
                {p.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="actions">
            <button
              className="btn primary"
              onClick={() => setShowBookingForm(true)}
            >
              🛒 Thuê xe ngay
            </button>
            <button className="btn secondary" onClick={() => navigate("/cart")}>
              🛍️ Giỏ hàng ({getItemCount()})
            </button>
            <button
              className="btn secondary"
              onClick={() => setShowReviewForm(true)}
            >
              ⭐ Đánh giá xe
            </button>
          </div>
        </div>
      </div>

      {/* Phần đánh giá */}
      <div className="product-reviews">
        <ReviewDisplay reviews={reviews} />
      </div>

      {showBookingForm && (
        <div className="booking-modal">
          <div className="booking-modal-content">
            <BookingForm
              vehicle={p}
              onSubmit={handleBookingSubmit}
              onCancel={() => setShowBookingForm(false)}
            />
          </div>
        </div>
      )}

      {showReviewForm && (
        <ReviewForm
          vehicleId={id}
          stationId={null}
          onSubmit={handleReviewSubmit}
          onClose={() => setShowReviewForm(false)}
        />
      )}
    </div>
  );
}
