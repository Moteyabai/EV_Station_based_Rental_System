import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import stations from '../data/stations'
import { useAuth } from '../contexts/AuthContext'
import './Home.css'

export default function StationDetail() {
  const { id } = useParams()
  const station = stations.find((s) => s.id === id)
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!station) return <p>Station not found.</p>

  function handleReserve() {
    if (!user) {
      navigate('/login')
      return
    }
    // placeholder: in real app call reservation API
    alert(`Reservation confirmed for ${station.name} (user: ${user.email})`)
  }

  return (
    <main className="home">
      <div className="station-detail">
        <h2>{station.name}</h2>
        <p className="meta">{station.bikesAvailable} bikes available • {station.distance}</p>
        <p>{station.description}</p>
        <button className="btn primary" onClick={handleReserve}>Reserve bike</button>
      </div>
    </main>
  )
}
