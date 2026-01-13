import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FileText, MessageSquare, BarChart3, Code, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/api/client';

export default function ProjectOverview() {
  const router = useRouter();
  const { id } = router.query;
  const [copied, setCopied] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(id as string),
    enabled: !!id,
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => api.getAnalytics(id as string),
    enabled: !!id,
  });

  const { data: embedData } = useQuery({
    queryKey: ['embed', id],
    queryFn: () => api.getEmbedCode(id as string),
    enabled: !!id,
  });

  const copyEmbedCode = () => {
    if (embedData?.embed_code) {
      navigator.clipboard.writeText(embedData.embed_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading || !project) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout projectId={project.id} projectName={project.name}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        {project.client && (
          <p className="text-gray-500">{project.client}</p>
        )}
      </div>

      {/* Status Card */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`
                inline-block px-3 py-1 rounded-full text-sm font-medium mt-1
                ${project.status === 'live'
                  ? 'bg-green-100 text-green-700'
                  : project.status === 'closed'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-yellow-100 text-yellow-700'
                }
              `}
            >
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          </div>
          {project.status !== 'live' && (
            <button
              onClick={() => router.push(`/projects/${id}/settings`)}
              className="btn btn-primary text-sm"
            >
              Go Live
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileText className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{project.document_count}</p>
              <p className="text-sm text-gray-500">Documents</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics?.total_conversations || 0}</p>
              <p className="text-sm text-gray-500">Conversations</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics?.user_messages || 0}</p>
              <p className="text-sm text-gray-500">Questions Asked</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{project.chunk_count}</p>
              <p className="text-sm text-gray-500">Knowledge Chunks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Embed Code */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Code size={20} className="text-gray-500" />
            <h3 className="font-semibold">Embed Code</h3>
          </div>
          <button
            onClick={copyEmbedCode}
            className="btn btn-secondary text-sm flex items-center gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          {embedData?.embed_code || 'Loading...'}
        </pre>
        <p className="text-sm text-gray-500 mt-2">
          Add this code to your website to display the chat widget.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => router.push(`/projects/${id}/documents`)}
          className="card p-4 text-left hover:shadow-md transition-shadow"
        >
          <FileText className="text-primary-600 mb-2" size={24} />
          <h3 className="font-semibold">Upload Documents</h3>
          <p className="text-sm text-gray-500">Add PDFs and documents to the knowledge base</p>
        </button>

        <button
          onClick={() => router.push(`/projects/${id}/qa`)}
          className="card p-4 text-left hover:shadow-md transition-shadow"
        >
          <MessageSquare className="text-blue-600 mb-2" size={24} />
          <h3 className="font-semibold">Manage Q&A</h3>
          <p className="text-sm text-gray-500">Add custom question and answer pairs</p>
        </button>

        <button
          onClick={() => router.push(`/projects/${id}/conversations`)}
          className="card p-4 text-left hover:shadow-md transition-shadow"
        >
          <BarChart3 className="text-green-600 mb-2" size={24} />
          <h3 className="font-semibold">View Conversations</h3>
          <p className="text-sm text-gray-500">Review questions asked by users</p>
        </button>
      </div>
    </Layout>
  );
}
