'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapClient() {
  useEffect(() => {
    const lat = 35.67797599475285
    const lng = 139.66690577010075

    const map = L.map('map').setView([lat, lng], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map)

    function draw(deg) {
      const r = deg * Math.PI / 180
      const d = 0.06
      return [lat + d * Math.cos(r), lng + d * Math.sin(r)]
    }

    L.polyline([[lat, lng], draw(250)], { color: 'red' }).addTo(map)
    L.polyline([[lat, lng], draw(200)], { color: 'blue' }).addTo(map)
  }, [])

  return <div id="map" style={{ height: '100vh', width: '100vw' }} />
}
