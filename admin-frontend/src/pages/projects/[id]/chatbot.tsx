import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { api, Project } from '@/api/client';
import {
  Bot,
  MessageSquare,
  Settings,
  Save,
  Eye,
  Copy,
  Check,
  AlertCircle,
  FileText,
  Zap
} from 'lucide-react';

export default function ChatbotPage() {
  const router = useRouter();
  const { id: projectId } = router.query;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'appearance' | 'embed'>('settings');

  // Settings
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [personaPrompt, setPersonaPrompt] = useState('');
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [blockedTopics, setBlockedTopics] = useState('');

  // Appearance
  const [primaryColor, setPrimaryColor] = useState('#7c3aed');
  const [position, setPosition] = useState('bottom-right');

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const data = await api.getProject(projectId as string);
      setProject(data);
      setWelcomeMessage(data.welcome_message || '');
      setPersonaPrompt(data.persona_prompt || '');
      setFallbackMessage(data.fallback_message || '');
      setBlockedTopics((data.blocked_topics || []).join('\n'));
      setPrimaryColor(data.widget_config?.primaryColor || '#7c3aed');
      setPosition(data.widget_config?.position || 'bottom-right');
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.updateProject(projectId as string, {
        welcome_message: welcomeMessage,
        persona_prompt: personaPrompt,
        fallback_message: fallbackMessage,
        blocked_topics: blockedTopics.split('\n').filter(t => t.trim()),
        widget_config: {
          ...project?.widget_config,
          primaryColor,
          position
        }
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const copyEmbedCode = () => {
    const code = `<script src="https://your-domain.com/widget.js"
  data-project-id="${projectId}"
  data-position="${position}"
  data-primary-color="${primaryColor}">
</script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Layout projectId={projectId as string}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">AI Chatbot</h1>
            <p className="text-gray-600">Configure your consultation chatbot</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{project?.document_count || 0}</p>
                <p className="text-sm text-gray-500">Documents</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{project?.chunk_count || 0}</p>
                <p className="text-sm text-gray-500">Knowledge Chunks</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Active</p>
                <p className="text-sm text-gray-500">Status</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <button
                  onClick={() => router.push(`/projects/${projectId}/documents`)}
                  className="text-purple-600 hover:underline text-sm font-medium"
                >
                  Upload Documents →
                </button>
                <p className="text-sm text-gray-500">Train the AI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            {[
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'appearance', label: 'Appearance', icon: Eye },
              { id: 'embed', label: 'Embed Code', icon: Copy },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={3}
                  placeholder="Hello! I'm here to help answer your questions about this consultation..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">The first message users see when opening the chatbot</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Persona</label>
                <textarea
                  value={personaPrompt}
                  onChange={(e) => setPersonaPrompt(e.target.value)}
                  rows={4}
                  placeholder="You are a helpful consultation assistant for a planning development..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Instructions for how the AI should behave and respond</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fallback Message</label>
                <textarea
                  value={fallbackMessage}
                  onChange={(e) => setFallbackMessage(e.target.value)}
                  rows={2}
                  placeholder="I'm sorry, I don't have information about that. Please contact us directly..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Shown when the AI can't find a relevant answer</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blocked Topics</label>
                <textarea
                  value={blockedTopics}
                  onChange={(e) => setBlockedTopics(e.target.value)}
                  rows={3}
                  placeholder="competitor pricing&#10;internal financials&#10;staff personal details"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">One topic per line. The AI will avoid discussing these.</p>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <div className="grid grid-cols-2 gap-3">
                  {['bottom-right', 'bottom-left'].map(pos => (
                    <button
                      key={pos}
                      onClick={() => setPosition(pos)}
                      className={`p-4 border rounded-lg text-center ${
                        position === pos
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {pos === 'bottom-right' ? 'Bottom Right' : 'Bottom Left'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <div className="relative bg-gray-100 rounded-lg h-64 overflow-hidden">
                  <div
                    className={`absolute bottom-4 ${position === 'bottom-right' ? 'right-4' : 'left-4'}`}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Before embedding</p>
                  <p className="text-sm text-yellow-700">Make sure you've uploaded documents and configured your chatbot settings above.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Embed Code</label>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`<script src="https://your-domain.com/widget.js"
  data-project-id="${projectId}"
  data-position="${position}"
  data-primary-color="${primaryColor}">
</script>`}
                  </pre>
                  <button
                    onClick={copyEmbedCode}
                    className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Add this code just before the closing &lt;/body&gt; tag on your website.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
