'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapClient() {
  useEffect(() => {
    const lat = Number(process.env.NEXT_PUBLIC_CENTER_center1_LAT)
    const lng = Number(process.env.NEXT_PUBLIC_CENTER_center1_LNG)

    const bearing1 = Number(process.env.NEXT_PUBLIC_BEARING_1)
    const bearing2 = Number(process.env.NEXT_PUBLIC_BEARING_2)

    const distanceKm = Number(process.env.NEXT_PUBLIC_DISTANCE_KM)

    const map = L.map('map').setView([lat, lng], 10)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map)

    // km → 緯度経度換算（簡易）
    const DEG_PER_KM = 1 / 111
    const d = distanceKm * DEG_PER_KM

    function endpoint(deg) {
      const r = deg * Math.PI / 180
      return [
        lat + d * Math.cos(r),
        lng + d * Math.sin(r)
      ]
    }

    L.polyline([[lat, lng], endpoint(bearing1)], { color: 'red' }).addTo(map)
    L.polyline([[lat, lng], endpoint(bearing2)], { color: 'blue' }).addTo(map)

  }, [])

  return <div id="map" style={{ height: '100vh', width: '100vw' }} />
}
