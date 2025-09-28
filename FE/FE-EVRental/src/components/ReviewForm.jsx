import React, { useState } from "react";
import "../styles/ReviewForm.css";

const ReviewForm = ({ vehicleId, stationId, onSubmit, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Tạo đối tượng đánh giá
      const review = {
        vehicleId: vehicleId,
        stationId: stationId,
        rating: rating,
        comment: comment,
        date: new Date().toISOString(),
      };

      // Gửi đánh giá đi
      await onSubmit(review);

      // Reset form
      setRating(5);
      setComment("");

      // Thông báo thành công
      alert("Cảm ơn bạn đã gửi đánh giá!");

      // Đóng form
      onClose();
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      alert("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-form-overlay">
      <div className="review-form-container">
        <h2>📝 Đánh giá trải nghiệm thuê xe</h2>
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <form onSubmit={handleSubmit}>
          <div className="rating-container">
            <p>Chất lượng trải nghiệm:</p>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${rating >= star ? "filled" : ""}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Nhận xét của bạn:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn với xe và trạm thuê..."
              rows={4}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
