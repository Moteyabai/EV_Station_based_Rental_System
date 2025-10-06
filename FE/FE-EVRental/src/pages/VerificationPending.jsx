import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Auth.css";

export default function VerificationPending() {
  const { verificationStatus, user } = useAuth();

  return (
    <div className="auth-page">
      <div className="auth-card verification-card">
        <div className="verification-icon">
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>

        <h2>Verification Pending</h2>

        <div className="verification-status">
          <p className="status-message">
            {verificationStatus?.verificationMessage ||
              "Your documents have been submitted and are pending verification."}
          </p>

          <div className="status-details">
            <div className="status-item">
              <div className="status-label">Account Created</div>
              <div className="status-value complete">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
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
                Complete
              </div>
            </div>

            <div className="status-item">
              <div className="status-label">Documents Submitted</div>
              <div className="status-value complete">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
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
                Complete
              </div>
            </div>

            <div className="status-item">
              <div className="status-label">In-Person Verification</div>
              <div className="status-value pending">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Pending
              </div>
            </div>
          </div>
        </div>

        <div className="verification-info">
          <h3>Next Steps</h3>
          <ol>
            <li>Visit any EV rental location</li>
            <li>Bring your original ID and driver's license</li>
            <li>Our staff will verify your documents in minutes</li>
            <li>Start renting immediately after verification</li>
          </ol>
        </div>

        <div className="verification-actions">
          <Link to="/stations" className="btn primary">
            Find Rental Locations
          </Link>
          <Link to="/" className="btn secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
