import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Save, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { api, Project } from '@/api/client';

export default function SettingsPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    site_address: '',
    status: 'draft',
    contact_email: '',
    welcome_message: '',
    disclaimer: '',
    fallback_message: '',
    persona_prompt: '',
    blocked_topics: '',
    primary_color: '#1a5c3d',
    position: 'bottom-right',
  });

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        client: project.client || '',
        site_address: project.site_address || '',
        status: project.status || 'draft',
        contact_email: project.contact_email || '',
        welcome_message: project.welcome_message || '',
        disclaimer: project.disclaimer || '',
        fallback_message: project.fallback_message || '',
        persona_prompt: project.persona_prompt || '',
        blocked_topics: project.blocked_topics?.join(', ') || '',
        primary_color: project.widget_config?.primary_color || '#1a5c3d',
        position: project.widget_config?.position || 'bottom-right',
      });
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Project>) => api.updateProject(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => api.archiveProject(id as string),
    onSuccess: () => {
      router.push('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateMutation.mutate({
      name: formData.name,
      client: formData.client || null,
      site_address: formData.site_address || null,
      status: formData.status,
      contact_email: formData.contact_email || null,
      welcome_message: formData.welcome_message || null,
      disclaimer: formData.disclaimer || null,
      fallback_message: formData.fallback_message || null,
      persona_prompt: formData.persona_prompt || null,
      blocked_topics: formData.blocked_topics
        ? formData.blocked_topics.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      widget_config: {
        primary_color: formData.primary_color,
        position: formData.position,
      },
    });
  };

  if (isLoading || !project) {
    return (
      <Layout projectId={id as string} projectName={undefined}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout projectId={id as string} projectName={project?.name}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          className="btn btn-primary flex items-center gap-2"
        >
          <Save size={20} />
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {updateMutation.isSuccess && (
        <div className="card p-4 mb-6 bg-green-50 border-green-200 text-green-700">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Project Details</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">
                Project Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="client" className="label">
                Client Name
              </label>
              <input
                id="client"
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="input"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="site_address" className="label">
                Site Address
              </label>
              <input
                id="site_address"
                type="text"
                value={formData.site_address}
                onChange={(e) => setFormData({ ...formData, site_address: e.target.value })}
                className="input"
                placeholder="e.g., Land at Oakwood Lane, Surrey"
              />
            </div>

            <div>
              <label htmlFor="status" className="label">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input"
              >
                <option value="draft">Draft</option>
                <option value="live">Live</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact_email" className="label">
                Contact Email
              </label>
              <input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="input"
                placeholder="consultation@example.com"
              />
            </div>
          </div>
        </div>

        {/* Response Configuration */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Response Configuration</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="welcome_message" className="label">
                Welcome Message
              </label>
              <textarea
                id="welcome_message"
                value={formData.welcome_message}
                onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Hello! I'm here to help answer your questions about this development proposal."
              />
            </div>

            <div>
              <label htmlFor="disclaimer" className="label">
                Disclaimer (shown with every response)
              </label>
              <textarea
                id="disclaimer"
                value={formData.disclaimer}
                onChange={(e) => setFormData({ ...formData, disclaimer: e.target.value })}
                className="input min-h-[80px]"
                placeholder="This response is generated by an AI assistant based on published consultation materials."
              />
            </div>

            <div>
              <label htmlFor="fallback_message" className="label">
                Fallback Message (when AI can't answer)
              </label>
              <textarea
                id="fallback_message"
                value={formData.fallback_message}
                onChange={(e) => setFormData({ ...formData, fallback_message: e.target.value })}
                className="input min-h-[80px]"
                placeholder="I don't have enough information to answer that question. Please contact our team directly."
              />
            </div>

            <div>
              <label htmlFor="persona_prompt" className="label">
                Custom AI Instructions
              </label>
              <textarea
                id="persona_prompt"
                value={formData.persona_prompt}
                onChange={(e) => setFormData({ ...formData, persona_prompt: e.target.value })}
                className="input min-h-[100px]"
                placeholder="Add custom instructions for the AI's tone, style, or specific behaviors..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Additional instructions for the AI persona (e.g., "Be formal and professional" or "Focus on sustainability benefits")
              </p>
            </div>

            <div>
              <label htmlFor="blocked_topics" className="label">
                Blocked Topics (comma-separated)
              </label>
              <input
                id="blocked_topics"
                type="text"
                value={formData.blocked_topics}
                onChange={(e) => setFormData({ ...formData, blocked_topics: e.target.value })}
                className="input"
                placeholder="commercial terms, land values, negotiations"
              />
              <p className="text-xs text-gray-500 mt-1">
                Topics the AI should refuse to discuss
              </p>
            </div>
          </div>
        </div>

        {/* Widget Appearance */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Widget Appearance</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="primary_color" className="label">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="input flex-1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="position" className="label">
                Widget Position
              </label>
              <select
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="input"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card p-6 border-red-200">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>

          <p className="text-gray-600 mb-4">
            Archiving a project will disable the chat widget and mark it as closed.
            This action can be reversed by changing the status back to draft or live.
          </p>

          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to archive this project?')) {
                archiveMutation.mutate();
              }
            }}
            disabled={archiveMutation.isPending}
            className="btn btn-danger flex items-center gap-2"
          >
            <Trash2 size={20} />
            {archiveMutation.isPending ? 'Archiving...' : 'Archive Project'}
          </button>
        </div>
      </form>
    </Layout>
  );
}
