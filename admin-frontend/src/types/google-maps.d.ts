// Type augmentation for @react-google-maps/api to fix React 18 compatibility issues
import '@react-google-maps/api';

declare module '@react-google-maps/api' {
  import { ComponentType, ReactNode } from 'react';

  export interface GoogleMapProps {
    mapContainerStyle?: React.CSSProperties;
    mapContainerClassName?: string;
    center?: google.maps.LatLng | google.maps.LatLngLiteral;
    zoom?: number;
    mapTypeId?: string;
    options?: google.maps.MapOptions;
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onLoad?: (map: google.maps.Map) => void;
    onUnmount?: () => void;
    children?: ReactNode;
  }

  export const GoogleMap: ComponentType<GoogleMapProps>;
  export const useJsApiLoader: (options: {
    id: string;
    googleMapsApiKey: string;
    libraries?: string[];
  }) => { isLoaded: boolean; loadError?: Error };

  export const MarkerF: ComponentType<any>;
  export const InfoWindowF: ComponentType<any>;
  export const PolygonF: ComponentType<any>;
  export const PolylineF: ComponentType<any>;
  export const DrawingManagerF: ComponentType<any>;
}
