'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import config from './map-config.json'

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
  const [logs, setLogs] = useState([])
  const log = (msg) => setLogs(l => [...l, msg])

  let centersEnv = {}

  try {
    log('▶ parsing NEXT_PUBLIC_CENTERS')
    centersEnv = JSON.parse(process.env.NEXT_PUBLIC_CENTERS || '{}')
    log('✅ env parsed: ' + JSON.stringify(centersEnv))
  } catch (e) {
    log('❌ env parse error: ' + e.message)
  }

  useEffect(() => {
    log('▶ config loaded')
    log(JSON.stringify(config))
  }, [])

  return (
    <>
      {/* ==== LOG PANEL ==== */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        color: '#0f0',
        fontSize: '12px',
        padding: '8px',
        maxHeight: '40vh',
        overflow: 'auto',
        width: '100%'
      }}>
        {logs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

      {/* ==== MAP ==== */}
      <MapContainer
        center={[34.6779, 140.6669]}
        zoom={10}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {config.centers.map(center => {
          const envCenter = centersEnv[center.id]

          if (!envCenter) {
            log(`❌ center not found in env: ${center.id}`)
            return null
          }

          log(`✅ center loaded: ${center.id}`)

          const start = [envCenter.lat, envCenter.lng]

          return (
            <div key={center.id}>
              <Marker position={start} />

              {center.lines.map((line, i) => {
                try {
                  const end = destination(
                    envCenter.lat,
                    envCenter.lng,
                    line.bearing,
                    line.lengthKm
                  )

                  log(`→ line ${center.id} ${line.bearing}° ${line.lengthKm}km`)

                  return (
                    <Polyline
                      key={i}
                      positions={[start, end]}
                      pathOptions={{ color: line.color || 'red', weight: 3 }}
                    />
                  )
                } catch (e) {
                  log(`❌ line error: ${e.message}`)
                  return null
                }
              })}
            </div>
          )
        })}
      </MapContainer>
    </>
  )
}
