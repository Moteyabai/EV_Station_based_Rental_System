import React from "react";
import { useParams, Link } from "react-router-dom";
import { mockBookings } from "../constants/mockData";
import "../styles/VehiclePickup.css";

export default function PickupSuccess() {
  const { bookingId } = useParams();
  const booking = mockBookings[bookingId];

  if (!booking) {
    return (
      <div className="page-container">
        <div className="not-found-container">
          <h2>Booking Not Found</h2>
          <p>Sorry, the booking you're looking for doesn't exist.</p>
          <Link to="/my-bookings" className="btn primary">
            View My Bookings
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
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>

        <h1>Vehicle Pickup Complete!</h1>
        <p className="success-message">
          You've successfully checked out your {booking.vehicleName}.
        </p>

        <div className="success-card">
          <div className="card-header">
            <h2>Pickup Details</h2>
            <div className="booking-number">Booking #{bookingId}</div>
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
                <span className="label">Pickup Location</span>
                <span className="value">{booking.stationName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Pickup Date</span>
                <span className="value">
                  {new Date(booking.pickupDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-item">
                <span className="label">Return Location</span>
                <span className="value">{booking.stationName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Return Date</span>
                <span className="value">
                  {new Date(booking.returnDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-item full-width">
                <span className="label">Return Instructions</span>
                <span className="value instructions">
                  Please return the vehicle to the same station by{" "}
                  {booking.returnTime} on{" "}
                  {new Date(booking.returnDate).toLocaleDateString()}. Ensure
                  the vehicle has at least 20% battery charge upon return to
                  avoid additional fees.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="next-steps-card">
          <h2>What's Next?</h2>

          <div className="steps-list">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Enjoy Your Ride</h3>
                <p>
                  Your EV is now ready to drive. Remember to follow all traffic
                  rules and drive safely.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Charging Your Vehicle</h3>
                <p>
                  If you need to charge your vehicle during your rental period,
                  you can use any of our charging stations or public charging
                  networks.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Return Process</h3>
                <p>
                  Return the vehicle to {booking.stationName} by{" "}
                  {booking.returnTime} on{" "}
                  {new Date(booking.returnDate).toLocaleDateString()}. A staff
                  member will assist you with the return inspection.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <Link to="/ev-guide" className="btn secondary">
            EV Guide & Tips
          </Link>
          <Link to="/" className="btn primary">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
