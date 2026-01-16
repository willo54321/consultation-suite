'use client'

import { useEffect, useRef, useState } from 'react'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export default function TestMapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('Loading...')
  const [mapInstance, setMapInstance] = useState<any>(null)

  useEffect(() => {
    // Load Google Maps directly via script tag
    const loadGoogleMaps = () => {
      if (typeof window !== 'undefined' && !(window as any).google?.maps) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=drawing,geometry`
        script.async = true
        script.defer = true
        script.onload = () => {
          setStatus('Script loaded, initializing map...')
          initMap()
        }
        script.onerror = (e) => {
          setStatus(`Script failed to load: ${e}`)
        }
        document.head.appendChild(script)
      } else if ((window as any).google?.maps) {
        setStatus('Google Maps already loaded, initializing...')
        initMap()
      }
    }

    const initMap = () => {
      if (!mapRef.current) {
        setStatus('Map container not found')
        return
      }

      try {
        const google = (window as any).google
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 51.5074, lng: -0.1278 },
          zoom: 12,
          mapTypeId: 'roadmap',
        })

        setMapInstance(map)
        setStatus(`Map created! MapTypeId: ${map.getMapTypeId()}`)

        // Add a marker to confirm map is working
        new google.maps.Marker({
          position: { lat: 51.5074, lng: -0.1278 },
          map: map,
          title: 'London'
        })

        console.log('Map initialized:', map)
        console.log('Map div:', map.getDiv())
        console.log('Map center:', map.getCenter()?.toString())

      } catch (error: any) {
        setStatus(`Error creating map: ${error.message}`)
        console.error('Map error:', error)
      }
    }

    loadGoogleMaps()
  }, [])

  const apiKeyPreview = GOOGLE_MAPS_API_KEY
    ? `${GOOGLE_MAPS_API_KEY.substring(0, 10)}...${GOOGLE_MAPS_API_KEY.substring(GOOGLE_MAPS_API_KEY.length - 4)}`
    : 'NOT SET'

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Map Test - Direct Google Maps API</h1>

      <div className="mb-4 p-4 bg-gray-100 rounded text-sm font-mono">
        <p><strong>API Key:</strong> {apiKeyPreview}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Map instance:</strong> {mapInstance ? 'Created' : 'Not created'}</p>
      </div>

      <p className="mb-4">This uses the Google Maps API directly (no React wrapper). If this works but the other doesn&apos;t, it&apos;s a React wrapper issue.</p>

      {/* Map container - using inline styles to avoid any Tailwind interference */}
      <div
        ref={mapRef}
        id="google-map-direct"
        style={{
          width: '100%',
          height: '500px',
          border: '2px solid blue',
          background: '#e5e5e5'
        }}
      />

      <p className="mt-4 text-sm text-gray-500">
        Check browser console (F12) for additional debug info.
      </p>
    </div>
  )
}
