'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Dynamic import with no SSR to avoid hydration issues
const InteractiveMapViewComponent = dynamic(
  () => import('./InteractiveMapViewInner'),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div>Loading map...</div>
      </div>
    )
  }
);

export default InteractiveMapViewComponent;
