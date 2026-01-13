import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Download,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import Layout from '@/components/Layout';
import { api, FlaggedQuestion } from '@/api/client';

export default function AnalyticsPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [showFlagged, setShowFlagged] = useState(false);

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(id as string),
    enabled: !!id,
  });

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => api.getAnalytics(id as string),
    enabled: !!id,
  });

  const { data: flaggedQuestions } = useQuery({
    queryKey: ['flagged', id],
    queryFn: () => api.listFlaggedQuestions(id as string),
    enabled: !!id,
  });

  const resolveMutation = useMutation({
    mutationFn: (flaggedId: string) => api.resolveFlagged(flaggedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics', id] });
    },
  });

  const handleExport = async () => {
    try {
      const blob = await api.exportConversations(id as string);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversations-${id}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout projectId={id as string} projectName={project?.name}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </Layout>
    );
  }

  const unresolvedFlagged = flaggedQuestions?.filter((f) => !f.resolved) || [];

  return (
    <Layout projectId={id as string} projectName={project?.name}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics?.total_conversations || 0}</p>
              <p className="text-sm text-gray-500">Total Conversations</p>
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
              <ThumbsUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {analytics?.helpful_feedback || 0} / {analytics?.not_helpful_feedback || 0}
              </p>
              <p className="text-sm text-gray-500">Helpful / Not Helpful</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics?.flagged_questions || 0}</p>
              <p className="text-sm text-gray-500">Flagged Questions</p>
            </div>
          </div>
        </div>
      </div>

      {/* More Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-500 mb-1">Avg Messages/Conversation</p>
          <p className="text-xl font-bold">
            {analytics?.avg_messages_per_conversation?.toFixed(1) || '0'}
          </p>
        </div>

        <div className="card p-4">
          <p className="text-sm text-gray-500 mb-1">Avg Confidence Score</p>
          <p className="text-xl font-bold">
            {Math.round((analytics?.avg_confidence || 0) * 100)}%
          </p>
        </div>

        <div className="card p-4">
          <p className="text-sm text-gray-500 mb-1">Last 7 Days</p>
          <p className="text-xl font-bold">
            {analytics?.conversations_last_7_days || 0} conversations
          </p>
        </div>
      </div>

      {/* Flagged Questions */}
      {unresolvedFlagged.length > 0 && (
        <div className="card mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <AlertCircle className="text-yellow-500" size={20} />
                Questions Needing Review ({unresolvedFlagged.length})
              </h2>
              <button
                onClick={() => setShowFlagged(!showFlagged)}
                className="text-sm text-primary-600"
              >
                {showFlagged ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {showFlagged && (
            <div className="divide-y divide-gray-200">
              {unresolvedFlagged.map((flagged) => (
                <div key={flagged.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <span
                        className={`
                          inline-block px-2 py-0.5 rounded text-xs font-medium mb-2
                          ${flagged.reason === 'low_confidence'
                            ? 'bg-yellow-100 text-yellow-700'
                            : flagged.reason === 'no_context'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                          }
                        `}
                      >
                        {flagged.reason.replace('_', ' ')}
                      </span>

                      <p className="font-medium mb-2">Q: {flagged.question}</p>
                      <p className="text-gray-600 text-sm">A: {flagged.ai_response}</p>

                      <p className="text-xs text-gray-400 mt-2">
                        {format(new Date(flagged.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>

                    <button
                      onClick={() => resolveMutation.mutate(flagged.id)}
                      disabled={resolveMutation.isPending}
                      className="btn btn-secondary text-sm flex items-center gap-1"
                    >
                      <CheckCircle size={16} />
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="card p-4 bg-gray-50">
        <h3 className="font-medium mb-2">About Analytics</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Conversations are logged when users interact with the chat widget</li>
          <li>• Questions are flagged when the AI has low confidence or lacks context</li>
          <li>• Review flagged questions to identify gaps in your knowledge base</li>
          <li>• Add manual Q&A pairs to improve responses for common questions</li>
        </ul>
      </div>
    </Layout>
  );
}
