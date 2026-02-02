'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import config from './map-config.json'

export default function MapClient() {
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  const [debug, setDebug] = useState([])

  useEffect(() => {
    if (mapRef.current) return

    const map = L.map('map', {
      center: [35.681236, 139.767125], // 仮（東京駅）
      zoom: 10
    })

    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)

    const layer = L.layerGroup().addTo(map)
    layerRef.current = layer

    const logs = []

    config.centers.forEach(center => {
      //const lat = Number(process.env[`NEXT_PUBLIC_${center.id}_LAT`])
      //const lng = Number(process.env[`NEXT_PUBLIC_${center.id}_LNG`])

      const lat = Number(process.env.NEXT_PUBLIC_CENTER_center1_LAT)
      const lng = Number(process.env.NEXT_PUBLIC_CENTER_center1_LNG)

      logs.push(`CENTER ${center.id}`)
      logs.push(`lat=${lat} lng=${lng}`)

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        logs.push('❌ 座標取得失敗')
        return
      }

      L.marker([lat, lng]).addTo(layer)

      center.bearings.forEach((b, i) => {
        const rad = (b.angle * Math.PI) / 180
        const dx = (b.lengthKm / 111) * Math.cos(rad)
        const dy = (b.lengthKm / 111) * Math.sin(rad)

        const toLat = lat + dx
        const toLng = lng + dy

        L.polyline(
          [
            [lat, lng],
            [toLat, toLng]
          ],
          {
            color: b.color || 'red',
            weight: 4
          }
        ).addTo(layer)

        logs.push(
          `  └ bearing${i + 1}: angle=${b.angle}, km=${b.lengthKm}, color=${b.color}`
        )
      })
    })

    setDebug(logs)
  }, [])

  return (
    <>
      <div
        id="map"
        style={{
          width: '100vw',
          height: '100vh'
        }}
      />

      {/* 🔽 情報表示パネル */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '40vh',
          overflowY: 'auto',
          background: 'rgba(0,0,0,0.8)',
          color: '#0f0',
          fontSize: '12px',
          padding: '8px',
          zIndex: 9999,
          fontFamily: 'monospace'
        }}
      >
        {debug.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
    </>
  )
}
