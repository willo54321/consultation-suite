'use client'

import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'
import { useCallback, useState } from 'react'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export default function TestMapPage() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-embed',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['drawing', 'geometry'] as any
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)

  const onLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded!')
    setMap(map)
  }, [])

  if (loadError) {
    return <div className="p-8 text-red-600">Error loading map: {loadError.message}</div>
  }

  if (!isLoaded) {
    return <div className="p-8">Loading map...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Map Test Page</h1>
      <p className="mb-4">If you see a Google Map below with roads/terrain, the API is working.</p>

      <div style={{ width: '100%', height: '500px', border: '2px solid blue' }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={{ lat: 51.5074, lng: -0.1278 }}
          zoom={12}
          mapTypeId="roadmap"
          onLoad={onLoad}
        />
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Map state: {map ? 'Loaded' : 'Not loaded'}
      </p>
    </div>
  )
}
