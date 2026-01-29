'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import config from '../../../map-config.json'

export default function MapClient() {
  useEffect(() => {
    const map = L.map('map').setView([35.6895, 139.6917], 10)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map)

    // 角度 → ラジアン
    const toRad = deg => (deg * Math.PI) / 180

    // レスポンシブ距離（画面幅の40%）
    const calcEndpoint = (center, bearingDeg) => {
      const size = map.getSize()
      const lengthPx = size.x * 0.4

      const start = map.latLngToContainerPoint(center)
      const rad = toRad(bearingDeg)

      const endPoint = L.point(
        start.x + lengthPx * Math.sin(rad),
        start.y - lengthPx * Math.cos(rad)
      )

      return map.containerPointToLatLng(endPoint)
    }

    config.centers.forEach(centerConfig => {
      const lat = Number(
        process.env[`NEXT_PUBLIC_CENTER_${centerConfig.id}_LAT`]
      )
      const lng = Number(
        process.env[`NEXT_PUBLIC_CENTER_${centerConfig.id}_LNG`]
      )

      if (isNaN(lat) || isNaN(lng)) return

      const center = L.latLng(lat, lng)

      centerConfig.bearings.forEach(b => {
        const end = calcEndpoint(center, b.deg)

        L.polyline([center, end], {
          color: b.color,
          weight: 3
        }).addTo(map)
      })
    })
  }, [])

  return <div id="map" style={{ height: '100vh', width: '100vw' }} />
}
