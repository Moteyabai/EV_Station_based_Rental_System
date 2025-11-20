import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { mockBookings } from "../../constants/mockData";
import "../../styles/VehicleReturn.css";

export default function VehicleReturn() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  // Form states
  const [vehiclePhotos, setVehiclePhotos] = useState({
    front: null,
    back: null,
    left: null,
    right: null,
  });
  const [finalOdometer, setFinalOdometer] = useState("");
  const [finalBatteryLevel, setFinalBatteryLevel] = useState("");
  const [damageReported, setDamageReported] = useState("no");
  const [damageDescription, setDamageDescription] = useState("");
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  // Extra charges calculation
  const [extraCharges, setExtraCharges] = useState({
    lateFee: 0,
    damageFee: 0,
    cleaningFee: 0,
    lowBatteryFee: 0,
    total: 0,
  });

  // Mock fetch booking data
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      const mockBooking = mockBookings[bookingId];

      if (mockBooking) {
        setBooking(mockBooking);
      }

      setLoading(false);
    }, 1000);
  }, [bookingId]);

  const handleVehiclePhotoUpload = (position, e) => {
    const file = e.target.files[0];
    if (file) {
      setVehiclePhotos((prev) => ({
        ...prev,
        [position]: file,
      }));
    }
  };

  const removeVehiclePhoto = (position) => {
    setVehiclePhotos((prev) => ({
      ...prev,
      [position]: null,
    }));
  };

  // Calculate extra charges based on current return data
  useEffect(() => {
    if (booking && finalOdometer && finalBatteryLevel) {
      let lateFee = 0;
      let damageFee = damageReported === "yes" ? 100 : 0; // Example damage fee
      let cleaningFee = cleanlinessRating < 3 ? 30 : 0; // Example cleaning fee
      let lowBatteryFee = finalBatteryLevel < 20 ? 25 : 0; // Example low battery fee

      // Calculate late fee (mock logic)
      const now = new Date();
      const returnDate = new Date(
        booking.returnDate + "T" + booking.returnTime
      );
      if (now > returnDate) {
        // Calculate hours late
        const hoursLate = Math.ceil((now - returnDate) / (1000 * 60 * 60));
        lateFee = hoursLate * 15; // $15 per hour late fee
      }

      const total = lateFee + damageFee + cleaningFee + lowBatteryFee;

      setExtraCharges({
        lateFee,
        damageFee,
        cleaningFee,
        lowBatteryFee,
        total,
      });
    }
  }, [
    booking,
    finalOdometer,
    finalBatteryLevel,
    damageReported,
    cleanlinessRating,
  ]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      const { front, back, left, right } = vehiclePhotos;
      if (!front || !back || !left || !right) {
        setError("Please upload photos of all sides of the vehicle.");
        return;
      }
      if (!finalOdometer || !finalBatteryLevel) {
        setError("Please fill in all vehicle condition fields.");
        return;
      }

      // Validate odometer reading
      if (booking && parseInt(finalOdometer) < booking.initialOdometer) {
        setError(
          "Final odometer reading cannot be less than the initial reading."
        );
        return;
      }
    }

    setError(null);
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      // Submit the form and navigate to success page
      handleSubmit();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    setLoading(true);

    // In a real app, this would be an API call to submit the return data
    setTimeout(() => {
      // Mock successful submission
      navigate(`/return-success/${bookingId}`);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="return-container">
        <div className="loading-container">Loading booking information...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="return-container">
        <div className="not-found-container">
          <h2>Booking Not Found</h2>
          <p>
            We couldn't find the booking you're looking for. Please check the
            booking ID and try again.
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calculate usage metrics
  const distanceTraveled = finalOdometer
    ? finalOdometer - booking.initialOdometer
    : 0;
  const batteryUsed = booking.initialBatteryLevel - (finalBatteryLevel || 0);

  return (
    <div className="return-container">
      <div className="breadcrumbs">
        <Link to="/dashboard">Dashboard</Link> &gt;{" "}
        <Link to="/bookings">Bookings</Link> &gt; Vehicle Return
      </div>

      <h1>Vehicle Return</h1>

      {/* Booking Summary Card */}
      <div className="booking-summary-card">
        <h2>Booking Summary</h2>
        <div className="booking-details">
          <div className="detail-item">
            <span className="label">Vehicle</span>
            <span className="value">{booking.vehicleName}</span>
          </div>
          <div className="detail-item">
            <span className="label">Pickup Location</span>
            <span className="value">{booking.stationName}</span>
          </div>
          <div className="detail-item">
            <span className="label">Pickup Time</span>
            <span className="value">
              {new Date(booking.pickupDate).toLocaleDateString()}{" "}
              {booking.pickupTime}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">Return Time</span>
            <span className="value">
              {new Date(booking.returnDate).toLocaleDateString()}{" "}
              {booking.returnTime}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">Initial Odometer</span>
            <span className="value">{booking.initialOdometer} km</span>
          </div>
          <div className="detail-item">
            <span className="label">Initial Battery</span>
            <span className="value">{booking.initialBatteryLevel}%</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="return-progress">
        <div
          className={`progress-step ${currentStep >= 1 ? "active" : ""} ${
            currentStep > 1 ? "completed" : ""
          }`}
        >
          <div className="step-number">1</div>
          <div className="step-label">Vehicle Inspection</div>
        </div>
        <div
          className={`progress-connector ${currentStep > 1 ? "completed" : ""}`}
        ></div>
        <div
          className={`progress-step ${currentStep >= 2 ? "active" : ""} ${
            currentStep > 2 ? "completed" : ""
          }`}
        >
          <div className="step-number">2</div>
          <div className="step-label">Review & Feedback</div>
        </div>
        <div
          className={`progress-connector ${currentStep > 2 ? "completed" : ""}`}
        ></div>
        <div className={`progress-step ${currentStep >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <div className="step-label">Confirmation</div>
        </div>
      </div>

      {/* Form Container */}
      <div className="return-form-container">
        {error && <div className="error-message">{error}</div>}

        {/* Step 1: Vehicle Inspection */}
        {currentStep === 1 && (
          <div className="return-form">
            <h2>Vehicle Inspection</h2>
            <p>
              Please take photos of the vehicle from all sides and record the
              current condition.
            </p>

            <div className="form-section">
              <div className="vehicle-photos">
                <label>Vehicle Photos</label>
                <div className="photo-grid">
                  {/* Front Photo */}
                  <div className="photo-upload-box">
                    {vehiclePhotos.front ? (
                      <div className="photo-preview">
                        <img
                          src={URL.createObjectURL(vehiclePhotos.front)}
                          alt="Front"
                        />
                        <button
                          className="remove-photo"
                          onClick={() => removeVehiclePhoto("front")}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <div className="upload-icon">📷</div>
                        <div className="upload-text">
                          <span className="primary-text">Front Photo</span>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      className="file-input"
                      accept="image/*"
                      onChange={(e) => handleVehiclePhotoUpload("front", e)}
                    />
                  </div>

                  {/* Back Photo */}
                  <div className="photo-upload-box">
                    {vehiclePhotos.back ? (
                      <div className="photo-preview">
                        <img
                          src={URL.createObjectURL(vehiclePhotos.back)}
                          alt="Back"
                        />
                        <button
                          className="remove-photo"
                          onClick={() => removeVehiclePhoto("back")}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <div className="upload-icon">📷</div>
                        <div className="upload-text">
                          <span className="primary-text">Back Photo</span>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      className="file-input"
                      accept="image/*"
                      onChange={(e) => handleVehiclePhotoUpload("back", e)}
                    />
                  </div>

                  {/* Left Side Photo */}
                  <div className="photo-upload-box">
                    {vehiclePhotos.left ? (
                      <div className="photo-preview">
                        <img
                          src={URL.createObjectURL(vehiclePhotos.left)}
                          alt="Left Side"
                        />
                        <button
                          className="remove-photo"
                          onClick={() => removeVehiclePhoto("left")}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <div className="upload-icon">📷</div>
                        <div className="upload-text">
                          <span className="primary-text">Left Side Photo</span>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      className="file-input"
                      accept="image/*"
                      onChange={(e) => handleVehiclePhotoUpload("left", e)}
                    />
                  </div>

                  {/* Right Side Photo */}
                  <div className="photo-upload-box">
                    {vehiclePhotos.right ? (
                      <div className="photo-preview">
                        <img
                          src={URL.createObjectURL(vehiclePhotos.right)}
                          alt="Right Side"
                        />
                        <button
                          className="remove-photo"
                          onClick={() => removeVehiclePhoto("right")}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <div className="upload-icon">📷</div>
                        <div className="upload-text">
                          <span className="primary-text">Right Side Photo</span>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      className="file-input"
                      accept="image/*"
                      onChange={(e) => handleVehiclePhotoUpload("right", e)}
                    />
                  </div>
                </div>
              </div>

              <div className="vehicle-condition">
                <div className="form-row">
                  <div className="form-group">
                    <label>Final Odometer Reading (km)</label>
                    <input
                      type="number"
                      value={finalOdometer}
                      onChange={(e) => setFinalOdometer(e.target.value)}
                      placeholder="Enter current odometer reading"
                      min={booking.initialOdometer}
                    />
                    {finalOdometer && (
                      <div className="input-helper">
                        Distance traveled: {distanceTraveled} km
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Battery Level (%)</label>
                    <input
                      type="number"
                      value={finalBatteryLevel}
                      onChange={(e) => setFinalBatteryLevel(e.target.value)}
                      placeholder="Enter current battery level"
                      min="0"
                      max="100"
                    />
                    {finalBatteryLevel < 20 && (
                      <div className="input-warning">
                        Low battery fee may apply
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Any damage to report?</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="damageReported"
                        value="no"
                        checked={damageReported === "no"}
                        onChange={() => setDamageReported("no")}
                      />
                      No
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="damageReported"
                        value="yes"
                        checked={damageReported === "yes"}
                        onChange={() => setDamageReported("yes")}
                      />
                      Yes
                    </label>
                  </div>

                  {damageReported === "yes" && (
                    <div className="form-group">
                      <label>Describe the damage</label>
                      <textarea
                        rows="3"
                        value={damageDescription}
                        onChange={(e) => setDamageDescription(e.target.value)}
                        placeholder="Please describe the damage in detail..."
                      ></textarea>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review & Feedback */}
        {currentStep === 2 && (
          <div className="return-form">
            <h2>Review & Feedback</h2>
            <p>Please rate your experience and provide any feedback.</p>

            <div className="form-section">
              <div className="form-group">
                <label>Vehicle Cleanliness (1-5)</label>
                <div className="rating-group">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={`rating-button ${
                        cleanlinessRating >= rating ? "active" : ""
                      }`}
                      onClick={() => setCleanlinessRating(rating)}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <div className="rating-label">
                  {cleanlinessRating === 1 && "Very Dirty"}
                  {cleanlinessRating === 2 && "Dirty"}
                  {cleanlinessRating === 3 && "Acceptable"}
                  {cleanlinessRating === 4 && "Clean"}
                  {cleanlinessRating === 5 && "Very Clean"}
                </div>
              </div>

              <div className="form-group">
                <label>Your Feedback</label>
                <textarea
                  rows="4"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your experience with the vehicle and our service..."
                ></textarea>
              </div>

              <div className="usage-summary">
                <h3>Usage Summary</h3>
                <div className="usage-metrics">
                  <div className="metric">
                    <div className="metric-icon">🛣️</div>
                    <div className="metric-content">
                      <div className="metric-value">{distanceTraveled} km</div>
                      <div className="metric-label">Distance Traveled</div>
                    </div>
                  </div>

                  <div className="metric">
                    <div className="metric-icon">🔋</div>
                    <div className="metric-content">
                      <div className="metric-value">{batteryUsed}%</div>
                      <div className="metric-label">Battery Used</div>
                    </div>
                  </div>

                  <div className="metric">
                    <div className="metric-icon">⏱️</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {/* Calculate duration in days */}
                        {Math.ceil(
                          (new Date(booking.returnDate) -
                            new Date(booking.pickupDate)) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </div>
                      <div className="metric-label">Rental Duration</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="return-form">
            <h2>Confirm Return Details</h2>
            <p>
              Please review the information below and confirm your vehicle
              return.
            </p>

            <div className="return-summary">
              <div className="summary-section">
                <h3>Vehicle Condition</h3>
                <div className="summary-item">
                  <span className="label">Final Odometer</span>
                  <span className="value">{finalOdometer} km</span>
                </div>
                <div className="summary-item">
                  <span className="label">Distance Traveled</span>
                  <span className="value">{distanceTraveled} km</span>
                </div>
                <div className="summary-item">
                  <span className="label">Battery Level</span>
                  <span className="value">{finalBatteryLevel}%</span>
                </div>
                <div className="summary-item">
                  <span className="label">Damage Reported</span>
                  <span className="value">
                    {damageReported === "yes" ? "Yes" : "No"}
                  </span>
                </div>
                {damageReported === "yes" && (
                  <div className="summary-item full-width">
                    <span className="label">Damage Description</span>
                    <span className="value">{damageDescription}</span>
                  </div>
                )}
                <div className="summary-item">
                  <span className="label">Cleanliness Rating</span>
                  <span className="value">{cleanlinessRating}/5</span>
                </div>
              </div>

              <div className="summary-section">
                <h3>Charges Summary</h3>
                <div className="summary-item">
                  <span className="label">Base Rental</span>
                  <span className="value">${booking.price.toFixed(2)}</span>
                </div>

                {extraCharges.lateFee > 0 && (
                  <div className="summary-item extra-charge">
                    <span className="label">Late Return Fee</span>
                    <span className="value">
                      ${extraCharges.lateFee.toFixed(2)}
                    </span>
                  </div>
                )}

                {extraCharges.damageFee > 0 && (
                  <div className="summary-item extra-charge">
                    <span className="label">Damage Fee</span>
                    <span className="value">
                      ${extraCharges.damageFee.toFixed(2)}
                    </span>
                  </div>
                )}

                {extraCharges.cleaningFee > 0 && (
                  <div className="summary-item extra-charge">
                    <span className="label">Cleaning Fee</span>
                    <span className="value">
                      ${extraCharges.cleaningFee.toFixed(2)}
                    </span>
                  </div>
                )}

                {extraCharges.lowBatteryFee > 0 && (
                  <div className="summary-item extra-charge">
                    <span className="label">Low Battery Fee</span>
                    <span className="value">
                      ${extraCharges.lowBatteryFee.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="summary-item total">
                  <span className="label">Total</span>
                  <span className="value">
                    ${(booking.price + extraCharges.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {extraCharges.total > 0 && (
                <div className="summary-note">
                  <div className="note-icon">⚠️</div>
                  <div className="note-text">
                    <strong>Additional charges apply:</strong> The final amount
                    includes extra charges based on the condition and timing of
                    your return.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="form-actions">
          {currentStep > 1 && (
            <button className="btn btn-secondary" onClick={handlePreviousStep}>
              Back
            </button>
          )}
          <button className="btn btn-primary" onClick={handleNextStep}>
            {currentStep < 3 ? "Next" : "Confirm Return"}
          </button>
        </div>
      </div>
    </div>
  );
}
