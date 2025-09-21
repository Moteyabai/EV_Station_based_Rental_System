import React from 'react'
import { Link } from 'react-router-dom'
import './StationList.css'

export default function StationList({ stations }) {
  if (!stations || stations.length === 0) return <p>No stations found.</p>

  return (
    <div className="station-list">
      {stations.map((s) => (
        <article key={s.id} className="station">
          <h3>{s.name}</h3>
          <p className="meta">{s.bikesAvailable} bikes available • {s.distance}</p>
          <p className="desc">{s.description}</p>
          <div className="station-actions">
            <Link to={`/stations/${s.id}`} className="btn">View</Link>
            <button className="btn primary">Reserve</button>
          </div>
        </article>
      ))}
    </div>
  )
}
