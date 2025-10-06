import React from "react";
import { Link, useParams } from "react-router-dom";
import { mockBookings } from "../constants/mockData";
import "../styles/VehicleReturn.css";

export default function ReturnSuccess() {
  const { bookingId } = useParams();

  // In a real app, fetch booking details from API
  const booking = mockBookings[bookingId];

  if (!booking) {
    return (
      <div className="return-container">
        <div className="not-found-container">
          <h2>Booking Not Found</h2>
          <p>We couldn't find the booking information you're looking for.</p>
          <Link to="/my-bookings" className="btn primary">
            Go to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="success-container">
        <div className="success-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" />
          </svg>
        </div>

        <h1>Vehicle Return Complete!</h1>
        <p className="success-message">
          You have successfully returned your vehicle. Thank you for choosing
          our service!
        </p>

        <div className="success-card">
          <div className="card-header">
            <h2>Return Summary</h2>
            <span className="booking-number">Booking #{booking.id}</span>
          </div>

          <div className="card-body">
            <div className="detail-row">
              <div className="detail-item">
                <span className="label">Vehicle</span>
                <span className="value">{booking.vehicleName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Type</span>
                <span className="value">{booking.vehicleType}</span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-item">
                <span className="label">Rental Period</span>
                <span className="value">
                  {new Date(booking.pickupDate).toLocaleDateString()} -{" "}
                  {new Date(booking.returnDate).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Return Location</span>
                <span className="value">{booking.stationName}</span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-item">
                <span className="label">Distance Traveled</span>
                <span className="value">{booking.distanceTraveled} km</span>
              </div>
              <div className="detail-item">
                <span className="label">Battery Level at Return</span>
                <span className="value">{booking.finalBatteryLevel}%</span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-item">
                <span className="label">Base Rental Fee</span>
                <span className="value">${booking.price.toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Additional Charges</span>
                <span className="value">
                  ${booking.extraCharges.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-item">
                <span className="label">Total Amount</span>
                <span
                  className="value"
                  style={{ color: "var(--primary-color)", fontWeight: "bold" }}
                >
                  ${booking.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Status</span>
                <span
                  className="value"
                  style={{ color: "green", fontWeight: "bold" }}
                >
                  Completed
                </span>
              </div>
            </div>

            {booking.extraCharges.total > 0 && (
              <div className="detail-row full-width">
                <div className="detail-item">
                  <span className="label">Additional Charges Breakdown</span>
                  <div className="charges-breakdown">
                    {booking.extraCharges.lateFee > 0 && (
                      <div className="charge-item">
                        <span>Late Return Fee:</span>
                        <span>${booking.extraCharges.lateFee.toFixed(2)}</span>
                      </div>
                    )}
                    {booking.extraCharges.damageFee > 0 && (
                      <div className="charge-item">
                        <span>Damage Fee:</span>
                        <span>
                          ${booking.extraCharges.damageFee.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {booking.extraCharges.cleaningFee > 0 && (
                      <div className="charge-item">
                        <span>Cleaning Fee:</span>
                        <span>
                          ${booking.extraCharges.cleaningFee.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {booking.extraCharges.lowBatteryFee > 0 && (
                      <div className="charge-item">
                        <span>Low Battery Fee:</span>
                        <span>
                          ${booking.extraCharges.lowBatteryFee.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="next-steps-card">
          <h2>Thank You for Your Rental</h2>
          <div className="steps-list">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Your Receipt</h3>
                <p>
                  A receipt has been sent to your email address. You can also
                  view your rental history and receipts in your account
                  dashboard.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Feedback</h3>
                <p>
                  Your feedback helps us improve. Please take a moment to rate
                  your overall experience with our service.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Book Again</h3>
                <p>
                  Planning another trip? We offer discounts for returning
                  customers. Check out our latest EV models and promotions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <Link to="/dashboard" className="btn secondary">
            Go to Dashboard
          </Link>
          <Link to="/book" className="btn primary">
            Book Another Vehicle
          </Link>
        </div>
      </div>
    </div>
  );
}
