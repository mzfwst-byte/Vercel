'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import config from './map-config.json'

export default function MapClient() {
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (mapRef.current) return

    // 初期表示は CENTER_1
    const initialLat = Number(process.env.NEXT_PUBLIC_CENTER_center1_LAT)
    const initialLng = Number(process.env.NEXT_PUBLIC_CENTER_center1_LNG)

    mapRef.current = L.map('map').setView(
      [initialLat, initialLng],
      13
    )

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapRef.current)

    layerRef.current = L.layerGroup().addTo(mapRef.current)

    drawAllCenters()

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  const drawAllCenters = () => {
    layerRef.current.clearLayers()

    const destination = (lat, lng, bearing, meters) => {
      const R = 6378137
      const rad = Math.PI / 180
      const d = meters / R

      const lat1 = lat * rad
      const lng1 = lng * rad
      const brng = bearing * rad

      const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(d) +
          Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
      )

      const lng2 =
        lng1 +
        Math.atan2(
          Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
          Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
        )

      return [lat2 / rad, lng2 / rad]
    }

    config.centers.forEach((centerConfig) => {
      const lat = Number(
        process.env[`NEXT_PUBLIC_${centerConfig.id}_LAT`]
      )
      const lng = Number(
        process.env[`NEXT_PUBLIC_${centerConfig.id}_LNG`]
      )

      if (!lat || !lng) return

      // 中心点マーカー
      L.circleMarker([lat, lng], {
        radius: 6,
        color: 'black',
        fillColor: 'yellow',
        fillOpacity: 1,
      }).addTo(layerRef.current)

      centerConfig.bearings.forEach((b) => {
        const meters = (b.lengthKm ?? 5) * 1000
        const end = destination(lat, lng, b.angle, meters)

        L.polyline(
          [
            [lat, lng],
            end,
          ],
          {
            color: b.color || 'red',
            weight: 2,
          }
        ).addTo(layerRef.current)
      })
    })
  }

  return <div id="map" style={{ width: '100%', height: '100vh' }} />
}
