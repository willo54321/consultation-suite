import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, FileText, MessageSquare, MoreVertical } from 'lucide-react';
import Layout from '@/components/Layout';
import { api, Project } from '@/api/client';

export default function ProjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');

  // Check auth
  useEffect(() => {
    const key = localStorage.getItem('admin_api_key');
    if (!key) {
      router.push('/login');
    }
  }, [router]);

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: api.listProjects,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Project>) => api.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreateModal(false);
      setNewProjectName('');
      setNewProjectClient('');
    },
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: newProjectName,
      client: newProjectClient || null,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load projects. Please check your API key.</p>
          <button
            onClick={() => router.push('/login')}
            className="btn btn-primary mt-4"
          >
            Re-authenticate
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {projects?.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 mb-4">No projects yet. Create your first consultation project.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <div
              key={project.id}
              onClick={() => router.push(`/projects/${project.id}`)}
              className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  {project.client && (
                    <p className="text-gray-500 text-sm">{project.client}</p>
                  )}
                </div>
                <span
                  className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${project.status === 'live'
                      ? 'bg-green-100 text-green-700'
                      : project.status === 'closed'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-yellow-100 text-yellow-700'
                    }
                  `}
                >
                  {project.status}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText size={16} />
                  {project.document_count} docs
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={16} />
                  {project.chunk_count} chunks
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Created {format(new Date(project.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label htmlFor="name" className="label">
                  Project Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="input"
                  placeholder="e.g., Oakwood Development Consultation"
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
                  value={newProjectClient}
                  onChange={(e) => setNewProjectClient(e.target.value)}
                  className="input"
                  placeholder="e.g., ABC Developers Ltd"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn btn-primary"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
