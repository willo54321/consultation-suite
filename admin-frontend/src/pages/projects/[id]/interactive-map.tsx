import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import { api } from '@/api/client';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  MapPin,
  ThumbsUp,
  MessageSquare,
  Image as ImageIcon,
  Layers,
  X,
  Check,
  Send,
  Copy,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
  ChevronDown,
  ChevronUp,
  Code,
  Sliders,
  Pencil,
  Route,
  Pentagon
} from 'lucide-react';
// Types imported separately to avoid SSR issues with Leaflet
interface MapDrawing {
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

interface DrawingCategory {
  id: string;
  label: string;
  color: string;
  type: 'polygon' | 'line' | 'both';
}

// Simple area/length calculation using basic geometry (avoids turf.js SSR issues)
function calculateDrawingMetrics(geometry: GeoJSON.Geometry): { area?: number; length?: number } {
  try {
    if (geometry.type === 'Polygon' && geometry.coordinates) {
      // Simple polygon area using Shoelace formula
      const coords = geometry.coordinates[0] as [number, number][];
      let area = 0;
      for (let i = 0; i < coords.length - 1; i++) {
        area += coords[i][0] * coords[i + 1][1];
        area -= coords[i + 1][0] * coords[i][1];
      }
      area = Math.abs(area / 2);
      // Convert from degrees² to approximate m² (rough estimate at ~51° latitude)
      const metersPerDegree = 111000;
      return { area: Math.round(area * metersPerDegree * metersPerDegree * Math.cos(51 * Math.PI / 180)) };
    } else if (geometry.type === 'LineString' && geometry.coordinates) {
      // Simple line length using Haversine formula
      const coords = geometry.coordinates as [number, number][];
      let length = 0;
      for (let i = 0; i < coords.length - 1; i++) {
        const [lon1, lat1] = coords[i];
        const [lon2, lat2] = coords[i + 1];
        const R = 6371000; // Earth radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        length += R * c;
      }
      return { length: Math.round(length) };
    }
  } catch (e) {
    console.error('Error calculating metrics:', e);
  }
  return {};
}

// Dynamic import of the map component (no SSR)
const InteractiveMapView = dynamic(
  () => import('@/components/InteractiveMapView'),
  { ssr: false, loading: () => <div className="h-[500px] bg-gray-100 animate-pulse rounded-lg" /> }
);

// Types
interface MapPinType {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  category: 'positive' | 'negative' | 'question' | 'info';
  votes: number;
  votedBy: string[];
  responses: PinResponse[];
  createdAt: string;
  createdBy: string;
  status: 'pending' | 'approved' | 'rejected';
  imageUrl?: string;
}

interface PinResponse {
  id: string;
  text: string;
  isAdmin: boolean;
  createdAt: string;
  createdBy: string;
}

interface ImageOverlay {
  id: string;
  name: string;
  imageUrl: string;
  bounds: [[number, number], [number, number]];
  opacity: number;
  visible: boolean;
}

interface MapConfig {
  center: [number, number];
  zoom: number;
  pins: MapPinType[];
  overlays: ImageOverlay[];
  drawings: MapDrawing[];
  enableVoting: boolean;
  enableComments: boolean;
  requireApproval: boolean;
  enableDrawing: boolean;
  categories: {
    positive: { enabled: boolean; label: string; color: string };
    negative: { enabled: boolean; label: string; color: string };
    question: { enabled: boolean; label: string; color: string };
    info: { enabled: boolean; label: string; color: string };
  };
  drawingCategories: DrawingCategory[];
}

const DEFAULT_CONFIG: MapConfig = {
  center: [51.5074, -0.1278],
  zoom: 13,
  pins: [],
  overlays: [],
  drawings: [],
  enableVoting: true,
  enableComments: true,
  requireApproval: false,
  enableDrawing: true,
  categories: {
    positive: { enabled: true, label: 'Positive', color: '#059669' },
    negative: { enabled: true, label: 'Negative', color: '#dc2626' },
    question: { enabled: true, label: 'An idea or question', color: '#d97706' },
    info: { enabled: false, label: 'Information', color: '#6366f1' },
  },
  drawingCategories: [
    { id: 'improvement', label: 'Suggested Improvement', color: '#22c55e', type: 'both' },
    { id: 'concern', label: 'Area of Concern', color: '#ef4444', type: 'polygon' },
    { id: 'route', label: 'Suggested Route', color: '#3b82f6', type: 'line' },
    { id: 'boundary', label: 'Boundary Suggestion', color: '#f59e0b', type: 'polygon' },
  ]
};

// Filled SVG icons matching the widget's Material Design style
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  positive: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
    </svg>
  ),
  negative: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
    </svg>
  ),
  question: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
  )
};

export default function InteractiveMapPage() {
  const router = useRouter();
  const { id: projectId } = router.query;

  const [config, setConfig] = useState<MapConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // UI State
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [newPinCategory, setNewPinCategory] = useState<MapPinType['category']>('info');
  const [previewMode, setPreviewMode] = useState(false);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');

  // Sidebar sections collapsed state
  const [collapsedSections, setCollapsedSections] = useState({
    categories: false,
    overlays: true,
    settings: true,
    embed: true
  });

  // Filter state
  const [categoryFilters, setCategoryFilters] = useState({
    positive: true,
    negative: true,
    question: true,
    info: true
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // New pin form
  const [newPinForm, setNewPinForm] = useState({ title: '', description: '' });
  const [pendingPinLocation, setPendingPinLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Response form
  const [responseText, setResponseText] = useState('');

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Overlay form
  const [showOverlayForm, setShowOverlayForm] = useState(false);
  const [newOverlay, setNewOverlay] = useState({
    name: '',
    imageUrl: '',
    bounds: [[0, 0], [0, 0]] as [[number, number], [number, number]],
    opacity: 0.7
  });

  // Pin detail modal
  const [showPinModal, setShowPinModal] = useState(false);

  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [activeDrawingTool, setActiveDrawingTool] = useState<'polygon' | 'line' | null>(null);
  const [activeDrawingCategory, setActiveDrawingCategory] = useState<string>('improvement');
  const [pendingDrawing, setPendingDrawing] = useState<{ geometry: GeoJSON.Geometry; type: 'polygon' | 'line' } | null>(null);
  const [newDrawingForm, setNewDrawingForm] = useState({ title: '', description: '' });
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null);

  // Selected overlay for editing
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  // Current map bounds (for auto-placing new overlays)
  const [mapBounds, setMapBounds] = useState<{ center: [number, number]; zoom: number; latDelta: number; lngDelta: number } | null>(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (projectId) loadConfig();
  }, [projectId]);

  const loadConfig = async () => {
    try {
      const data = await api.get<{ config: MapConfig }>(`/projects/${projectId}/interactive-map`);
      console.log('Loaded map config from API:', data.config?.center, data.config?.zoom);
      if (data.config) {
        setConfig({ ...DEFAULT_CONFIG, ...data.config });
      }
    } catch (error) {
      console.error('Failed to load map config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (silent = false) => {
    setSaving(true);
    try {
      await api.put(`/projects/${projectId}/interactive-map`, { config });
      if (!silent) {
        alert('Map saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      if (!silent) {
        alert('Failed to save. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (isAddingPin) {
      setPendingPinLocation({ lat, lng });
    }
  }, [isAddingPin]);

  const createPin = () => {
    if (!pendingPinLocation || !newPinForm.title) return;

    const newPin: MapPinType = {
      id: Date.now().toString(),
      lat: pendingPinLocation.lat,
      lng: pendingPinLocation.lng,
      title: newPinForm.title,
      description: newPinForm.description,
      category: newPinCategory,
      votes: 0,
      votedBy: [],
      responses: [],
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
      status: 'approved'
    };

    setConfig(prev => ({
      ...prev,
      pins: [...prev.pins, newPin]
    }));

    setPendingPinLocation(null);
    setNewPinForm({ title: '', description: '' });
    setIsAddingPin(false);
    setSelectedPin(newPin.id);
    setShowPinModal(true);
  };

  const updatePin = (id: string, updates: Partial<MapPinType>) => {
    setConfig(prev => ({
      ...prev,
      pins: prev.pins.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deletePin = (id: string) => {
    setConfig(prev => ({
      ...prev,
      pins: prev.pins.filter(p => p.id !== id)
    }));
    setSelectedPin(null);
    setShowPinModal(false);
  };

  const addResponse = (pinId: string) => {
    if (!responseText.trim()) return;

    const response: PinResponse = {
      id: Date.now().toString(),
      text: responseText,
      isAdmin: true,
      createdAt: new Date().toISOString(),
      createdBy: 'admin'
    };

    setConfig(prev => ({
      ...prev,
      pins: prev.pins.map(p =>
        p.id === pinId
          ? { ...p, responses: [...p.responses, response] }
          : p
      )
    }));
    setResponseText('');
  };

  const deleteResponse = (pinId: string, responseId: string) => {
    setConfig(prev => ({
      ...prev,
      pins: prev.pins.map(p =>
        p.id === pinId
          ? { ...p, responses: p.responses.filter(r => r.id !== responseId) }
          : p
      )
    }));
  };

  const approvePin = async (pinId: string) => {
    // Update local state
    const newConfig = {
      ...config,
      pins: config.pins.map(p => p.id === pinId ? { ...p, status: 'approved' as const } : p)
    };
    setConfig(newConfig);

    // Auto-save to backend
    try {
      await api.put(`/projects/${projectId}/interactive-map`, { config: newConfig });
    } catch (error) {
      console.error('Failed to save pin approval:', error);
    }
  };

  const rejectPin = async (pinId: string) => {
    // Update local state
    const newConfig = {
      ...config,
      pins: config.pins.map(p => p.id === pinId ? { ...p, status: 'rejected' as const } : p)
    };
    setConfig(newConfig);

    // Auto-save to backend
    try {
      await api.put(`/projects/${projectId}/interactive-map`, { config: newConfig });
    } catch (error) {
      console.error('Failed to save pin rejection:', error);
    }
  };

  const addOverlay = () => {
    if (!newOverlay.name || !newOverlay.imageUrl) return;

    // Auto-position in center of current map view
    let bounds: [[number, number], [number, number]];
    if (mapBounds) {
      bounds = [
        [mapBounds.center[0] - mapBounds.latDelta, mapBounds.center[1] - mapBounds.lngDelta],
        [mapBounds.center[0] + mapBounds.latDelta, mapBounds.center[1] + mapBounds.lngDelta]
      ];
    } else {
      // Fallback to config center if map bounds not available
      bounds = [
        [config.center[0] - 0.01, config.center[1] - 0.01],
        [config.center[0] + 0.01, config.center[1] + 0.01]
      ];
    }

    const overlay: ImageOverlay = {
      id: Date.now().toString(),
      name: newOverlay.name,
      imageUrl: newOverlay.imageUrl,
      bounds,
      opacity: newOverlay.opacity,
      visible: true
    };

    setConfig(prev => ({
      ...prev,
      overlays: [...prev.overlays, overlay]
    }));

    // Select the new overlay for editing
    setSelectedOverlayId(overlay.id);
    setCollapsedSections(prev => ({ ...prev, overlays: false }));

    setNewOverlay({ name: '', imageUrl: '', bounds: [[0, 0], [0, 0]], opacity: 0.7 });
    setShowOverlayForm(false);
  };

  // Handle overlay bounds change from drag/resize - auto-saves
  const handleOverlayBoundsChange = async (overlayId: string, bounds: [[number, number], [number, number]]) => {
    // Update local state
    const newConfig = {
      ...config,
      overlays: config.overlays.map(o => o.id === overlayId ? { ...o, bounds } : o)
    };
    setConfig(newConfig);

    // Auto-save silently
    try {
      await api.put(`/projects/${projectId}/interactive-map`, { config: newConfig });
    } catch (error) {
      console.error('Failed to auto-save overlay bounds:', error);
    }
  };

  const updateOverlay = (id: string, updates: Partial<ImageOverlay>) => {
    setConfig(prev => ({
      ...prev,
      overlays: prev.overlays.map(o => o.id === id ? { ...o, ...updates } : o)
    }));
  };

  const deleteOverlay = (id: string) => {
    setConfig(prev => ({
      ...prev,
      overlays: prev.overlays.filter(o => o.id !== id)
    }));
  };

  // Upload image to backend
  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    setUploadError(null);

    try {
      const data = await api.uploadImage(projectId as string, file);
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8001' : '';
      return `${baseUrl}${data.url}`;
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleOverlayImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setNewOverlay(prev => ({ ...prev, imageUrl, name: prev.name || file.name.replace(/\.[^.]+$/, '') }));
    }
  };

  const handlePinImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, pinId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      updatePin(pinId, { imageUrl });
    }
  };

  const copyEmbedCode = () => {
    const widgetBaseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:8001'
      : 'https://api.consultationsuite.com';
    const code = `<div data-consultation-widget="interactive-map" data-project-id="${projectId}"></div>
<script src="${widgetBaseUrl}/widgets/consultation-widgets.js" async></script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Drawing functions
  const handleDrawingCreated = (geometry: GeoJSON.Geometry, type: 'polygon' | 'line') => {
    setPendingDrawing({ geometry, type });
    setShowDrawingModal(true);
    setIsDrawingMode(false);
    setActiveDrawingTool(null);
  };

  const saveDrawing = () => {
    if (!pendingDrawing || !newDrawingForm.title.trim()) return;

    const metrics = calculateDrawingMetrics(pendingDrawing.geometry);

    const drawing: MapDrawing = {
      id: Date.now().toString(),
      type: pendingDrawing.type,
      geometry: pendingDrawing.geometry,
      title: newDrawingForm.title,
      description: newDrawingForm.description,
      category: activeDrawingCategory,
      votes: 0,
      createdAt: new Date().toISOString(),
      status: config.requireApproval ? 'pending' : 'approved',
      ...metrics
    };

    setConfig(prev => ({
      ...prev,
      drawings: [...prev.drawings, drawing]
    }));

    // Reset form
    setPendingDrawing(null);
    setNewDrawingForm({ title: '', description: '' });
    setShowDrawingModal(false);
  };

  const cancelDrawing = () => {
    setPendingDrawing(null);
    setNewDrawingForm({ title: '', description: '' });
    setShowDrawingModal(false);
  };

  const deleteDrawing = (id: string) => {
    setConfig(prev => ({
      ...prev,
      drawings: prev.drawings.filter(d => d.id !== id)
    }));
    setSelectedDrawing(null);
  };

  const updateDrawing = (id: string, updates: Partial<MapDrawing>) => {
    setConfig(prev => ({
      ...prev,
      drawings: prev.drawings.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  };

  const approveDrawing = (id: string) => {
    updateDrawing(id, { status: 'approved' });
  };

  const rejectDrawing = (id: string) => {
    updateDrawing(id, { status: 'rejected' });
  };

  const startDrawing = (tool: 'polygon' | 'line') => {
    setIsDrawingMode(true);
    setActiveDrawingTool(tool);
    setIsAddingPin(false); // Turn off pin adding mode
  };

  const stopDrawing = useCallback(() => {
    setIsDrawingMode(false);
    setActiveDrawingTool(null);
  }, []);

  // Escape key handler to cancel drawing mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDrawingMode) {
          stopDrawing();
        }
        if (isAddingPin) {
          setIsAddingPin(false);
          setPendingPinLocation(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawingMode, isAddingPin, stopDrawing]);

  // Get selected drawing data
  const selectedDrawingData = selectedDrawing
    ? config.drawings.find(d => d.id === selectedDrawing)
    : null;

  // Filtered pins
  const filteredPins = useMemo(() => {
    return config.pins.filter(pin => {
      if (!categoryFilters[pin.category]) return false;
      if (statusFilter !== 'all' && pin.status !== statusFilter) return false;
      return true;
    });
  }, [config.pins, categoryFilters, statusFilter]);

  // Count pending pins for badge
  const pendingCount = useMemo(() => {
    return config.pins.filter(p => p.status === 'pending').length;
  }, [config.pins]);

  // Status info for UI
  const STATUS_INFO = {
    pending: { label: 'Pending', color: 'badge-pending', icon: Clock },
    approved: { label: 'Approved', color: 'badge-approved', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'badge-archived', icon: XCircle }
  };

  const selectedPinData = config.pins.find(p => p.id === selectedPin);

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <Layout projectId={projectId as string}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout projectId={projectId as string}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interactive Map</h1>
            <p className="text-gray-500 text-sm">Create an interactive map for community feedback</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="btn btn-secondary"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            <button
              onClick={() => saveConfig()}
              disabled={saving}
              className="btn btn-primary"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Map'}
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Container */}
          <div className="lg:col-span-3">
            <div className="card overflow-hidden">
              {/* Map Toolbar */}
              {!previewMode && (
                <div className="card-header bg-gray-50">
                  <div className="flex gap-2 flex-wrap">
                    {/* Pin Controls */}
                    <button
                      onClick={() => {
                        setIsAddingPin(!isAddingPin);
                        setPendingPinLocation(null);
                        stopDrawing();
                      }}
                      className={`btn btn-sm ${isAddingPin ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      <MapPin className="w-4 h-4" />
                      Pin
                    </button>
                    {isAddingPin && (
                      <select
                        value={newPinCategory}
                        onChange={(e) => setNewPinCategory(e.target.value as MapPinType['category'])}
                        className="select px-3 py-1.5 text-sm w-auto"
                      >
                        {Object.entries(config.categories).map(([key, cat]) => (
                          cat.enabled && (
                            <option key={key} value={key}>
                              {cat.label}
                            </option>
                          )
                        ))}
                      </select>
                    )}

                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-300 mx-1" />

                    {/* Drawing Controls */}
                    {config.enableDrawing && (
                      <>
                        <button
                          onClick={() => {
                            if (activeDrawingTool === 'polygon') {
                              stopDrawing();
                            } else {
                              startDrawing('polygon');
                            }
                          }}
                          className={`btn btn-sm ${activeDrawingTool === 'polygon' ? 'btn-primary' : 'btn-secondary'}`}
                          title="Draw an area"
                        >
                          <Pentagon className="w-4 h-4" />
                          Area
                        </button>
                        <button
                          onClick={() => {
                            if (activeDrawingTool === 'line') {
                              stopDrawing();
                            } else {
                              startDrawing('line');
                            }
                          }}
                          className={`btn btn-sm ${activeDrawingTool === 'line' ? 'btn-primary' : 'btn-secondary'}`}
                          title="Draw a route"
                        >
                          <Route className="w-4 h-4" />
                          Route
                        </button>
                        {isDrawingMode && (
                          <select
                            value={activeDrawingCategory}
                            onChange={(e) => setActiveDrawingCategory(e.target.value)}
                            className="select px-3 py-1.5 text-sm w-auto"
                          >
                            {config.drawingCategories
                              .filter(cat => cat.type === 'both' || cat.type === activeDrawingTool)
                              .map(cat => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.label}
                                </option>
                              ))}
                          </select>
                        )}
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setMapStyle(mapStyle === 'street' ? 'satellite' : 'street')}
                    className="btn btn-sm btn-ghost"
                  >
                    <Layers className="w-4 h-4" />
                    {mapStyle === 'street' ? 'Satellite' : 'Street'}
                  </button>
                </div>
              )}

              {/* Leaflet Map */}
              {!showPinModal && (
              <div
                className="h-[500px] relative"
                style={{ zIndex: 1 }}
              >
                {isClient && (
                  <InteractiveMapView
                    key={`map-${config.center[0]}-${config.center[1]}-${config.zoom}`}
                    center={config.center}
                    zoom={config.zoom}
                    pins={filteredPins}
                    overlays={config.overlays}
                    categories={config.categories}
                    isAddingPin={isAddingPin}
                    previewMode={previewMode}
                    mapStyle={mapStyle}
                    selectedPin={selectedPin}
                    pendingPinLocation={pendingPinLocation}
                    pendingPinCategory={newPinCategory}
                    enableVoting={config.enableVoting}
                    selectedOverlayId={selectedOverlayId}
                    onMapClick={handleMapClick}
                    onPinClick={(id) => {
                      setSelectedPin(id);
                      setShowPinModal(true);
                    }}
                    onOverlayClick={(id) => {
                      setSelectedOverlayId(id);
                      setCollapsedSections(prev => ({ ...prev, overlays: false }));
                    }}
                    onOverlayBoundsChange={handleOverlayBoundsChange}
                    onMapBoundsReady={setMapBounds}
                    // Drawing props
                    drawings={config.drawings}
                    drawingCategories={config.drawingCategories}
                    isDrawingMode={isDrawingMode}
                    activeDrawingTool={activeDrawingTool}
                    activeDrawingCategory={activeDrawingCategory}
                    onDrawingCreated={handleDrawingCreated}
                    onDrawingClick={(id) => setSelectedDrawing(id)}
                  />
                )}

                {/* Adding Pin Instruction */}
                {isAddingPin && !pendingPinLocation && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg z-[1000] text-sm font-medium">
                    Click on the map to place your pin
                  </div>
                )}

                {/* Drawing Mode Instruction */}
                {isDrawingMode && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg z-[1000] text-sm font-medium flex items-center gap-3">
                    <span>
                      {activeDrawingTool === 'polygon'
                        ? 'Click to draw area corners. Double-click to finish.'
                        : 'Click to draw route points. Double-click to finish.'}
                    </span>
                    <button
                      onClick={stopDrawing}
                      className="px-3 py-1.5 bg-white/20 rounded hover:bg-white/30 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                      <span className="text-xs opacity-75 ml-1">(Esc)</span>
                    </button>
                  </div>
                )}
              </div>
              )}

              {/* Placeholder when modal is open */}
              {showPinModal && <div className="h-[500px] bg-gray-100 rounded-lg" />}

              {/* New Pin Form */}
              {pendingPinLocation && (
                <div className="p-4 border-t border-gray-100 bg-primary-50">
                  <h3 className="font-semibold text-gray-900 mb-3">New Pin Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Pin title"
                      value={newPinForm.title}
                      onChange={(e) => setNewPinForm(prev => ({ ...prev, title: e.target.value }))}
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newPinForm.description}
                      onChange={(e) => setNewPinForm(prev => ({ ...prev, description: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={createPin}
                      disabled={!newPinForm.title}
                      className="btn btn-primary"
                    >
                      <Check className="w-4 h-4" />
                      Create Pin
                    </button>
                    <button
                      onClick={() => {
                        setPendingPinLocation(null);
                        setNewPinForm({ title: '', description: '' });
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pins List & Status Filter */}
            <div className="card mt-4">
              <div className="card-header">
                <h3 className="font-semibold text-gray-800">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Map Pins
                  {pendingCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-idea-100 text-idea-600 text-xs font-semibold rounded-full">
                      {pendingCount} pending
                    </span>
                  )}
                </h3>
                <div className="flex gap-2">
                  {['all', 'pending', 'approved', 'rejected'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status as typeof statusFilter)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        statusFilter === status
                          ? 'bg-primary-600 text-white'
                          : status === 'pending' && config.pins.filter(p => p.status === 'pending').length > 0
                            ? 'bg-idea-100 text-idea-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      <span className="ml-1 opacity-75">
                        ({status === 'all'
                          ? config.pins.length
                          : config.pins.filter(p => p.status === status).length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="card-body">
                {filteredPins.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="font-medium">No pins to display</p>
                    <p className="text-sm">Click "Add Pin" to create your first pin</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filteredPins.map(pin => {
                      const statusInfo = STATUS_INFO[pin.status];
                      const StatusIcon = statusInfo.icon;
                      return (
                        <div
                          key={pin.id}
                          onClick={() => {
                            setSelectedPin(pin.id);
                            setShowPinModal(true);
                          }}
                          className={`field-item cursor-pointer ${
                            pin.status === 'pending' ? 'border-idea-300 bg-idea-50' : ''
                          }`}
                        >
                          <div
                            className="field-item-icon"
                            style={{ backgroundColor: config.categories[pin.category].color }}
                          >
                            {CATEGORY_ICONS[pin.category]}
                          </div>
                          <div className="field-item-info min-w-0">
                            <p className="field-item-label truncate">{pin.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`badge text-[10px] ${statusInfo.color}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {pin.votes}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {pin.responses.length}
                              </span>
                            </div>
                          </div>
                          {pin.status === 'pending' && (
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); approvePin(pin.id); }}
                                className="p-1 bg-positive-500 text-white rounded hover:bg-positive-600"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); rejectPin(pin.id); }}
                                className="p-1 bg-negative-500 text-white rounded hover:bg-negative-600"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Drawings List */}
            {config.enableDrawing && config.drawings.length > 0 && (
              <div className="card mt-4">
                <div className="card-header">
                  <h3 className="font-semibold text-gray-800">
                    <Pencil className="w-4 h-4 inline mr-2" />
                    Drawings
                    {config.drawings.filter(d => d.status === 'pending').length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-idea-100 text-idea-600 text-xs font-semibold rounded-full">
                        {config.drawings.filter(d => d.status === 'pending').length} pending
                      </span>
                    )}
                  </h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {config.drawings.map(drawing => {
                      const category = config.drawingCategories.find(c => c.id === drawing.category);
                      const statusInfo = STATUS_INFO[drawing.status];
                      const StatusIcon = statusInfo.icon;
                      return (
                        <div
                          key={drawing.id}
                          className={`field-item cursor-pointer ${
                            drawing.status === 'pending' ? 'border-idea-300 bg-idea-50' : ''
                          }`}
                        >
                          <div
                            className="field-item-icon"
                            style={{ backgroundColor: category?.color || '#3b82f6' }}
                          >
                            {drawing.type === 'polygon' ? (
                              <Pentagon className="w-4 h-4 text-white" />
                            ) : (
                              <Route className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="field-item-info min-w-0">
                            <p className="field-item-label truncate">{drawing.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`badge text-[10px] ${statusInfo.color}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </span>
                              <span className="text-xs text-gray-400">
                                {drawing.type === 'polygon'
                                  ? `${((drawing.area || 0) / 10000).toFixed(1)} ha`
                                  : `${((drawing.length || 0) / 1000).toFixed(1)} km`}
                              </span>
                            </div>
                          </div>
                          {drawing.status === 'pending' && (
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); approveDrawing(drawing.id); }}
                                className="p-1 bg-positive-500 text-white rounded hover:bg-positive-600"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); rejectDrawing(drawing.id); }}
                                className="p-1 bg-negative-500 text-white rounded hover:bg-negative-600"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteDrawing(drawing.id); }}
                            className="p-1 text-gray-400 hover:text-negative-500"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Sidebar Panel */}
            <div className="sidebar-panel">
              <div className="sidebar-header">
                <h2>Map Controls</h2>
                <p>Filters, overlays & settings</p>
              </div>

              {/* Categories Section */}
              <div className="sidebar-section">
                <button
                  onClick={() => toggleSection('categories')}
                  className="w-full flex items-center justify-between sidebar-section-title"
                >
                  <span>Categories</span>
                  {collapsedSections.categories ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                {!collapsedSections.categories && (
                  <div className="space-y-2 mt-3">
                    {Object.entries(config.categories).map(([key, cat]) => (
                      cat.enabled && (
                        <div
                          key={key}
                          onClick={() => setCategoryFilters(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                          className={`category-toggle ${categoryFilters[key as keyof typeof categoryFilters] ? 'active' : ''}`}
                        >
                          <div
                            className="category-toggle-icon"
                            style={{ backgroundColor: cat.color }}
                          >
                            {CATEGORY_ICONS[key]}
                          </div>
                          <div className="category-toggle-info">
                            <div className="category-toggle-name">{cat.label}</div>
                            <div className="category-toggle-count">
                              {config.pins.filter(p => p.category === key).length} pins
                            </div>
                          </div>
                          <div className="category-toggle-switch"></div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Overlays Section */}
              <div className="sidebar-section">
                <button
                  onClick={() => toggleSection('overlays')}
                  className="w-full flex items-center justify-between sidebar-section-title"
                >
                  <span>
                    <ImageIcon className="w-4 h-4 inline mr-2" />
                    Image Overlays
                  </span>
                  {collapsedSections.overlays ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                {!collapsedSections.overlays && (
                  <div className="space-y-3 mt-3">
                    <button
                      onClick={() => setShowOverlayForm(true)}
                      className="field-type-btn w-full"
                    >
                      <Plus className="w-4 h-4" />
                      Add Image Overlay
                    </button>

                    {showOverlayForm && (
                      <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                        <input
                          type="text"
                          placeholder="Overlay name"
                          value={newOverlay.name}
                          onChange={(e) => setNewOverlay(prev => ({ ...prev, name: e.target.value }))}
                          className="input input-sm"
                        />

                        <div className="space-y-2">
                          <label className={`flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            uploading ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                          }`}>
                            {uploading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                                <span className="text-sm text-primary-600">Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Upload Image</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              onChange={handleOverlayImageUpload}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                          {newOverlay.imageUrl && (
                            <div className="flex items-center gap-2 p-2 bg-positive-50 border border-positive-200 rounded-lg">
                              <Check className="w-4 h-4 text-positive-600" />
                              <span className="text-xs text-positive-700 truncate flex-1">Uploaded</span>
                              <button
                                onClick={() => setNewOverlay(prev => ({ ...prev, imageUrl: '' }))}
                                className="text-gray-400 hover:text-negative-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          {uploadError && (
                            <p className="text-xs text-negative-600">{uploadError}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" placeholder="SW Lat" className="input input-sm" step="0.0001"
                            onChange={(e) => setNewOverlay(prev => ({
                              ...prev,
                              bounds: [[parseFloat(e.target.value) || 0, prev.bounds[0][1]], prev.bounds[1]]
                            }))}
                          />
                          <input type="number" placeholder="SW Lng" className="input input-sm" step="0.0001"
                            onChange={(e) => setNewOverlay(prev => ({
                              ...prev,
                              bounds: [[prev.bounds[0][0], parseFloat(e.target.value) || 0], prev.bounds[1]]
                            }))}
                          />
                          <input type="number" placeholder="NE Lat" className="input input-sm" step="0.0001"
                            onChange={(e) => setNewOverlay(prev => ({
                              ...prev,
                              bounds: [prev.bounds[0], [parseFloat(e.target.value) || 0, prev.bounds[1][1]]]
                            }))}
                          />
                          <input type="number" placeholder="NE Lng" className="input input-sm" step="0.0001"
                            onChange={(e) => setNewOverlay(prev => ({
                              ...prev,
                              bounds: [prev.bounds[0], [prev.bounds[1][0], parseFloat(e.target.value) || 0]]
                            }))}
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-500">Opacity: {newOverlay.opacity}</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={newOverlay.opacity}
                            onChange={(e) => setNewOverlay(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                            className="w-full accent-primary-600"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button onClick={addOverlay} className="btn btn-sm btn-primary flex-1">Add</button>
                          <button onClick={() => setShowOverlayForm(false)} className="btn btn-sm btn-secondary">Cancel</button>
                        </div>
                      </div>
                    )}

                    {config.overlays.map(overlay => (
                      <div
                        key={overlay.id}
                        onClick={() => setSelectedOverlayId(overlay.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedOverlayId === overlay.id
                            ? 'bg-primary-50 border-2 border-primary-600'
                            : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-gray-800">{overlay.name}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); updateOverlay(overlay.id, { visible: !overlay.visible }); }}
                              className={`p-1 rounded ${overlay.visible ? 'text-primary-600' : 'text-gray-400'}`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (selectedOverlayId === overlay.id) setSelectedOverlayId(null);
                                deleteOverlay(overlay.id);
                              }}
                              className="p-1 text-negative-500 hover:text-negative-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {selectedOverlayId === overlay.id && (
                          <p className="text-xs text-primary-600 mt-1">
                            Drag to move, drag corners to resize
                          </p>
                        )}
                        <div className="mt-2">
                          <label className="text-xs text-gray-500">Opacity: {Math.round(overlay.opacity * 100)}%</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={overlay.opacity}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateOverlay(overlay.id, { opacity: parseFloat(e.target.value) })}
                            className="w-full accent-primary-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings Section */}
              <div className="sidebar-section">
                <button
                  onClick={() => toggleSection('settings')}
                  className="w-full flex items-center justify-between sidebar-section-title"
                >
                  <span>
                    <Sliders className="w-4 h-4 inline mr-2" />
                    Map Settings
                  </span>
                  {collapsedSections.settings ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                {!collapsedSections.settings && (
                  <div className="space-y-4 mt-3">
                    <div>
                      <label className="label">Map Center</label>
                      <p className="text-xs text-gray-500 mb-2">
                        {config.center[0].toFixed(4)}, {config.center[1].toFixed(4)}
                      </p>
                      <button
                        onClick={async () => {
                          if (mapBounds) {
                            const newConfig = {
                              ...config,
                              center: mapBounds.center,
                              zoom: mapBounds.zoom
                            };
                            setConfig(newConfig);
                            // Auto-save to database
                            try {
                              await api.put(`/projects/${projectId}/interactive-map`, { config: newConfig });
                            } catch (error) {
                              console.error('Failed to save map center:', error);
                            }
                          }
                        }}
                        disabled={!mapBounds}
                        className="btn btn-sm btn-secondary w-full"
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        Use Current View
                      </button>
                      <p className="text-xs text-gray-400 mt-1">Pan/zoom the map, then click to save</p>
                    </div>

                    <div>
                      <label className="label">Default Zoom: {config.zoom}</label>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        value={config.zoom}
                        onChange={(e) => setConfig(prev => ({ ...prev, zoom: parseInt(e.target.value) || 13 }))}
                        className="w-full accent-primary-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.enableVoting}
                          onChange={(e) => setConfig(prev => ({ ...prev, enableVoting: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Enable voting</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.enableComments}
                          onChange={(e) => setConfig(prev => ({ ...prev, enableComments: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Enable comments</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.requireApproval}
                          onChange={(e) => setConfig(prev => ({ ...prev, requireApproval: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Require approval</span>
                      </label>
                    </div>

                    <div>
                      <label className="label">Category Labels</label>
                      <div className="space-y-2">
                        {Object.entries(config.categories).map(([key, cat]) => (
                          <div key={key} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={cat.enabled}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                categories: {
                                  ...prev.categories,
                                  [key]: { ...cat, enabled: e.target.checked }
                                }
                              }))}
                              className="rounded border-gray-300 text-primary-600"
                            />
                            <input
                              type="color"
                              value={cat.color}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                categories: {
                                  ...prev.categories,
                                  [key]: { ...cat, color: e.target.value }
                                }
                              }))}
                              className="w-6 h-6 rounded cursor-pointer border-0"
                            />
                            <input
                              type="text"
                              value={cat.label}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                categories: {
                                  ...prev.categories,
                                  [key]: { ...cat, label: e.target.value }
                                }
                              }))}
                              className="input input-sm flex-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Embed Code Section */}
              <div className="sidebar-section">
                <button
                  onClick={() => toggleSection('embed')}
                  className="w-full flex items-center justify-between sidebar-section-title"
                >
                  <span>
                    <Code className="w-4 h-4 inline mr-2" />
                    Embed Code
                  </span>
                  {collapsedSections.embed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                {!collapsedSections.embed && (
                  <div className="mt-3">
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
{`<div
  data-consultation-widget="interactive-map"
  data-project-id="${projectId}">
</div>
<script src="..." async></script>`}
                      </pre>
                      <button
                        onClick={copyEmbedCode}
                        className="absolute top-2 right-2 p-1.5 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Add this code to your website to embed the map.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pin Detail Modal - rendered via portal to escape transform stacking context */}
      {isClient && showPinModal && selectedPinData && createPortal(
        <div className="modal-overlay" style={{ zIndex: 99999 }} onClick={() => setShowPinModal(false)}>
          <div className="modal max-w-lg" style={{ zIndex: 100000 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Pin</h2>
              <button onClick={() => setShowPinModal(false)} className="modal-close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              {/* Status Banner */}
              <div className={`p-3 rounded-lg ${
                selectedPinData.status === 'pending'
                  ? 'bg-idea-50 border border-idea-200'
                  : selectedPinData.status === 'rejected'
                    ? 'bg-negative-50 border border-negative-200'
                    : 'bg-positive-50 border border-positive-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`badge ${STATUS_INFO[selectedPinData.status].color}`}>
                    {(() => {
                      const Icon = STATUS_INFO[selectedPinData.status].icon;
                      return <Icon className="w-4 h-4 mr-1" />;
                    })()}
                    {STATUS_INFO[selectedPinData.status].label}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approvePin(selectedPinData.id)}
                      disabled={selectedPinData.status === 'approved'}
                      className={`btn btn-sm ${
                        selectedPinData.status === 'approved'
                          ? 'bg-positive-200 text-positive-800 cursor-default'
                          : 'bg-positive-600 text-white hover:bg-positive-700'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectPin(selectedPinData.id)}
                      disabled={selectedPinData.status === 'rejected'}
                      className={`btn btn-sm ${
                        selectedPinData.status === 'rejected'
                          ? 'bg-negative-200 text-negative-800 cursor-default'
                          : 'bg-negative-600 text-white hover:bg-negative-700'
                      }`}
                    >
                      <XCircle className="w-3 h-3" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Title</label>
                <input
                  type="text"
                  value={selectedPinData.title}
                  onChange={(e) => updatePin(selectedPinData.id, { title: e.target.value })}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  value={selectedPinData.description}
                  onChange={(e) => updatePin(selectedPinData.id, { description: e.target.value })}
                  rows={3}
                  className="textarea"
                />
              </div>

              <div className="form-group">
                <label className="label">Category</label>
                <select
                  value={selectedPinData.category}
                  onChange={(e) => updatePin(selectedPinData.id, { category: e.target.value as MapPinType['category'] })}
                  className="select"
                >
                  {Object.entries(config.categories).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label className="label">Image</label>
                {selectedPinData.imageUrl ? (
                  <div className="space-y-2">
                    <img
                      src={selectedPinData.imageUrl}
                      alt="Pin attachment"
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => updatePin(selectedPinData.id, { imageUrl: undefined })}
                      className="text-xs text-negative-600 hover:text-negative-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove image
                    </button>
                  </div>
                ) : (
                  <label className={`flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    uploading ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                  }`}>
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                        <span className="text-sm text-primary-600">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500">Click to upload image</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={(e) => handlePinImageUpload(e, selectedPinData.id)}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {selectedPinData.votes} votes
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {selectedPinData.responses.length} responses
                </span>
              </div>

              {/* Responses */}
              <div>
                <label className="label">Admin Responses</label>
                <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
                  {selectedPinData.responses.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No responses yet</p>
                  ) : (
                    selectedPinData.responses.map(r => (
                      <div key={r.id} className="text-sm bg-gray-50 p-3 rounded-lg group relative">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            {r.isAdmin && <span className="text-primary-600 font-medium">Admin: </span>}
                            {r.text}
                          </div>
                          <button
                            onClick={() => deleteResponse(selectedPinData.id, r.id)}
                            className="text-gray-400 hover:text-negative-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add admin response..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addResponse(selectedPinData.id)}
                    className="input flex-1"
                  />
                  <button
                    onClick={() => addResponse(selectedPinData.id)}
                    disabled={!responseText.trim()}
                    className="btn btn-primary"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => deletePin(selectedPinData.id)}
                className="btn btn-danger"
              >
                <Trash2 className="w-4 h-4" />
                Delete Pin
              </button>
              <button
                onClick={() => setShowPinModal(false)}
                className="btn btn-secondary"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Selected Drawing Modal - for editing/deleting existing drawings */}
      {isClient && selectedDrawingData && !previewMode && createPortal(
        <div className="modal-overlay" style={{ zIndex: 99999 }} onClick={() => setSelectedDrawing(null)}>
          <div className="modal max-w-md" style={{ zIndex: 100000 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDrawingData.type === 'polygon' ? 'Area' : 'Route'}: {selectedDrawingData.title}</h2>
              <button onClick={() => setSelectedDrawing(null)} className="modal-close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              {/* Drawing Info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {selectedDrawingData.type === 'polygon' ? (
                    <Pentagon className="w-5 h-5 text-primary-600" />
                  ) : (
                    <Route className="w-5 h-5 text-primary-600" />
                  )}
                  <span className="font-medium">
                    {config.drawingCategories.find(c => c.id === selectedDrawingData.category)?.label || selectedDrawingData.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {selectedDrawingData.type === 'polygon'
                    ? `Area: ${((selectedDrawingData.area || 0) / 10000).toFixed(2)} hectares`
                    : `Length: ${((selectedDrawingData.length || 0) / 1000).toFixed(2)} km`}
                </p>
              </div>

              {selectedDrawingData.description && (
                <div>
                  <label className="label">Description</label>
                  <p className="text-sm text-gray-600">{selectedDrawingData.description}</p>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className={`badge ${STATUS_INFO[selectedDrawingData.status].color}`}>
                  {(() => {
                    const Icon = STATUS_INFO[selectedDrawingData.status].icon;
                    return <Icon className="w-3 h-3 mr-1" />;
                  })()}
                  {STATUS_INFO[selectedDrawingData.status].label}
                </span>
                <span className="text-xs text-gray-400">
                  Created {new Date(selectedDrawingData.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  deleteDrawing(selectedDrawingData.id);
                  setSelectedDrawing(null);
                }}
                className="btn btn-danger"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => setSelectedDrawing(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Drawing Form Modal */}
      {isClient && showDrawingModal && pendingDrawing && createPortal(
        <div className="modal-overlay" style={{ zIndex: 99999 }} onClick={cancelDrawing}>
          <div className="modal max-w-md" style={{ zIndex: 100000 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{pendingDrawing.type === 'polygon' ? 'New Area' : 'New Route'}</h2>
              <button onClick={cancelDrawing} className="modal-close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              {/* Drawing Preview Info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {pendingDrawing.type === 'polygon' ? (
                    <Pentagon className="w-5 h-5 text-primary-600" />
                  ) : (
                    <Route className="w-5 h-5 text-primary-600" />
                  )}
                  <span className="font-medium">
                    {pendingDrawing.type === 'polygon' ? 'Area Drawing' : 'Route Drawing'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {(() => {
                    const metrics = calculateDrawingMetrics(pendingDrawing.geometry);
                    if (pendingDrawing.type === 'polygon' && metrics.area) {
                      return `Area: ${(metrics.area / 10000).toFixed(2)} hectares (${metrics.area.toLocaleString()} m²)`;
                    } else if (metrics.length) {
                      return `Length: ${(metrics.length / 1000).toFixed(2)} km (${metrics.length.toLocaleString()} m)`;
                    }
                    return '';
                  })()}
                </p>
              </div>

              <div className="form-group">
                <label className="label">Category</label>
                <select
                  value={activeDrawingCategory}
                  onChange={(e) => setActiveDrawingCategory(e.target.value)}
                  className="select"
                >
                  {config.drawingCategories
                    .filter(cat => cat.type === 'both' || cat.type === pendingDrawing.type)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Title *</label>
                <input
                  type="text"
                  value={newDrawingForm.title}
                  onChange={(e) => setNewDrawingForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={pendingDrawing.type === 'polygon' ? 'e.g., Proposed park area' : 'e.g., Suggested bike route'}
                  className="input"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  value={newDrawingForm.description}
                  onChange={(e) => setNewDrawingForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Why are you suggesting this? What should be considered?"
                  rows={3}
                  className="textarea"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={cancelDrawing} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={saveDrawing}
                disabled={!newDrawingForm.title.trim()}
                className="btn btn-primary"
              >
                <Check className="w-4 h-4" />
                Save {pendingDrawing.type === 'polygon' ? 'Area' : 'Route'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Layout>
  );
}
