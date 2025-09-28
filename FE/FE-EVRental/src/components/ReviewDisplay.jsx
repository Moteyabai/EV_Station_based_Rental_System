import React from "react";
import "../styles/ReviewDisplay.css";

const ReviewDisplay = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="no-reviews">
        <p>Chưa có đánh giá nào cho sản phẩm này.</p>
      </div>
    );
  }

  // Tính điểm đánh giá trung bình
  const calculateAverageRating = () => {
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  return (
    <div className="reviews-container">
      <div className="reviews-summary">
        <div className="average-rating">
          <span className="rating-number">{calculateAverageRating()}</span>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${
                  calculateAverageRating() >= star ? "filled" : ""
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="total-reviews">({reviews.length} đánh giá)</span>
        </div>
      </div>

      <div className="reviews-list">
        <h3>Đánh giá từ khách hàng</h3>
        {reviews.map((review, index) => (
          <div className="review-item" key={index}>
            <div className="review-header">
              <div className="reviewer-info">
                <div className="avatar">
                  {review.userName ? review.userName.charAt(0) : "K"}
                </div>
                <div className="name-date">
                  <span className="reviewer-name">
                    {review.userName || "Khách hàng"}
                  </span>
                  <span className="review-date">{formatDate(review.date)}</span>
                </div>
              </div>
              <div className="review-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${review.rating >= star ? "filled" : ""}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="review-comment">{review.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewDisplay;
