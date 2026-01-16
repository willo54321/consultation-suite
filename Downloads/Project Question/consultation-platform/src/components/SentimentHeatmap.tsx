'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'

// Extend Leaflet types for heatmap
declare module 'leaflet' {
  function heatLayer(
    latlngs: Array<[number, number, number]>,
    options?: {
      minOpacity?: number
      maxZoom?: number
      max?: number
      radius?: number
      blur?: number
      gradient?: { [key: number]: string }
    }
  ): L.Layer
}

interface SentimentCluster {
  latitude: number
  longitude: number
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  count: number
}

interface SentimentHeatmapProps {
  clusters: SentimentCluster[]
  height?: string
}

// Heatmap layer component that adds/removes layers on the map
function HeatmapLayer({
  points,
  gradient,
  visible,
}: {
  points: Array<[number, number, number]>
  gradient: { [key: number]: string }
  visible: boolean
}) {
  const map = useMap()

  useEffect(() => {
    if (!visible || points.length === 0) return

    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient,
    })

    heat.addTo(map)

    return () => {
      map.removeLayer(heat)
    }
  }, [map, points, gradient, visible])

  return null
}

export function SentimentHeatmap({ clusters, height = '400px' }: SentimentHeatmapProps) {
  const [showPositive, setShowPositive] = useState(true)
  const [showNegative, setShowNegative] = useState(true)

  // Calculate center and zoom from clusters
  const { center, zoom } = useMemo(() => {
    if (clusters.length === 0) {
      return { center: [51.5074, -0.1278] as [number, number], zoom: 15 }
    }

    const lats = clusters.map(c => c.latitude)
    const lngs = clusters.map(c => c.longitude)

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2

    const latDiff = maxLat - minLat
    const lngDiff = maxLng - minLng
    const maxDiff = Math.max(latDiff, lngDiff)

    let calculatedZoom = 15
    if (maxDiff > 0.1) calculatedZoom = 12
    else if (maxDiff > 0.05) calculatedZoom = 13
    else if (maxDiff > 0.02) calculatedZoom = 14
    else if (maxDiff > 0.01) calculatedZoom = 15
    else calculatedZoom = 16

    return {
      center: [centerLat, centerLng] as [number, number],
      zoom: calculatedZoom,
    }
  }, [clusters])

  // Prepare heatmap data points [lat, lng, intensity]
  const { positivePoints, negativePoints } = useMemo(() => {
    const positive: Array<[number, number, number]> = []
    const negative: Array<[number, number, number]> = []

    const maxCount = Math.max(...clusters.map(c => c.count), 1)

    clusters.forEach(cluster => {
      const intensity = cluster.count / maxCount

      if (cluster.sentiment === 'positive') {
        positive.push([cluster.latitude, cluster.longitude, intensity])
      } else if (cluster.sentiment === 'negative') {
        negative.push([cluster.latitude, cluster.longitude, intensity])
      } else if (cluster.sentiment === 'mixed') {
        positive.push([cluster.latitude, cluster.longitude, intensity * 0.5])
        negative.push([cluster.latitude, cluster.longitude, intensity * 0.5])
      }
    })

    return { positivePoints: positive, negativePoints: negative }
  }, [clusters])

  // Gradient for positive (green)
  const positiveGradient = {
    0.0: 'rgba(16, 185, 129, 0)',
    0.2: 'rgba(16, 185, 129, 0.3)',
    0.4: 'rgba(5, 150, 105, 0.5)',
    0.6: 'rgba(4, 120, 87, 0.7)',
    0.8: 'rgba(6, 95, 70, 0.85)',
    1.0: 'rgba(6, 78, 59, 1)',
  }

  // Gradient for negative (red)
  const negativeGradient = {
    0.0: 'rgba(239, 68, 68, 0)',
    0.2: 'rgba(239, 68, 68, 0.3)',
    0.4: 'rgba(220, 38, 38, 0.5)',
    0.6: 'rgba(185, 28, 28, 0.7)',
    0.8: 'rgba(153, 27, 27, 0.85)',
    1.0: 'rgba(127, 29, 29, 1)',
  }

  const positiveCount = clusters.filter(c => c.sentiment === 'positive' || c.sentiment === 'mixed').reduce((sum, c) => sum + c.count, 0)
  const negativeCount = clusters.filter(c => c.sentiment === 'negative' || c.sentiment === 'mixed').reduce((sum, c) => sum + c.count, 0)

  return (
    <div style={{ height }} className="relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <HeatmapLayer
          points={positivePoints}
          gradient={positiveGradient}
          visible={showPositive}
        />

        <HeatmapLayer
          points={negativePoints}
          gradient={negativeGradient}
          visible={showNegative}
        />
      </MapContainer>

      {/* Legend & Controls */}
      <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-4 text-sm z-[1000]">
        <p className="font-semibold text-slate-900 mb-3">Sentiment Layers</p>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showPositive}
              onChange={(e) => setShowPositive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-emerald-200 to-emerald-700" />
              <span className="text-slate-700">Positive</span>
              <span className="text-slate-400 text-xs">({positiveCount})</span>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showNegative}
              onChange={(e) => setShowNegative(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-red-200 to-red-700" />
              <span className="text-slate-700">Negative</span>
              <span className="text-slate-400 text-xs">({negativeCount})</span>
            </div>
          </label>
        </div>
        <p className="text-slate-400 text-xs mt-3 pt-3 border-t border-slate-100">
          Brighter = more feedback
        </p>
      </div>
    </div>
  )
}
