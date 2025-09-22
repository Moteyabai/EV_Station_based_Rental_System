import React from 'react'
import { Link } from 'react-router-dom'
import './StationList.css'

export default function StationList({ stations }) {
  if (!stations || stations.length === 0) return <p>No stations found.</p>

  return (
    <div className="station-list">
      {stations.map((station) => (
        <article key={station.id} className="station">
          <div className="station-image">
            {station.images && station.images.thumbnail ? (
              <img src={station.images.thumbnail} alt={station.name} />
            ) : (
              <div className="no-image">No Image Available</div>
            )}
          </div>
          <div className="station-content">
            <h3>{station.name}</h3>
            <p className="meta">
              <span className="available-vehicles">{station.availableVehicles} vehicles available</span> • 
              <span className="charging-stations">{station.chargingStations} charging stations</span>
            </p>
            <p className="location">{station.address}</p>
            <p className="desc">{station.description}</p>
            <div className="station-actions">
              <Link to={`/stations/${station.id}`} className="btn">View Details</Link>
              <button className="btn primary">Reserve Now</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
