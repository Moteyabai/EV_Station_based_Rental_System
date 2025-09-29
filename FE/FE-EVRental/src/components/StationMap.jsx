import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import "../styles/StationMap.css";

// Fix icon issues with Leaflet
delete L.Icon.Default.prototype._getIconUrl;

// Make sure Leaflet CSS is loaded
if (!document.getElementById("leaflet-css")) {
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}

// Custom icons
const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle geolocation and centering map
function LocationMarker({ onLocationFound }) {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 14 });

    map.on("locationfound", (e) => {
      setPosition(e.latlng);
      if (onLocationFound) onLocationFound(e.latlng);
    });

    map.on("locationerror", (e) => {
      console.log("Location error:", e.message);
      // Default to Hanoi coordinates if location not found
      const defaultPosition = { lat: 21.0285, lng: 105.8542 };
      setPosition(defaultPosition);
      map.setView(defaultPosition, 13);
      if (onLocationFound) onLocationFound(defaultPosition);
    });
  }, [map, onLocationFound]);

  return position === null ? null : (
    <Marker position={position} icon={blueIcon}>
      <Popup>Vị trí hiện tại của bạn</Popup>
    </Marker>
  );
}

export default function StationMap({
  stations,
  onStationSelect,
  selectedStation,
  userLocation,
}) {
  const [stationsWithDistance, setStationsWithDistance] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 10.762622, lng: 106.660172 }); // Default TPHCM

  // Set map center when user location is available
  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  }, [userLocation]);

  // Calculate stations with distance when user location is available
  useEffect(() => {
    if (userLocation && stations) {
      // Calculate distance from user to each station
      const stationsWithDist = stations.map((station) => {
        // Xử lý cấu trúc dữ liệu đa dạng của location
        const stationLatLng = {
          lat:
            station.location?.latitude || station.coordinates?.lat || 10.762622,
          lng:
            station.location?.longitude ||
            station.coordinates?.lng ||
            106.660172,
        };
        const distanceInKm = calculateDistance(userLocation, stationLatLng);
        const estimatedTime = calculateEstimatedTime(distanceInKm * 1000); // Convert to meters

        return {
          ...station,
          distance: distanceInKm,
          estimatedTime: estimatedTime,
        };
      });

      // Sort by distance
      stationsWithDist.sort((a, b) => a.distance - b.distance);
      setStationsWithDistance(stationsWithDist);
    } else if (stations) {
      // If no user location, just use stations as is
      setStationsWithDistance(stations);
    }
  }, [userLocation, stations]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth radius in km
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
  };

  // Calculate estimated travel time (simple approximation)
  const calculateEstimatedTime = (distanceInMeters) => {
    const averageSpeed = 25; // km/h (average urban speed)
    const timeInHours = distanceInMeters / 1000 / averageSpeed;
    const timeInMinutes = Math.ceil(timeInHours * 60);

    if (timeInMinutes < 60) {
      return `${timeInMinutes} phút`;
    } else {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = timeInMinutes % 60;
      return `${hours} giờ ${minutes > 0 ? minutes + " phút" : ""}`;
    }
  };

  if (!stations || stations.length === 0) {
    return <div className="no-stations">Không tìm thấy trạm nào.</div>;
  }

  return (
    <div className="station-map-container">
      <div className="map-header">
        <h3>🗺️ Bản đồ điểm thuê xe điện</h3>
        {userLocation && <p>📍 Đã xác định vị trí của bạn</p>}
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={userLocation ? 14 : 12}
          style={{ height: "500px", width: "100%" }}
          zoomControl={false}
          className="leaflet-map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <ZoomControl position="bottomright" />
          
          {/* Hiển thị vị trí người dùng nếu có */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={blueIcon}>
              <Popup>📍 Vị trí hiện tại của bạn</Popup>
            </Marker>
          )}

          {stations.map((station) => {
            const lat =
              station.location?.latitude ||
              station.coordinates?.lat ||
              10.762622;
            const lng =
              station.location?.longitude ||
              station.coordinates?.lng ||
              106.660172;

            return (
              <Marker
                key={station.id}
                position={[lat, lng]}
                icon={greenIcon}
                eventHandlers={{
                  click: () => onStationSelect && onStationSelect(station),
                }}
              >
                <Popup>
                  <div className="station-popup">
                    <h3>{station.name}</h3>
                    <p>{station.address}</p>
                    <p>
                      Xe có sẵn: {station.availableVehicles || "Đang cập nhật"}
                    </p>
                    <Link
                      to={`/stations/${station.id}`}
                      className="btn-view-station"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="nearby-stations">
        <h3>{userLocation ? '🎯 Trạm gần bạn' : '📍 Danh sách các trạm'}</h3>
        <div className="stations-list">
          {stationsWithDistance.length > 0 ? (
            stationsWithDistance.slice(0, 8).map((station) => (
              <div
                key={station.id}
                className={`station-item ${
                  selectedStation?.id === station.id ? "selected" : ""
                }`}
                onClick={() => onStationSelect && onStationSelect(station)}
              >
                <div className="station-info">
                  <h4>{station.name}</h4>
                  <p className="station-address">{station.address}</p>
                  <div className="station-metrics">
                    {station.distance && (
                      <span className="distance">
                        � {station.distance.toFixed(1)} km
                      </span>
                    )}
                    {station.estimatedTime && (
                      <span className="time">⏱️ {station.estimatedTime}</span>
                    )}
                  </div>
                  <div className="station-availability">
                    <span
                      className={`availability-badge ${
                        station.availableVehicles > 0
                          ? "available"
                          : "unavailable"
                      }`}
                    >
                      {station.availableVehicles > 0
                        ? `🚗 ${station.availableVehicles} xe có sẵn`
                        : "❌ Hết xe"}
                    </span>
                  </div>
                </div>
                <div className="station-actions-map">
                  <Link to={`/stations/${station.id}`} className="btn-view">
                    Chi tiết
                  </Link>
                  <button
                    className="btn-navigate"
                    onClick={(e) => {
                      e.stopPropagation();
                      const lat = station.location?.latitude || station.coordinates?.lat;
                      const lng = station.location?.longitude || station.coordinates?.lng;
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                        "_blank"
                      );
                    }}
                  >
                    Chỉ đường
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>Không có trạm nào để hiển thị.</p>
          )}
        </div>
      </div>
    </div>
  );
}
