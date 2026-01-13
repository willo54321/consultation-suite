import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { api } from '@/api/client';
import {
  Plus,
  MessageSquare,
  FileText,
  HelpCircle,
  Image,
  Calendar,
  BarChart3,
  Map,
  Layout as LayoutIcon,
  Copy,
  Code,
  Settings,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

const WIDGET_TYPES = [
  { type: 'chatbot', name: 'AI Chatbot', icon: MessageSquare, description: 'RAG-powered consultation assistant' },
  { type: 'faq', name: 'FAQ Accordion', icon: HelpCircle, description: 'Searchable Q&A sections' },
  { type: 'documents', name: 'Document Library', icon: FileText, description: 'Categorised document listings' },
  { type: 'comparison', name: 'Image Comparison', icon: Image, description: 'Before/after slider' },
  { type: 'timeline', name: 'Timeline', icon: Calendar, description: 'Project milestones' },
  { type: 'form', name: 'Feedback Form', icon: LayoutIcon, description: 'Customisable submission forms' },
  { type: 'gallery', name: 'Gallery', icon: Image, description: 'Image/video gallery' },
  { type: 'stats', name: 'Key Statistics', icon: BarChart3, description: 'Animated stat counters' },
  { type: 'sitemap', name: 'Interactive Sitemap', icon: Map, description: 'Clickable site plan' },
];

interface Widget {
  id: string;
  type: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export default function WidgetsPage() {
  const router = useRouter();
  const { id: projectId } = router.query;
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState<Widget | null>(null);
  const [embedCode, setEmbedCode] = useState({ script: '', iframe: '' });

  useEffect(() => {
    if (projectId) {
      loadWidgets();
    }
  }, [projectId]);

  const loadWidgets = async () => {
    try {
      const data = await api.get<Widget[]>(`/projects/${projectId}/widgets`);
      setWidgets(data);
    } catch (error) {
      console.error('Failed to load widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWidget = async (type: string) => {
    const typeInfo = WIDGET_TYPES.find(t => t.type === type);
    try {
      const widget = await api.post<Widget>(`/projects/${projectId}/widgets`, {
        type,
        name: `${typeInfo?.name || type} Widget`,
        config: {}
      });
      setWidgets([...widgets, widget]);
      setShowCreateModal(false);
      router.push(`/projects/${projectId}/widgets/${widget.id}`);
    } catch (error) {
      console.error('Failed to create widget:', error);
    }
  };

  const toggleWidget = async (widget: Widget) => {
    try {
      await api.put(`/widgets/${widget.id}`, { is_active: !widget.is_active });
      setWidgets(widgets.map(w =>
        w.id === widget.id ? { ...w, is_active: !w.is_active } : w
      ));
    } catch (error) {
      console.error('Failed to toggle widget:', error);
    }
  };

  const deleteWidget = async (widget: Widget) => {
    if (!confirm(`Delete "${widget.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/widgets/${widget.id}`);
      setWidgets(widgets.filter(w => w.id !== widget.id));
    } catch (error) {
      console.error('Failed to delete widget:', error);
    }
  };

  const showEmbed = async (widget: Widget) => {
    try {
      const code = await api.get<{ script: string; iframe: string }>(`/widgets/${widget.id}/embed-code`);
      setEmbedCode(code);
      setShowEmbedModal(widget);
    } catch (error) {
      console.error('Failed to get embed code:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getWidgetIcon = (type: string) => {
    const info = WIDGET_TYPES.find(t => t.type === type);
    const Icon = info?.icon || LayoutIcon;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <Layout projectId={projectId as string}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Widgets</h1>
            <p className="text-gray-600">Create and manage embeddable widgets for your consultation</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-5 h-5" />
            Add Widget
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : widgets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <LayoutIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets yet</h3>
            <p className="text-gray-600 mb-4">Create your first embeddable widget</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Widget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgets.map(widget => (
              <div key={widget.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${widget.is_active ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                      {getWidgetIcon(widget.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{widget.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{widget.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${widget.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {widget.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => router.push(`/projects/${projectId}/widgets/${widget.id}`)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" />
                    Configure
                  </button>
                  <button
                    onClick={() => showEmbed(widget)}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleWidget(widget)}
                    className="flex items-center justify-center px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    {widget.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteWidget(widget)}
                    className="flex items-center justify-center px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Widget Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">Add Widget</h2>
                <p className="text-gray-600">Choose a widget type to add to your project</p>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WIDGET_TYPES.map(type => (
                  <button
                    key={type.type}
                    onClick={() => createWidget(type.type)}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 text-left transition-colors"
                  >
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                      <type.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{type.name}</h3>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Embed Code Modal */}
        {showEmbedModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-xl w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">Embed {showEmbedModal.name}</h2>
                <p className="text-gray-600">Copy the code to embed this widget on any website</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-gray-700">Script Tag (Recommended)</label>
                    <button
                      onClick={() => copyToClipboard(embedCode.script)}
                      className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    {embedCode.script}
                  </pre>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-gray-700">iFrame</label>
                    <button
                      onClick={() => copyToClipboard(embedCode.iframe)}
                      className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    {embedCode.iframe}
                  </pre>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowEmbedModal(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
