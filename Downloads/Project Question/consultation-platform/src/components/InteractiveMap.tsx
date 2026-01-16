'use client';

import { useEffect, useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, PolygonF, PolylineF, DrawingManagerF, RectangleF } from '@react-google-maps/api';
import * as turf from '@turf/turf';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const LIBRARIES: ("drawing" | "geometry")[] = ['drawing', 'geometry'];

export interface MapMarker {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  color: string;
  notes: string | null;
  type?: string;
}

export interface MapDrawing {
  id: string;
  type: 'polygon' | 'line';
  geometry: GeoJSON.Geometry;
  label: string;
  color: string;
  notes?: string;
  area?: number;
  length?: number;
}

export interface ImageOverlay {
  id: string;
  name: string;
  imageUrl: string;
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  opacity: number;
  visible: boolean;
}

export interface GeoLayer {
  id: string;
  name: string;
  type: string;
  geojson: GeoJSON.FeatureCollection;
  style: {
    fillColor: string;
    strokeColor: string;
    fillOpacity: number;
    strokeWidth: number;
  };
  visible: boolean;
}

export interface InteractiveMapRef {
  fitToOverlay: (bounds: [[number, number], [number, number]]) => void;
}

interface InteractiveMapProps {
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
  drawings?: MapDrawing[];
  overlays?: ImageOverlay[];
  geoLayers?: GeoLayer[];
  selectedOverlayId?: string | null;
  isAddingMarker?: boolean;
  isDrawingMode?: boolean;
  activeDrawingTool?: 'polygon' | 'line' | null;
  activeDrawingColor?: string;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (markerId: string) => void;
  onDrawingCreated?: (geometry: GeoJSON.Geometry, type: 'polygon' | 'line') => void;
  onDrawingClick?: (drawingId: string) => void;
  onBoundsChange?: (center: [number, number], zoom: number) => void;
  onOverlayClick?: (overlayId: string) => void;
  onOverlayBoundsChange?: (overlayId: string, bounds: [[number, number], [number, number]]) => void;
}

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

function createMarkerIcon(color: string): google.maps.Icon {
  const svg = `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="14" r="6" fill="white"/>
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(32, 40),
    anchor: new google.maps.Point(16, 40)
  };
}

function createResizeHandleIcon(position: 'nw' | 'ne' | 'se' | 'sw'): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 10,
    fillColor: '#7c3aed',
    fillOpacity: 1,
    strokeColor: '#FFFFFF',
    strokeWeight: 3,
  };
}

const InteractiveMap = forwardRef<InteractiveMapRef, InteractiveMapProps>(({
  center,
  zoom,
  markers,
  drawings = [],
  overlays = [],
  geoLayers = [],
  selectedOverlayId = null,
  isAddingMarker = false,
  isDrawingMode = false,
  activeDrawingTool = null,
  activeDrawingColor = '#3B82F6',
  onMapClick,
  onMarkerClick,
  onDrawingCreated,
  onDrawingClick,
  onBoundsChange,
  onOverlayClick,
  onOverlayBoundsChange
}, ref) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-admin',  // Unique ID for admin map
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  // Log any load errors
  useEffect(() => {
    if (loadError) {
      console.error('[InteractiveMap] Load error:', loadError);
    }
  }, [loadError]);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ lat: number; lng: number } | null>(null);
  const [dragStartBounds, setDragStartBounds] = useState<[[number, number], [number, number]] | null>(null);
  const overlayRefs = useRef<Map<string, google.maps.GroundOverlay>>(new Map());

  const mapCenter = useMemo(() => ({ lat: center[0], lng: center[1] }), [center[0], center[1]]);

  // Expose fitToOverlay method to parent
  useImperativeHandle(ref, () => ({
    fitToOverlay: (bounds: [[number, number], [number, number]]) => {
      if (map) {
        const googleBounds = new google.maps.LatLngBounds(
          { lat: bounds[0][0], lng: bounds[0][1] },
          { lat: bounds[1][0], lng: bounds[1][1] }
        );
        map.fitBounds(googleBounds, 50);
      }
    }
  }), [map]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && isAddingMarker && onMapClick) {
      onMapClick(e.latLng.lat(), e.latLng.lng());
    }
    setSelectedMarker(null);
    setSelectedDrawing(null);
  }, [isAddingMarker, onMapClick]);

  const onLoad = useCallback((map: google.maps.Map) => {
    console.log('[InteractiveMap] onLoad called, map instance:', !!map);
    console.log('[InteractiveMap] Setting center to:', { lat: center[0], lng: center[1] });
    console.log('[InteractiveMap] Setting zoom to:', zoom);
    map.setCenter({ lat: center[0], lng: center[1] });
    map.setZoom(zoom);
    setMap(map);

    // Debug: Check map container dimensions
    const container = map.getDiv();
    console.log('[InteractiveMap] Container dimensions:', container?.offsetWidth, 'x', container?.offsetHeight);

    // Force tiles to load - critical for maps in tabbed interfaces
    // The map may initialize while hidden, requiring resize trigger
    setTimeout(() => {
      google.maps.event.trigger(map, 'resize');
      map.setCenter({ lat: center[0], lng: center[1] });
      map.setZoom(zoom);
      console.log('[InteractiveMap] Resize triggered');
    }, 100);
  }, [center, zoom]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Report bounds changes
  useEffect(() => {
    if (!map || !onBoundsChange) return;

    const listener = map.addListener('idle', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      if (center && zoom !== undefined) {
        onBoundsChange([center.lat(), center.lng()], zoom);
      }
    });

    return () => google.maps.event.removeListener(listener);
  }, [map, onBoundsChange]);

  // Manage ground overlays manually to avoid cleanup issues
  useEffect(() => {
    if (!map) return;

    // Clear existing overlays
    overlayRefs.current.forEach((overlay) => {
      overlay.setMap(null);
    });
    overlayRefs.current.clear();

    // Create new overlays
    overlays.filter(o => o.visible).forEach(overlay => {
      const bounds = new google.maps.LatLngBounds(
        { lat: overlay.bounds[0][0], lng: overlay.bounds[0][1] },
        { lat: overlay.bounds[1][0], lng: overlay.bounds[1][1] }
      );

      const groundOverlay = new google.maps.GroundOverlay(
        overlay.imageUrl,
        bounds,
        { opacity: overlay.opacity, clickable: true }
      );

      groundOverlay.setMap(map);
      groundOverlay.addListener('click', () => {
        onOverlayClick?.(overlay.id);
      });

      overlayRefs.current.set(overlay.id, groundOverlay);
    });

    return () => {
      overlayRefs.current.forEach((overlay) => {
        overlay.setMap(null);
      });
      overlayRefs.current.clear();
    };
  }, [map, overlays, onOverlayClick]);

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

  // Get selected overlay for rendering border
  const selectedOverlay = overlays.find(o => o.id === selectedOverlayId);

  // Handle corner drag for resizing
  const handleCornerDrag = useCallback((cornerId: string, overlay: ImageOverlay, e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !onOverlayBoundsChange) return;

    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    let newBounds: [[number, number], [number, number]];

    switch (cornerId) {
      case 'sw':
        newBounds = [[newLat, newLng], [overlay.bounds[1][0], overlay.bounds[1][1]]];
        break;
      case 'nw':
        newBounds = [[overlay.bounds[0][0], newLng], [newLat, overlay.bounds[1][1]]];
        break;
      case 'ne':
        newBounds = [[overlay.bounds[0][0], overlay.bounds[0][1]], [newLat, newLng]];
        break;
      case 'se':
        newBounds = [[newLat, overlay.bounds[0][1]], [overlay.bounds[1][0], newLng]];
        break;
      default:
        return;
    }

    onOverlayBoundsChange(overlay.id, newBounds);
  }, [onOverlayBoundsChange]);

  // Handle rectangle drag for moving entire overlay
  const handleOverlayDragStart = useCallback((overlay: ImageOverlay, e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    setIsDraggingOverlay(true);
    setDragStartPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    setDragStartBounds(overlay.bounds);
  }, []);

  const handleOverlayDrag = useCallback((overlay: ImageOverlay, e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !dragStartPos || !dragStartBounds || !onOverlayBoundsChange) return;

    const deltaLat = e.latLng.lat() - dragStartPos.lat;
    const deltaLng = e.latLng.lng() - dragStartPos.lng;

    const newBounds: [[number, number], [number, number]] = [
      [dragStartBounds[0][0] + deltaLat, dragStartBounds[0][1] + deltaLng],
      [dragStartBounds[1][0] + deltaLat, dragStartBounds[1][1] + deltaLng]
    ];

    onOverlayBoundsChange(overlay.id, newBounds);
  }, [dragStartPos, dragStartBounds, onOverlayBoundsChange]);

  const handleOverlayDragEnd = useCallback(() => {
    setIsDraggingOverlay(false);
    setDragStartPos(null);
    setDragStartBounds(null);
  }, []);

  // Debug logging for production issues
  useEffect(() => {
    console.log('[InteractiveMap] API Key present:', !!GOOGLE_MAPS_API_KEY);
    console.log('[InteractiveMap] API Key length:', GOOGLE_MAPS_API_KEY?.length);
    console.log('[InteractiveMap] isLoaded:', isLoaded);
    console.log('[InteractiveMap] center:', center, 'mapCenter:', mapCenter);
    console.log('[InteractiveMap] zoom:', zoom);
  }, [isLoaded, center, mapCenter, zoom]);

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-gray-500">
          {GOOGLE_MAPS_API_KEY ? 'Loading map...' : 'Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable map'}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Debug: Key={GOOGLE_MAPS_API_KEY ? 'present' : 'missing'}, Loaded={String(isLoaded)}
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{
        height: '100%',
        minHeight: '400px',
        width: '100%',
        cursor: isAddingMarker || isDrawingMode ? 'crosshair' : isDraggingOverlay ? 'grabbing' : 'grab'
      }}
      center={mapCenter}
      zoom={zoom}
      options={{
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
      }}
      onClick={handleMapClick}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Markers */}
      {markers.map(marker => (
        <MarkerF
          key={marker.id}
          position={{ lat: marker.latitude, lng: marker.longitude }}
          icon={createMarkerIcon(marker.color)}
          onClick={() => {
            if (onMarkerClick) {
              onMarkerClick(marker.id);
            } else {
              setSelectedMarker(marker.id);
            }
          }}
        />
      ))}

      {/* Marker Info Window */}
      {selectedMarker && (() => {
        const marker = markers.find(m => m.id === selectedMarker);
        if (!marker) return null;

        return (
          <InfoWindowF
            position={{ lat: marker.latitude, lng: marker.longitude }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="min-w-[180px] p-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: marker.color }} />
                <strong>{marker.label}</strong>
              </div>
              {marker.notes && <p className="text-sm text-gray-600">{marker.notes}</p>}
              <p className="text-xs text-gray-400 mt-2">
                {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
              </p>
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
        if (drawing.type === 'polygon' && drawing.geometry.type === 'Polygon') {
          const paths = geoJsonToGooglePaths(drawing.geometry);
          return (
            <PolygonF
              key={drawing.id}
              paths={paths}
              options={{
                fillColor: drawing.color,
                fillOpacity: 0.2,
                strokeColor: drawing.color,
                strokeWeight: 3,
                strokeOpacity: 0.8,
                clickable: true
              }}
              onClick={() => {
                if (onDrawingClick) {
                  onDrawingClick(drawing.id);
                } else {
                  setSelectedDrawing(drawing.id);
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
                strokeColor: drawing.color,
                strokeWeight: 3,
                strokeOpacity: 0.8,
                clickable: true
              }}
              onClick={() => {
                if (onDrawingClick) {
                  onDrawingClick(drawing.id);
                } else {
                  setSelectedDrawing(drawing.id);
                }
              }}
            />
          );
        }
        return null;
      })}

      {/* Geo Layers */}
      {geoLayers.filter(layer => layer.visible).map(layer => {
        const features = layer.geojson?.features || [];
        return features.map((feature, featureIndex) => {
          const geometry = feature.geometry;
          if (!geometry) return null;

          // Handle different geometry types
          if (geometry.type === 'Polygon') {
            const paths = geometry.coordinates[0].map((coord: number[]) => ({
              lat: coord[1],
              lng: coord[0]
            }));
            return (
              <PolygonF
                key={`${layer.id}-${featureIndex}`}
                paths={paths}
                options={{
                  fillColor: layer.style?.fillColor || '#3B82F6',
                  fillOpacity: layer.style?.fillOpacity || 0.3,
                  strokeColor: layer.style?.strokeColor || '#1E40AF',
                  strokeWeight: layer.style?.strokeWidth || 2,
                  strokeOpacity: 0.8,
                  clickable: false
                }}
              />
            );
          } else if (geometry.type === 'MultiPolygon') {
            return geometry.coordinates.map((polygonCoords: number[][][], polyIndex: number) => {
              const paths = polygonCoords[0].map((coord: number[]) => ({
                lat: coord[1],
                lng: coord[0]
              }));
              return (
                <PolygonF
                  key={`${layer.id}-${featureIndex}-${polyIndex}`}
                  paths={paths}
                  options={{
                    fillColor: layer.style?.fillColor || '#3B82F6',
                    fillOpacity: layer.style?.fillOpacity || 0.3,
                    strokeColor: layer.style?.strokeColor || '#1E40AF',
                    strokeWeight: layer.style?.strokeWidth || 2,
                    strokeOpacity: 0.8,
                    clickable: false
                  }}
                />
              );
            });
          } else if (geometry.type === 'LineString') {
            const path = geometry.coordinates.map((coord: number[]) => ({
              lat: coord[1],
              lng: coord[0]
            }));
            return (
              <PolylineF
                key={`${layer.id}-${featureIndex}`}
                path={path}
                options={{
                  strokeColor: layer.style?.strokeColor || '#1E40AF',
                  strokeWeight: layer.style?.strokeWidth || 2,
                  strokeOpacity: 0.8,
                  clickable: false
                }}
              />
            );
          } else if (geometry.type === 'MultiLineString') {
            return geometry.coordinates.map((lineCoords: number[][], lineIndex: number) => {
              const path = lineCoords.map((coord: number[]) => ({
                lat: coord[1],
                lng: coord[0]
              }));
              return (
                <PolylineF
                  key={`${layer.id}-${featureIndex}-${lineIndex}`}
                  path={path}
                  options={{
                    strokeColor: layer.style?.strokeColor || '#1E40AF',
                    strokeWeight: layer.style?.strokeWidth || 2,
                    strokeOpacity: 0.8,
                    clickable: false
                  }}
                />
              );
            });
          } else if (geometry.type === 'Point') {
            const position = { lat: geometry.coordinates[1], lng: geometry.coordinates[0] };
            return (
              <MarkerF
                key={`${layer.id}-${featureIndex}`}
                position={position}
                icon={createMarkerIcon(layer.style?.fillColor || '#3B82F6')}
              />
            );
          }
          return null;
        });
      })}

      {/* Drawing Info Window */}
      {selectedDrawing && (() => {
        const drawing = drawings.find(d => d.id === selectedDrawing);
        if (!drawing) return null;

        let position: google.maps.LatLngLiteral = mapCenter;
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
            onCloseClick={() => setSelectedDrawing(null)}
          >
            <div className="min-w-[180px] p-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: drawing.color }} />
                <strong>{drawing.label}</strong>
              </div>
              {drawing.notes && <p className="text-sm text-gray-600">{drawing.notes}</p>}
              <p className="text-xs text-gray-400 mt-2">{metrics}</p>
            </div>
          </InfoWindowF>
        );
      })()}

      {/* Selected Overlay Border Rectangle */}
      {selectedOverlay && (
        <RectangleF
          bounds={{
            south: selectedOverlay.bounds[0][0],
            west: selectedOverlay.bounds[0][1],
            north: selectedOverlay.bounds[1][0],
            east: selectedOverlay.bounds[1][1]
          }}
          options={{
            fillColor: '#7c3aed',
            fillOpacity: 0,
            strokeColor: '#7c3aed',
            strokeWeight: 3,
            strokeOpacity: 1,
            clickable: true,
            draggable: true,
            zIndex: 1000
          }}
          onDragStart={(e) => handleOverlayDragStart(selectedOverlay, e)}
          onDrag={(e) => handleOverlayDrag(selectedOverlay, e)}
          onDragEnd={handleOverlayDragEnd}
        />
      )}

      {/* Overlay Resize Handles */}
      {selectedOverlay && (() => {
        const corners = [
          { id: 'sw', lat: selectedOverlay.bounds[0][0], lng: selectedOverlay.bounds[0][1] },
          { id: 'nw', lat: selectedOverlay.bounds[1][0], lng: selectedOverlay.bounds[0][1] },
          { id: 'ne', lat: selectedOverlay.bounds[1][0], lng: selectedOverlay.bounds[1][1] },
          { id: 'se', lat: selectedOverlay.bounds[0][0], lng: selectedOverlay.bounds[1][1] },
        ];

        return corners.map(corner => (
          <MarkerF
            key={`${selectedOverlay.id}-${corner.id}`}
            position={{ lat: corner.lat, lng: corner.lng }}
            draggable={true}
            icon={createResizeHandleIcon(corner.id as any)}
            onDragEnd={(e) => handleCornerDrag(corner.id, selectedOverlay, e)}
            zIndex={1001}
          />
        ));
      })()}
    </GoogleMap>
  );
});

InteractiveMap.displayName = 'InteractiveMap';

export default InteractiveMap;
