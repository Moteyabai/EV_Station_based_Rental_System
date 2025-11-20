import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { mockBookings } from "../../constants/mockData";
import "../../styles/VehiclePickup.css";

export default function VehiclePickup() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // In a real app, fetch booking details from API
  const booking = mockBookings[bookingId];

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [checkInData, setCheckInData] = useState({
    driverLicense: null,
    agreeToTerms: false,
    signature: null,
    vehiclePhotos: [],
    initialOdometer: "",
    initialBatteryLevel: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // In a real app, this would fetch booking data from the server
    if (!booking) {
      // Booking not found, redirect to bookings list
      navigate("/my-bookings");
    }
  }, [booking, navigate]);

  if (!booking) {
    return <div className="loading-container">Loading booking details...</div>;
  }

  // Check if user is authenticated
  if (!user) {
    return navigate("/login");
  }

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (field === "vehiclePhotos") {
        setCheckInData((prev) => ({
          ...prev,
          vehiclePhotos: [...prev.vehiclePhotos, file],
        }));
      } else {
        setCheckInData((prev) => ({
          ...prev,
          [field]: file,
        }));
      }
    }
  };

  const handleRemovePhoto = (index) => {
    setCheckInData((prev) => ({
      ...prev,
      vehiclePhotos: prev.vehiclePhotos.filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCheckInData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!checkInData.driverLicense) {
        newErrors.driverLicense = "Driver license verification is required";
      }
    } else if (step === 2) {
      if (!checkInData.agreeToTerms) {
        newErrors.agreeToTerms = "You must agree to the terms and conditions";
      }
      if (!checkInData.signature) {
        newErrors.signature = "Signature is required";
      }
    } else if (step === 3) {
      if (checkInData.vehiclePhotos.length < 4) {
        newErrors.vehiclePhotos =
          "Please upload at least 4 photos (front, back, left, right)";
      }
      if (!checkInData.initialOdometer) {
        newErrors.initialOdometer = "Initial odometer reading is required";
      }
      if (!checkInData.initialBatteryLevel) {
        newErrors.initialBatteryLevel = "Initial battery level is required";
      } else if (checkInData.initialBatteryLevel < 20) {
        newErrors.initialBatteryLevel = "Battery level is too low for pickup";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateStep()) {
      setIsLoading(true);

      try {
        // In a real app, this would be an API call to submit check-in data
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

        // Navigate to success page
        navigate(`/pickup-success/${bookingId}`);
      } catch (error) {
        console.error("Error during check-in:", error);
        setErrors({ submit: "Failed to complete check-in. Please try again." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="pickup-container">
        <div className="breadcrumbs">
          <Link to="/my-bookings">My Bookings</Link> / Vehicle Pickup / Booking
          #{bookingId}
        </div>

        <h1>Vehicle Pickup Process</h1>

        <div className="booking-summary-card">
          <h2>Booking Details</h2>
          <div className="booking-details">
            <div className="detail-item">
              <span className="label">Vehicle:</span>
              <span className="value">{booking.vehicleName}</span>
            </div>
            <div className="detail-item">
              <span className="label">Pickup:</span>
              <span className="value">
                {new Date(booking.pickupDate).toLocaleDateString()} at{" "}
                {booking.pickupTime}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Return:</span>
              <span className="value">
                {new Date(booking.returnDate).toLocaleDateString()} at{" "}
                {booking.returnTime}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Location:</span>
              <span className="value">{booking.stationName}</span>
            </div>
          </div>
        </div>

        <div className="pickup-progress">
          <div
            className={`progress-step ${step >= 1 ? "active" : ""} ${
              step > 1 ? "completed" : ""
            }`}
          >
            <div className="step-number">1</div>
            <div className="step-label">ID Verification</div>
          </div>
          <div
            className={`progress-connector ${step > 1 ? "completed" : ""}`}
          ></div>
          <div
            className={`progress-step ${step >= 2 ? "active" : ""} ${
              step > 2 ? "completed" : ""
            }`}
          >
            <div className="step-number">2</div>
            <div className="step-label">Rental Agreement</div>
          </div>
          <div
            className={`progress-connector ${step > 2 ? "completed" : ""}`}
          ></div>
          <div
            className={`progress-step ${step >= 3 ? "active" : ""} ${
              step > 3 ? "completed" : ""
            }`}
          >
            <div className="step-number">3</div>
            <div className="step-label">Vehicle Inspection</div>
          </div>
          <div
            className={`progress-connector ${step > 3 ? "completed" : ""}`}
          ></div>
          <div className={`progress-step ${step >= 4 ? "active" : ""}`}>
            <div className="step-number">4</div>
            <div className="step-label">Confirmation</div>
          </div>
        </div>

        <div className="pickup-form-container">
          {step === 1 && (
            <div className="pickup-form">
              <h2>ID Verification</h2>
              <p>
                Please present your driver license to the staff member for
                verification.
              </p>

              <div className="form-section">
                <div className="file-upload-container">
                  <label>Driver License Verification</label>
                  <div className="upload-box">
                    {checkInData.driverLicense ? (
                      <div className="file-preview">
                        <span className="file-name">
                          {checkInData.driverLicense.name}
                        </span>
                        <span className="file-size">
                          {Math.round(checkInData.driverLicense.size / 1024)} KB
                        </span>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <div className="upload-icon">📷</div>
                        <div className="upload-text">
                          <span className="primary-text">
                            Scan Driver License
                          </span>
                          <span className="secondary-text">
                            Take a photo or upload file
                          </span>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "driverLicense")}
                      className="file-input"
                    />
                  </div>
                  {errors.driverLicense && (
                    <div className="error-message">{errors.driverLicense}</div>
                  )}
                </div>

                <div className="staff-verification-note">
                  <div className="note-icon">ℹ️</div>
                  <div className="note-text">
                    <strong>Staff verification required:</strong> A staff member
                    will verify your ID in person before proceeding.
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <Link to="/my-bookings" className="btn secondary">
                  Cancel
                </Link>
                <button
                  type="button"
                  className="btn primary"
                  onClick={nextStep}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="pickup-form">
              <h2>Rental Agreement</h2>
              <p>Please review and sign the rental agreement below.</p>

              <div className="form-section">
                <div className="rental-agreement">
                  <h3>Electric Vehicle Rental Agreement</h3>
                  <div className="agreement-text">
                    <p>
                      This Rental Agreement (the "Agreement") is entered into
                      between EV Rental Company ("Company") and {user.firstName}{" "}
                      {user.lastName} ("Renter") as of{" "}
                      {new Date().toLocaleDateString()}.
                    </p>

                    <h4>1. Vehicle Details</h4>
                    <p>
                      The Company agrees to rent to the Renter a{" "}
                      {booking.vehicleName} (the "Vehicle") for the period
                      specified in the booking confirmation.
                    </p>

                    <h4>2. Rental Period</h4>
                    <p>
                      From {new Date(booking.pickupDate).toLocaleDateString()}{" "}
                      at {booking.pickupTime} to{" "}
                      {new Date(booking.returnDate).toLocaleDateString()} at{" "}
                      {booking.returnTime}.
                    </p>

                    <h4>3. Payment</h4>
                    <p>
                      The total rental fee is ${booking.price}, payable at the
                      time of pickup.
                    </p>

                    <h4>4. Renter's Responsibilities</h4>
                    <p>The Renter agrees to:</p>
                    <ul>
                      <li>
                        Return the vehicle in the same condition as received
                      </li>
                      <li>
                        Operate the vehicle safely and in accordance with all
                        traffic laws
                      </li>
                      <li>Not modify or tamper with the vehicle</li>
                      <li>
                        Return the vehicle with at least 20% battery charge
                      </li>
                      <li>Report any accidents or damage immediately</li>
                    </ul>

                    <h4>5. Insurance</h4>
                    <p>
                      The rental includes standard insurance coverage. The
                      Renter is responsible for any damages not covered by
                      insurance.
                    </p>

                    <h4>6. Liability</h4>
                    <p>
                      The Renter assumes full responsibility for the vehicle
                      during the rental period. The Company is not liable for
                      any loss or damage to personal property left in the
                      vehicle.
                    </p>
                  </div>
                </div>

                <div className="signature-section">
                  <label>
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={checkInData.agreeToTerms}
                      onChange={handleInputChange}
                    />
                    I have read and agree to the terms of the rental agreement
                  </label>
                  {errors.agreeToTerms && (
                    <div className="error-message">{errors.agreeToTerms}</div>
                  )}

                  <div className="signature-box">
                    <label>Digital Signature</label>
                    <div className="upload-box">
                      {checkInData.signature ? (
                        <div className="file-preview">
                          <span className="file-name">
                            {checkInData.signature.name}
                          </span>
                          <span className="file-size">
                            {Math.round(checkInData.signature.size / 1024)} KB
                          </span>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <div className="upload-icon">✍️</div>
                          <div className="upload-text">
                            <span className="primary-text">
                              Add Your Signature
                            </span>
                            <span className="secondary-text">
                              Draw or upload an image
                            </span>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "signature")}
                        className="file-input"
                      />
                    </div>
                    {errors.signature && (
                      <div className="error-message">{errors.signature}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn primary"
                  onClick={nextStep}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="pickup-form">
              <h2>Vehicle Inspection</h2>
              <p>
                Please inspect the vehicle with our staff member and document
                its condition.
              </p>

              <div className="form-section">
                <div className="vehicle-photos">
                  <label>Vehicle Photos (at least 4 photos required)</label>
                  <div className="photo-grid">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="photo-upload-box">
                        {checkInData.vehiclePhotos[index] ? (
                          <div className="photo-preview">
                            <img
                              src={URL.createObjectURL(
                                checkInData.vehiclePhotos[index]
                              )}
                              alt={`Vehicle photo ${index + 1}`}
                            />
                            <button
                              type="button"
                              className="remove-photo"
                              onClick={() => handleRemovePhoto(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="upload-placeholder">
                              <div className="upload-icon">📷</div>
                              <div className="photo-label">
                                {index === 0
                                  ? "Front"
                                  : index === 1
                                  ? "Back"
                                  : index === 2
                                  ? "Left"
                                  : "Right"}
                              </div>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileUpload(e, "vehiclePhotos")
                              }
                              className="file-input"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.vehiclePhotos && (
                    <div className="error-message">{errors.vehiclePhotos}</div>
                  )}
                </div>

                <div className="vehicle-condition">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="initialOdometer">
                        Initial Odometer Reading (km)
                      </label>
                      <input
                        type="number"
                        id="initialOdometer"
                        name="initialOdometer"
                        value={checkInData.initialOdometer}
                        onChange={handleInputChange}
                        min="0"
                      />
                      {errors.initialOdometer && (
                        <div className="error-message">
                          {errors.initialOdometer}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="initialBatteryLevel">
                        Initial Battery Level (%)
                      </label>
                      <input
                        type="number"
                        id="initialBatteryLevel"
                        name="initialBatteryLevel"
                        value={checkInData.initialBatteryLevel}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                      />
                      {errors.initialBatteryLevel && (
                        <div className="error-message">
                          {errors.initialBatteryLevel}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn primary"
                  onClick={nextStep}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="pickup-form">
              <h2>Confirm Pickup</h2>
              <p>
                Please review all information and confirm your vehicle pickup.
              </p>

              <div className="form-section">
                <div className="pickup-summary">
                  <h3>Pickup Summary</h3>

                  <div className="summary-section">
                    <h4>Vehicle Information</h4>
                    <div className="summary-item">
                      <span className="label">Vehicle:</span>
                      <span className="value">{booking.vehicleName}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Odometer Reading:</span>
                      <span className="value">
                        {checkInData.initialOdometer} km
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Battery Level:</span>
                      <span className="value">
                        {checkInData.initialBatteryLevel}%
                      </span>
                    </div>
                  </div>

                  <div className="summary-section">
                    <h4>Rental Period</h4>
                    <div className="summary-item">
                      <span className="label">Pickup:</span>
                      <span className="value">
                        {new Date(booking.pickupDate).toLocaleDateString()} at{" "}
                        {booking.pickupTime}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Return:</span>
                      <span className="value">
                        {new Date(booking.returnDate).toLocaleDateString()} at{" "}
                        {booking.returnTime}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Total Price:</span>
                      <span className="value">${booking.price}</span>
                    </div>
                  </div>

                  <div className="summary-note">
                    <div className="note-icon">⚠️</div>
                    <div className="note-text">
                      <strong>Important:</strong> By clicking "Complete Pickup",
                      you confirm that all information is correct and that you
                      have received the vehicle in the condition documented.
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="error-message">{errors.submit}</div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn primary"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Complete Pickup"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
