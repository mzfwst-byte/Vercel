'use client'

import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import config from './map-config.json'

// 地球半径（km）
const R = 6371

function destination(lat, lng, bearingDeg, distanceKm) {
  const brng = bearingDeg * Math.PI / 180
  const d = distanceKm / R

  const lat1 = lat * Math.PI / 180
  const lng1 = lng * Math.PI / 180

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
    Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  )

  const lng2 = lng1 + Math.atan2(
    Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  )

  return [
    lat2 * 180 / Math.PI,
    lng2 * 180 / Math.PI
  ]
}

export default function MapClient() {
  const centersEnv = JSON.parse(process.env.NEXT_PUBLIC_CENTERS)

  return (
    <MapContainer
      center={[37.6779, 140.6669]}
      zoom={10}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {config.centers.map(center => {
        const envCenter = centersEnv[center.id]
        if (!envCenter) return null

        const start = [envCenter.lat, envCenter.lng]

        return (
          <div key={center.id}>
            <Marker position={start} />

            {center.lines.map((line, i) => {
              const end = destination(
                envCenter.lat,
                envCenter.lng,
                line.bearing,
                line.lengthKm
              )

              return (
                <Polyline
                  key={i}
                  positions={[start, end]}
                  pathOptions={{ color: line.color, weight: 3 }}
                />
              )
            })}
          </div>
        )
      })}
    </MapContainer>
  )
}
