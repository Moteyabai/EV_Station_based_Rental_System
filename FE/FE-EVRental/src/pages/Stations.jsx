import React from 'react';
import StationFinder from '../components/StationFinder';
import '../styles/Pages.css';

export default function Stations() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>EV Rental Stations</h1>
        <p>Find the closest station to start your electric journey</p>
      </div>
      
      <StationFinder />
    </div>
  );
}