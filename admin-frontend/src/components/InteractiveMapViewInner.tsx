'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, PolygonF, PolylineF, DrawingManagerF } from '@react-google-maps/api';
import * as turf from '@turf/turf';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBCaXQ3yHwCIZ_3O3wYhIKqjUdQD5LEyQo';
const LIBRARIES: ("places" | "drawing" | "geometry")[] = ['places', 'drawing', 'geometry'];

interface MapPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  category: 'positive' | 'negative' | 'question' | 'info';
  votes: number;
  responses: { id: string; text: string; isAdmin: boolean }[];
}

export interface MapDrawing {
  id: string;
  type: 'polygon' | 'line' | 'circle';
  geometry: GeoJSON.Geometry;
  title: string;
  description: string;
  category: string;
  votes: number;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  area?: number;
  length?: number;
}

export interface DrawingCategory {
  id: string;
  label: string;
  color: string;
  type: 'polygon' | 'line' | 'both';
}

interface ImageOverlayConfig {
  id: string;
  name: string;
  imageUrl: string;
  bounds: [[number, number], [number, number]];
  opacity: number;
  visible: boolean;
}

interface CategoryConfig {
  enabled: boolean;
  label: string;
  color: string;
}

interface InteractiveMapViewProps {
  center: [number, number];
  zoom: number;
  pins: MapPin[];
  overlays: ImageOverlayConfig[];
  categories: Record<string, CategoryConfig>;
  isAddingPin: boolean;
  previewMode: boolean;
  mapStyle: 'street' | 'satellite';
  selectedPin: string | null;
  pendingPinLocation: { lat: number; lng: number } | null;
  pendingPinCategory: string;
  enableVoting: boolean;
  selectedOverlayId?: string | null;
  onMapClick: (lat: number, lng: number) => void;
  onPinClick: (pinId: string) => void;
  onOverlayClick?: (overlayId: string) => void;
  onOverlayBoundsChange?: (overlayId: string, bounds: [[number, number], [number, number]]) => void;
  onMapBoundsReady?: (bounds: { center: [number, number]; zoom: number; latDelta: number; lngDelta: number }) => void;
  drawings?: MapDrawing[];
  drawingCategories?: DrawingCategory[];
  isDrawingMode?: boolean;
  activeDrawingTool?: 'polygon' | 'line' | null;
  activeDrawingCategory?: string;
  onDrawingCreated?: (geometry: GeoJSON.Geometry, type: 'polygon' | 'line') => void;
  onDrawingClick?: (drawingId: string) => void;
}

// SVG inner content for each category (drawn inside the pin's white circle)
const PIN_INNER_ICONS: Record<string, (color: string) => string> = {
  positive: (color) => `
    <circle cx="20" cy="18" r="10" fill="white"/>
    <path d="M15 18l3 3 7-7" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  negative: (color) => `
    <circle cx="20" cy="18" r="10" fill="white"/>
    <path d="M15 13l10 10M25 13l-10 10" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  `,
  question: (color) => `
    <circle cx="20" cy="18" r="10" fill="white"/>
    <circle cx="20" cy="13" r="2" fill="${color}"/>
    <path d="M20 17v7" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  `,
  info: (color) => `
    <circle cx="20" cy="18" r="10" fill="white"/>
    <circle cx="20" cy="13" r="2" fill="${color}"/>
    <path d="M20 17v7" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  `
};

export function calculateDrawingMetrics(geometry: GeoJSON.Geometry): { area?: number; length?: number } {
  try {
    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
      const area = turf.area(geometry as any);
      return { area: Math.round(area) };
    } else if (geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
      const length = turf.length(geometry as any, { units: 'meters' });
      return { length: Math.round(length) };
    }
  } catch (e) {
    console.error('Error calculating metrics:', e);
  }
  return {};
}

function geoJsonToGooglePaths(geometry: GeoJSON.Geometry): google.maps.LatLngLiteral[] {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates[0].map(coord => ({ lat: coord[1], lng: coord[0] }));
  } else if (geometry.type === 'LineString') {
    return geometry.coordinates.map(coord => ({ lat: coord[1], lng: coord[0] }));
  }
  return [];
}

function toGoogleBounds(bounds: [[number, number], [number, number]]): google.maps.LatLngBoundsLiteral {
  return {
    south: bounds[0][0],
    west: bounds[0][1],
    north: bounds[1][0],
    east: bounds[1][1]
  };
}

// Resize handle icon for overlay corners
function createResizeHandleIcon(_position: 'nw' | 'ne' | 'sw' | 'se'): google.maps.Icon {
  const svg = `
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" fill="white" stroke="#7c3aed" stroke-width="2" rx="2"/>
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(16, 16),
    anchor: new google.maps.Point(8, 8)
  };
}

// Edge handle icon for overlay edges
function createEdgeHandleIcon(): google.maps.Icon {
  const svg = `
    <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="6" r="5" fill="white" stroke="#7c3aed" stroke-width="2"/>
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(12, 12),
    anchor: new google.maps.Point(6, 6)
  };
}

// Move handle icon for overlay center (drag to move entire overlay)
function createMoveHandleIcon(): google.maps.Icon {
  const svg = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#7c3aed" stroke="white" stroke-width="2"/>
      <path d="M12 6 L12 18 M6 12 L18 12" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 6 L9 9 M12 6 L15 9" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 18 L9 15 M12 18 L15 15" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <path d="M6 12 L9 9 M6 12 L9 15" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <path d="M18 12 L15 9 M18 12 L15 15" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(24, 24),
    anchor: new google.maps.Point(12, 12)
  };
}

// Editable Ground Overlay component with resize handles
function EditableGroundOverlayComponent({
  map,
  overlayId: _overlayId,
  imageUrl,
  bounds,
  opacity,
  isSelected,
  onClick,
  onBoundsChange
}: {
  map: google.maps.Map | null;
  overlayId: string;
  imageUrl: string;
  bounds: google.maps.LatLngBoundsLiteral;
  opacity: number;
  isSelected: boolean;
  onClick?: () => void;
  onBoundsChange?: (bounds: [[number, number], [number, number]]) => void;
}) {
  const overlayRef = useRef<google.maps.GroundOverlay | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const borderRef = useRef<google.maps.Polyline | null>(null);
  const boundsRef = useRef(bounds);
  const isDraggingRef = useRef(false);

  // Keep ref in sync with props
  useEffect(() => {
    if (!isDraggingRef.current) {
      boundsRef.current = bounds;
      updateOverlayAndHandles();
    }
  }, [bounds.south, bounds.west, bounds.north, bounds.east]);

  // Helper to update overlay image position
  const updateOverlayAndHandles = useCallback(() => {
    if (!map) return;

    const { north, south, east, west } = boundsRef.current;

    // Recreate ground overlay with new bounds
    if (overlayRef.current) {
      overlayRef.current.setMap(null);
    }

    const googleBounds = new google.maps.LatLngBounds(
      { lat: south, lng: west },
      { lat: north, lng: east }
    );

    overlayRef.current = new google.maps.GroundOverlay(imageUrl, googleBounds, {
      opacity,
      clickable: true
    });
    overlayRef.current.setMap(map);

    if (onClick) {
      overlayRef.current.addListener('click', onClick);
    }

    // Update border
    if (borderRef.current) {
      borderRef.current.setPath([
        { lat: north, lng: west },
        { lat: north, lng: east },
        { lat: south, lng: east },
        { lat: south, lng: west },
        { lat: north, lng: west }
      ]);
    }

    // Update marker positions (except the one being dragged)
    const positions: Record<string, google.maps.LatLngLiteral> = {
      'nw': { lat: north, lng: west },
      'ne': { lat: north, lng: east },
      'sw': { lat: south, lng: west },
      'se': { lat: south, lng: east },
      'n': { lat: north, lng: (east + west) / 2 },
      's': { lat: south, lng: (east + west) / 2 },
      'w': { lat: (north + south) / 2, lng: west },
      'e': { lat: (north + south) / 2, lng: east }
    };

    markersRef.current.forEach((marker, key) => {
      if (positions[key]) {
        marker.setPosition(positions[key]);
      }
    });
  }, [map, imageUrl, opacity, onClick]);

  // Create initial overlay
  useEffect(() => {
    if (!map) return;

    updateOverlayAndHandles();

    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
      }
    };
  }, [map, imageUrl, opacity, onClick, updateOverlayAndHandles]);

  // Create/remove resize handles when selection changes
  useEffect(() => {
    if (!map) return;

    // Clear existing markers and border
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current.clear();
    if (borderRef.current) {
      borderRef.current.setMap(null);
      borderRef.current = null;
    }

    if (!isSelected || !onBoundsChange) return;

    const { north, south, east, west } = boundsRef.current;

    // Create dashed border
    borderRef.current = new google.maps.Polyline({
      path: [
        { lat: north, lng: west },
        { lat: north, lng: east },
        { lat: south, lng: east },
        { lat: south, lng: west },
        { lat: north, lng: west }
      ],
      strokeColor: '#7c3aed',
      strokeWeight: 2,
      strokeOpacity: 1,
      map: map,
      icons: [{
        icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
        offset: '0',
        repeat: '10px'
      }]
    });

    // Handle definitions
    const handles = [
      { key: 'nw', lat: north, lng: west, type: 'corner' },
      { key: 'ne', lat: north, lng: east, type: 'corner' },
      { key: 'sw', lat: south, lng: west, type: 'corner' },
      { key: 'se', lat: south, lng: east, type: 'corner' },
      { key: 'n', lat: north, lng: (east + west) / 2, type: 'edge' },
      { key: 's', lat: south, lng: (east + west) / 2, type: 'edge' },
      { key: 'w', lat: (north + south) / 2, lng: west, type: 'edge' },
      { key: 'e', lat: (north + south) / 2, lng: east, type: 'edge' },
      { key: 'center', lat: (north + south) / 2, lng: (east + west) / 2, type: 'move' }
    ];

    // Track drag start position for move handle
    let dragStartLat = 0;
    let dragStartLng = 0;
    let dragStartBounds: typeof bounds | null = null;

    handles.forEach(handle => {
      const marker = new google.maps.Marker({
        position: { lat: handle.lat, lng: handle.lng },
        map: map,
        draggable: true,
        icon: handle.type === 'corner'
          ? createResizeHandleIcon(handle.key as 'nw' | 'ne' | 'sw' | 'se')
          : handle.type === 'move'
            ? createMoveHandleIcon()
            : createEdgeHandleIcon(),
        zIndex: handle.type === 'move' ? 1001 : 1000
      });

      marker.addListener('dragstart', (e: google.maps.MapMouseEvent) => {
        isDraggingRef.current = true;
        if (handle.key === 'center' && e.latLng) {
          dragStartLat = e.latLng.lat();
          dragStartLng = e.latLng.lng();
          dragStartBounds = { ...boundsRef.current };
        }
      });

      marker.addListener('drag', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();

        const current = boundsRef.current;
        const updated = { ...current };

        // Update bounds based on which handle is being dragged
        if (handle.key === 'center' && dragStartBounds) {
          // Move entire overlay - calculate delta from drag start
          const deltaLat = newLat - dragStartLat;
          const deltaLng = newLng - dragStartLng;
          updated.north = dragStartBounds.north + deltaLat;
          updated.south = dragStartBounds.south + deltaLat;
          updated.east = dragStartBounds.east + deltaLng;
          updated.west = dragStartBounds.west + deltaLng;
        } else if (handle.key === 'nw') {
          updated.north = newLat;
          updated.west = newLng;
        } else if (handle.key === 'ne') {
          updated.north = newLat;
          updated.east = newLng;
        } else if (handle.key === 'sw') {
          updated.south = newLat;
          updated.west = newLng;
        } else if (handle.key === 'se') {
          updated.south = newLat;
          updated.east = newLng;
        } else if (handle.key === 'n') {
          updated.north = newLat;
        } else if (handle.key === 's') {
          updated.south = newLat;
        } else if (handle.key === 'w') {
          updated.west = newLng;
        } else if (handle.key === 'e') {
          updated.east = newLng;
        }

        boundsRef.current = updated;
        updateOverlayAndHandles();
      });

      marker.addListener('dragend', () => {
        isDraggingRef.current = false;
        const { north, south, east, west } = boundsRef.current;
        onBoundsChange([[south, west], [north, east]]);
      });

      markersRef.current.set(handle.key, marker);
    });

    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current.clear();
      if (borderRef.current) {
        borderRef.current.setMap(null);
        borderRef.current = null;
      }
    };
  }, [map, isSelected, onBoundsChange, updateOverlayAndHandles]);

  return null;
}

function createMarkerIcon(category: string, color: string): google.maps.Icon {
  const innerIcon = PIN_INNER_ICONS[category] || PIN_INNER_ICONS.info;
  const svg = `
    <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="shadow-${category}" x="-20%" y="-10%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/></filter></defs>
      <path d="M20 0C9 0 0 9 0 20c0 15 20 28 20 28s20-13 20-28C40 9 31 0 20 0z" fill="${color}" stroke="white" stroke-width="2" filter="url(#shadow-${category})"/>
      ${innerIcon(color)}
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(40, 48),
    anchor: new google.maps.Point(20, 48)
  };
}

export default function InteractiveMapView({
  center,
  zoom,
  pins,
  overlays,
  categories,
  isAddingPin,
  previewMode,
  mapStyle,
  selectedPin: _selectedPin,
  pendingPinLocation,
  pendingPinCategory,
  enableVoting,
  selectedOverlayId,
  onMapClick,
  onPinClick,
  onOverlayClick,
  onOverlayBoundsChange,
  onMapBoundsReady,
  drawings = [],
  drawingCategories = [],
  isDrawingMode = false,
  activeDrawingTool = null,
  activeDrawingCategory,
  onDrawingCreated,
  onDrawingClick
}: InteractiveMapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPinForInfo, setSelectedPinForInfo] = useState<string | null>(null);
  const [selectedDrawingForInfo, setSelectedDrawingForInfo] = useState<string | null>(null);

  const activeDrawingColor = drawingCategories.find(c => c.id === activeDrawingCategory)?.color || '#3b82f6';

  const mapCenter = useMemo(() => ({ lat: center[0], lng: center[1] }), [center[0], center[1]]);

  // Pan map when center/zoom changes from props (e.g., after loading from database)
  // Track last applied values to avoid fighting with user interactions
  const lastAppliedCenterRef = useRef<{ lat: number; lng: number; zoom: number } | null>(null);
  useEffect(() => {
    if (!map) return;

    const newLat = center[0];
    const newLng = center[1];
    const newZoom = zoom;

    // Only apply if values are meaningfully different from last applied
    const last = lastAppliedCenterRef.current;
    if (last &&
        Math.abs(last.lat - newLat) < 0.0001 &&
        Math.abs(last.lng - newLng) < 0.0001 &&
        last.zoom === newZoom) {
      return;
    }

    // Apply new center and zoom
    map.panTo({ lat: newLat, lng: newLng });
    map.setZoom(newZoom);
    lastAppliedCenterRef.current = { lat: newLat, lng: newLng, zoom: newZoom };
  }, [map, center[0], center[1], zoom]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && isAddingPin) {
      onMapClick(e.latLng.lat(), e.latLng.lng());
    }
    setSelectedPinForInfo(null);
    setSelectedDrawingForInfo(null);
  }, [isAddingPin, onMapClick]);

  // Use refs for onLoad to always have current values
  const centerRef = useRef(center);
  const zoomRef = useRef(zoom);
  centerRef.current = center;
  zoomRef.current = zoom;

  const onLoad = useCallback((map: google.maps.Map) => {
    // Explicitly set center and zoom on load
    map.setCenter({ lat: centerRef.current[0], lng: centerRef.current[1] });
    map.setZoom(zoomRef.current);
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Report bounds to parent
  useEffect(() => {
    if (!map || !onMapBoundsReady) return;

    const updateBounds = () => {
      const center = map.getCenter();
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      if (center && bounds && zoom !== undefined) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        onMapBoundsReady({
          center: [center.lat(), center.lng()],
          zoom: zoom,
          latDelta: (ne.lat() - sw.lat()) / 4,
          lngDelta: (ne.lng() - sw.lng()) / 4
        });
      }
    };

    const idleListener = map.addListener('idle', updateBounds);
    return () => {
      google.maps.event.removeListener(idleListener);
    };
  }, [map, onMapBoundsReady]);

  const handlePolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    if (!onDrawingCreated) return;

    const path = polygon.getPath();
    const coordinates: [number, number][] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push([point.lng(), point.lat()]);
    }
    if (coordinates.length > 0) {
      coordinates.push(coordinates[0]);
    }

    const geometry: GeoJSON.Polygon = {
      type: 'Polygon',
      coordinates: [coordinates]
    };

    polygon.setMap(null);
    onDrawingCreated(geometry, 'polygon');
  }, [onDrawingCreated]);

  const handlePolylineComplete = useCallback((polyline: google.maps.Polyline) => {
    if (!onDrawingCreated) return;

    const path = polyline.getPath();
    const coordinates: [number, number][] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push([point.lng(), point.lat()]);
    }

    const geometry: GeoJSON.LineString = {
      type: 'LineString',
      coordinates: coordinates
    };

    polyline.setMap(null);
    onDrawingCreated(geometry, 'line');
  }, [onDrawingCreated]);

  const mapTypeId = mapStyle === 'satellite' ? 'satellite' : 'roadmap';

  const getDrawingMode = useCallback(() => {
    if (!isDrawingMode || !activeDrawingTool) return null;
    if (activeDrawingTool === 'polygon') return google.maps.drawing.OverlayType.POLYGON;
    if (activeDrawingTool === 'line') return google.maps.drawing.OverlayType.POLYLINE;
    return null;
  }, [isDrawingMode, activeDrawingTool]);

  const drawingOptions = useMemo(() => ({
    drawingControl: false,
    polygonOptions: {
      fillColor: activeDrawingColor,
      fillOpacity: 0.3,
      strokeColor: activeDrawingColor,
      strokeWeight: 3,
      editable: false,
      draggable: false
    },
    polylineOptions: {
      strokeColor: activeDrawingColor,
      strokeWeight: 3,
      editable: false,
      draggable: false
    }
  }), [activeDrawingColor]);

  if (!isLoaded) {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div>Loading map...</div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{
        height: '100%',
        width: '100%',
        cursor: isAddingPin || isDrawingMode ? 'crosshair' : 'grab'
      }}
      center={mapCenter}
      zoom={zoom}
      mapTypeId={mapTypeId}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
      }}
      onClick={handleMapClick}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Image Overlays */}
      {overlays.map(overlay => (
        overlay.visible && (
          <EditableGroundOverlayComponent
            key={overlay.id}
            map={map}
            overlayId={overlay.id}
            imageUrl={overlay.imageUrl}
            bounds={toGoogleBounds(overlay.bounds)}
            opacity={overlay.opacity}
            isSelected={!previewMode && selectedOverlayId === overlay.id}
            onClick={!previewMode ? () => onOverlayClick?.(overlay.id) : undefined}
            onBoundsChange={!previewMode ? (bounds) => onOverlayBoundsChange?.(overlay.id, bounds) : undefined}
          />
        )
      ))}

      {/* Pins */}
      {pins.map(pin => {
        const categoryConfig = categories[pin.category];
        const icon = createMarkerIcon(pin.category, categoryConfig?.color || '#3b82f6');

        return (
          <MarkerF
            key={pin.id}
            position={{ lat: pin.lat, lng: pin.lng }}
            icon={icon}
            onClick={() => {
              if (!previewMode) {
                onPinClick(pin.id);
              } else {
                setSelectedPinForInfo(pin.id);
              }
            }}
          />
        );
      })}

      {/* Pending Pin */}
      {pendingPinLocation && (
        <MarkerF
          position={{ lat: pendingPinLocation.lat, lng: pendingPinLocation.lng }}
          icon={createMarkerIcon(pendingPinCategory, categories[pendingPinCategory]?.color || '#3b82f6')}
        />
      )}

      {/* Info Windows for Pins */}
      {previewMode && selectedPinForInfo && (() => {
        const pin = pins.find(p => p.id === selectedPinForInfo);
        if (!pin) return null;

        return (
          <InfoWindowF
            position={{ lat: pin.lat, lng: pin.lng }}
            onCloseClick={() => setSelectedPinForInfo(null)}
          >
            <div style={{ minWidth: '200px', padding: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: categories[pin.category]?.color || '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    {pin.category === 'positive' && <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>}
                    {pin.category === 'negative' && <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>}
                    {pin.category === 'question' && <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>}
                    {pin.category === 'info' && <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>}
                  </svg>
                </span>
                <h3 style={{ margin: 0, fontWeight: 600 }}>{pin.title}</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>{pin.description}</p>
              {enableVoting && (
                <div style={{ fontSize: '14px', color: '#888' }}>
                  👍 {pin.votes} votes
                </div>
              )}
              {pin.responses.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#888', marginBottom: '8px' }}>Responses</p>
                  {pin.responses.slice(0, 2).map(r => (
                    <div key={r.id} style={{ fontSize: '12px', background: '#f5f5f5', padding: '8px', borderRadius: '4px', marginBottom: '4px' }}>
                      {r.isAdmin && <span style={{ color: '#7c3aed', fontWeight: 500 }}>Admin: </span>}
                      {r.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </InfoWindowF>
        );
      })()}

      {/* Drawing Manager */}
      {isDrawingMode && activeDrawingTool && onDrawingCreated && (
        <DrawingManagerF
          drawingMode={getDrawingMode()}
          options={drawingOptions}
          onPolygonComplete={handlePolygonComplete}
          onPolylineComplete={handlePolylineComplete}
        />
      )}

      {/* Existing Drawings */}
      {drawings.map(drawing => {
        const category = drawingCategories.find(c => c.id === drawing.category);
        const color = category?.color || '#3b82f6';

        if (drawing.type === 'polygon' && drawing.geometry.type === 'Polygon') {
          const paths = geoJsonToGooglePaths(drawing.geometry);
          return (
            <PolygonF
              key={drawing.id}
              paths={paths}
              options={{
                fillColor: color,
                fillOpacity: 0.2,
                strokeColor: color,
                strokeWeight: 3,
                strokeOpacity: 0.8,
                clickable: true
              }}
              onClick={() => {
                if (previewMode) {
                  setSelectedDrawingForInfo(drawing.id);
                } else {
                  onDrawingClick?.(drawing.id);
                }
              }}
            />
          );
        } else if (drawing.type === 'line' && drawing.geometry.type === 'LineString') {
          const path = geoJsonToGooglePaths(drawing.geometry);
          return (
            <PolylineF
              key={drawing.id}
              path={path}
              options={{
                strokeColor: color,
                strokeWeight: 3,
                strokeOpacity: 0.8,
                clickable: true
              }}
              onClick={() => {
                if (previewMode) {
                  setSelectedDrawingForInfo(drawing.id);
                } else {
                  onDrawingClick?.(drawing.id);
                }
              }}
            />
          );
        }
        return null;
      })}

      {/* Drawing Info Window */}
      {previewMode && selectedDrawingForInfo && (() => {
        const drawing = drawings.find(d => d.id === selectedDrawingForInfo);
        if (!drawing) return null;

        const category = drawingCategories.find(c => c.id === drawing.category);
        const color = category?.color || '#3b82f6';

        let position: google.maps.LatLngLiteral = { lat: center[0], lng: center[1] };
        if (drawing.geometry.type === 'Polygon') {
          const coords = drawing.geometry.coordinates[0];
          const avgLat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
          const avgLng = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
          position = { lat: avgLat, lng: avgLng };
        } else if (drawing.geometry.type === 'LineString') {
          const coords = drawing.geometry.coordinates;
          const midIdx = Math.floor(coords.length / 2);
          position = { lat: coords[midIdx][1], lng: coords[midIdx][0] };
        }

        const metrics = drawing.type === 'polygon'
          ? `Area: ${((drawing.area || 0) / 10000).toFixed(2)} hectares`
          : `Length: ${((drawing.length || 0) / 1000).toFixed(2)} km`;

        return (
          <InfoWindowF
            position={position}
            onCloseClick={() => setSelectedDrawingForInfo(null)}
          >
            <div style={{ minWidth: '200px', padding: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: color, borderRadius: '2px' }}></span>
                <strong>{drawing.title}</strong>
              </div>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{drawing.description}</p>
              <p style={{ fontSize: '12px', color: '#888' }}>{metrics}</p>
              <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>👍 {drawing.votes} votes</p>
            </div>
          </InfoWindowF>
        );
      })()}
    </GoogleMap>
  );
}
