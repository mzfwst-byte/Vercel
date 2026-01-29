'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// 方位線設定（緯度経度は含めない）
import mapConfig from '../../map-config.json'

/*
環境変数（例）
NEXT_PUBLIC_CENTER_1_LAT=35.67797599
NEXT_PUBLIC_CENTER_1_LNG=139.66690577
NEXT_PUBLIC_CENTER_2_LAT=35.68
NEXT_PUBLIC_CENTER_2_LNG=139.67
*/

function getCentersFromEnv() {
  const centers = []

  Object.keys(process.env).forEach((key) => {
    if (key.startsWith('NEXT_PUBLIC_CENTER_') && key.endsWith('_LAT')) {
      const id = key.replace('_LAT', '')
      const lat = Number(process.env[key])
      const lng = Number(process.env[`${id}_LNG`])

      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        centers.push({ id, lat, lng })
      }
    }
  })

  return centers
}

function destination(lat, lng, bearingDeg, meters) {
  const R = 6378137
  const rad = Math.PI / 180

  const lat1 = lat * rad
  const lng1 = lng * rad
  const brng = bearingDeg * rad
  const d = meters / R

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

export default function MapClient() {
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (mapRef.current) return

    const centers = getCentersFromEnv()
    if (centers.length === 0) return

    const map = L.map('map', {
      zoomControl: true,
    }).setView([centers[0].lat, centers[0].lng], 13)

    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    layerRef.current = L.layerGroup().addTo(map)

    const drawBearings = () => {
      layerRef.current.clearLayers()

      const bounds = map.getBounds()

      centers.forEach((center, idx) => {
        const centerLatLng = L.latLng(center.lat, center.lng)

        // 画面横幅の40%を方位線長さに（レスポンシブ）
        const meters =
          centerLatLng.distanceTo(
            L.latLng(centerLatLng.lat, bounds.getEast())
          ) * 0.4

        // 中心点マーカー
        L.circleMarker(centerLatLng, {
          radius: 6,
          color: '#000',
          fillColor: '#fff',
          fillOpacity: 1,
          weight: 2,
        }).addTo(layerRef.current)

        // JSONで定義された方位線
        const bearings =
          mapConfig.centers?.[idx]?.bearings ?? []

        bearings.forEach((b) => {
          const end = destination(
            center.lat,
            center.lng,
            b.angle,
            meters
          )

          L.polyline(
            [
              [center.lat, center.lng],
              end,
            ],
            {
              color: b.color || 'red',
              weight: 2,
              opacity: 0.9,
            }
          ).addTo(layerRef.current)
        })
      })
    }

    drawBearings()

    map.on('zoomend resize moveend', drawBearings)

    return () => {
      map.off()
      map.remove()
    }
  }, [])

  return (
    <div
      id="map"
      style={{
        width: '100%',
        height: '100vh',
      }}
    />
  )
}
