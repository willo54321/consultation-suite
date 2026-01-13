'use client';

// Re-export types from the inner component
export type { MapDrawing, DrawingCategory } from './InteractiveMapViewInner';
export { calculateDrawingMetrics } from './InteractiveMapViewInner';

// Re-export the dynamically loaded component
export { default } from './GoogleMapsWrapper';
