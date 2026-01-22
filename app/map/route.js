export const dynamic = 'force-dynamic'

export function GET() {
  return new Response(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Map</title>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  const lat = 35.67797599475285;
  const lng = 139.66690577010075;

  const map = L.map('map').setView([lat, lng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);

  const draw = (deg) => {
    const r = deg * Math.PI / 180;
    const d = 0.06;
    return [
      lat + d * Math.cos(r),
      lng + d * Math.sin(r)
    ];
  };

  L.polyline([[lat, lng], draw(250)], { color: 'red' }).addTo(map);
  L.polyline([[lat, lng], draw(200)], { color: 'blue' }).addTo(map);
</script>
</body>
</html>`, {
    headers: {
      'Content-Type': 'text/html'
    }
  })
}
