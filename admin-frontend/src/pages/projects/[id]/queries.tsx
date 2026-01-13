import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { api } from '@/api/client';
import {
  Inbox,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  User,
  Mail,
  ChevronRight,
  MoreVertical,
  Tag,
  Flag
} from 'lucide-react';

interface Query {
  id: string;
  submitter_name: string | null;
  submitter_email: string | null;
  subject: string | null;
  content: string;
  status: string;
  priority: string;
  category: { id: string; name: string; color: string } | null;
  assigned_to: { id: string; name: string } | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  new: { label: 'New', color: 'blue', icon: Inbox },
  in_progress: { label: 'In Progress', color: 'yellow', icon: Clock },
  awaiting_approval: { label: 'Awaiting Approval', color: 'purple', icon: AlertCircle },
  approved: { label: 'Approved', color: 'green', icon: CheckCircle },
  sent: { label: 'Sent', color: 'emerald', icon: Send },
  closed: { label: 'Closed', color: 'gray', icon: CheckCircle }
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

export default function QueriesPage() {
  const router = useRouter();
  const { id: projectId } = router.query;
  const [queries, setQueries] = useState<Query[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedQueries, setSelectedQueries] = useState<string[]>([]);

  useEffect(() => {
    if (projectId) {
      loadQueries();
      loadStats();
    }
  }, [projectId, statusFilter, priorityFilter]);

  const loadQueries = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (searchQuery) params.append('search', searchQuery);

      const data = await api.get<{ queries: Query[] }>(`/projects/${projectId}/queries?${params}`);
      setQueries(data.queries);
    } catch (error) {
      console.error('Failed to load queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.get<Stats>(`/projects/${projectId}/queries/stats`);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadQueries();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <Layout projectId={projectId as string}>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Stats Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Overview</h2>

          {stats && (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-500">Total Queries</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">By Status</div>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      statusFilter === key ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <config.icon className="w-4 h-4" />
                      {config.label}
                    </span>
                    <span className="font-medium">{stats.by_status[key] || 0}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">By Priority</div>
                {['urgent', 'high', 'medium', 'low'].map(priority => (
                  <button
                    key={priority}
                    onClick={() => setPriorityFilter(priorityFilter === priority ? '' : priority)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      priorityFilter === priority ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="capitalize">{priority}</span>
                    <span className="font-medium">{stats.by_priority[priority] || 0}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">Query Inbox</h1>
              {selectedQueries.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">{selectedQueries.length} selected</span>
                  <button className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Bulk Actions
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search queries..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Search
              </button>
            </form>
          </div>

          {/* Query List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : queries.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No queries found</h3>
                <p className="text-gray-500">Queries from feedback forms will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {queries.map(query => {
                  const status = STATUS_CONFIG[query.status] || STATUS_CONFIG.new;
                  return (
                    <div
                      key={query.id}
                      onClick={() => router.push(`/projects/${projectId}/queries/${query.id}`)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedQueries.includes(query.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setSelectedQueries([...selectedQueries, query.id]);
                            } else {
                              setSelectedQueries(selectedQueries.filter(id => id !== query.id));
                            }
                          }}
                          className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 truncate">
                              {query.submitter_name || 'Anonymous'}
                            </span>
                            {query.submitter_email && (
                              <span className="text-sm text-gray-500 truncate">
                                &lt;{query.submitter_email}&gt;
                              </span>
                            )}
                          </div>

                          <div className="text-sm font-medium text-gray-900 mb-1 truncate">
                            {query.subject || 'No subject'}
                          </div>

                          <div className="text-sm text-gray-500 line-clamp-2">
                            {query.content}
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-${status.color}-100 text-${status.color}-700`}>
                              <status.icon className="w-3 h-3" />
                              {status.label}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${PRIORITY_COLORS[query.priority]}`}>
                              {query.priority}
                            </span>
                            {query.category && (
                              <span
                                className="px-2 py-0.5 text-xs rounded-full"
                                style={{ backgroundColor: query.category.color + '20', color: query.category.color }}
                              >
                                {query.category.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-sm text-gray-500">{formatDate(query.created_at)}</div>
                          {query.assigned_to && (
                            <div className="text-xs text-gray-400 mt-1">
                              → {query.assigned_to.name}
                            </div>
                          )}
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
