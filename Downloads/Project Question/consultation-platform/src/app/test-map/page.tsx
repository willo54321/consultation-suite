'use client'

import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'
import { useCallback, useState, useEffect } from 'react'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export default function TestMapPage() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-embed',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['drawing', 'geometry'] as any
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [mapTypeId, setMapTypeId] = useState<string>('')

  const onLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded!', map)
    setMap(map)

    // Force set map type and log it
    map.setMapTypeId('roadmap')
    setMapTypeId(map.getMapTypeId() || 'unknown')

    // Try triggering resize after a delay
    setTimeout(() => {
      google.maps.event.trigger(map, 'resize')
      map.setCenter({ lat: 51.5074, lng: -0.1278 })
      console.log('Resize triggered, center:', map.getCenter()?.toString())
    }, 500)
  }, [])

  // Debug: check what Google object looks like
  useEffect(() => {
    if (isLoaded && typeof google !== 'undefined') {
      console.log('Google Maps loaded, version info:', google.maps.version)
    }
  }, [isLoaded])

  const apiKeyPreview = GOOGLE_MAPS_API_KEY
    ? `${GOOGLE_MAPS_API_KEY.substring(0, 10)}...${GOOGLE_MAPS_API_KEY.substring(GOOGLE_MAPS_API_KEY.length - 4)}`
    : 'NOT SET'

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Map Test Page - Diagnostics</h1>

      <div className="mb-4 p-4 bg-gray-100 rounded text-sm font-mono">
        <p><strong>API Key:</strong> {apiKeyPreview}</p>
        <p><strong>isLoaded:</strong> {isLoaded ? 'YES' : 'NO'}</p>
        <p><strong>loadError:</strong> {loadError ? loadError.message : 'None'}</p>
        <p><strong>Map instance:</strong> {map ? 'Created' : 'Not created'}</p>
        <p><strong>Map type:</strong> {mapTypeId || 'Not set yet'}</p>
      </div>

      {loadError && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <strong>Load Error:</strong> {loadError.message}
        </div>
      )}

      <p className="mb-4">If you see a Google Map below with roads/terrain, the API is working.</p>

      <div style={{ width: '100%', height: '500px', border: '2px solid blue', background: '#f0f0f0' }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: 51.5074, lng: -0.1278 }}
            zoom={12}
            mapTypeId="roadmap"
            options={{
              mapTypeId: 'roadmap',
              disableDefaultUI: false,
            }}
            onLoad={onLoad}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Waiting for Google Maps to load...</p>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Check browser console (F12) for additional debug info.
      </p>
    </div>
  )
}
