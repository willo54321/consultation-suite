'use client';

import dynamic from 'next/dynamic';
import { forwardRef, useEffect, useState, useRef } from 'react';
import type { InteractiveMapRef } from './InteractiveMap';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DynamicMap = dynamic<any>(
  () => import('./InteractiveMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
);

// Re-export the dynamic component with forwardRef support
// Includes visibility detection to ensure proper map initialization
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InteractiveMap = forwardRef<InteractiveMapRef, any>((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [key, setKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use IntersectionObserver to detect when the map becomes visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            setKey(prev => prev + 1);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  // Simple wrapper - no extra positioning, just render the map
  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%' }}>
      {isVisible ? (
        <DynamicMap key={key} {...props} ref={ref} />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}
    </div>
  );
});

InteractiveMap.displayName = 'InteractiveMapWrapper';

export default InteractiveMap;
export { calculateDrawingMetrics } from './InteractiveMap';
export type { MapMarker, MapDrawing, ImageOverlay, GeoLayer, InteractiveMapRef } from './InteractiveMap';
