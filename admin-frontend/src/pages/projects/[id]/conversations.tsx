import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { MessageSquare, AlertCircle, ChevronRight, User, Bot } from 'lucide-react';
import { useState } from 'react';
import Layout from '@/components/Layout';
import { api, Conversation, ConversationDetail } from '@/api/client';

export default function ConversationsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(id as string),
    enabled: !!id,
  });

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', id],
    queryFn: () => api.listConversations(id as string),
    enabled: !!id,
  });

  const { data: conversationDetail } = useQuery({
    queryKey: ['conversation', selectedConversation],
    queryFn: () => api.getConversation(selectedConversation as string),
    enabled: !!selectedConversation,
  });

  return (
    <Layout projectId={id as string} projectName={project?.name}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Conversations</h1>
      </div>

      <div className="flex gap-6">
        {/* Conversations List */}
        <div className="w-1/3">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : conversations?.length === 0 ? (
            <div className="card p-8 text-center">
              <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No conversations yet</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="divide-y divide-gray-200">
                {conversations?.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`
                      w-full p-4 text-left hover:bg-gray-50 transition-colors
                      ${selectedConversation === conv.id ? 'bg-primary-50' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {conv.has_flagged && (
                          <AlertCircle className="text-yellow-500" size={16} />
                        )}
                        <span className="font-medium text-sm">
                          {conv.message_count} messages
                        </span>
                      </div>
                      <ChevronRight className="text-gray-400" size={16} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(conv.started_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Conversation Detail */}
        <div className="flex-1">
          {selectedConversation && conversationDetail ? (
            <div className="card p-4">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500">
                  Started {format(new Date(conversationDetail.started_at), 'MMMM d, yyyy at h:mm a')}
                </p>
                {conversationDetail.user_agent && (
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {conversationDetail.user_agent}
                  </p>
                )}
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {conversationDetail.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="text-primary-600" size={18} />
                      </div>
                    )}

                    <div
                      className={`
                        max-w-[70%] p-3 rounded-lg
                        ${message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                        }
                      `}
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>

                      {message.role === 'assistant' && (
                        <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                          {message.confidence_score !== null && (
                            <span>
                              Confidence: {Math.round(message.confidence_score * 100)}%
                            </span>
                          )}
                          {message.feedback && (
                            <span
                              className={
                                message.feedback === 'helpful'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {message.feedback === 'helpful' ? '👍 Helpful' : '👎 Not helpful'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User className="text-gray-600" size={18} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">Select a conversation to view details</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
