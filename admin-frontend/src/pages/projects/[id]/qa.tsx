import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import Layout from '@/components/Layout';
import { api, ManualQA } from '@/api/client';

export default function QAPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingQA, setEditingQA] = useState<ManualQA | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    keywords: '',
    priority: 0,
  });

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(id as string),
    enabled: !!id,
  });

  const { data: qas, isLoading } = useQuery({
    queryKey: ['qas', id],
    queryFn: () => api.listQAs(id as string),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<ManualQA>) => api.createQA(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qas', id] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ qaId, data }: { qaId: string; data: Partial<ManualQA> }) =>
      api.updateQA(qaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qas', id] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteQA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qas', id] });
    },
  });

  const openCreateModal = () => {
    setEditingQA(null);
    setFormData({ question: '', answer: '', keywords: '', priority: 0 });
    setShowModal(true);
  };

  const openEditModal = (qa: ManualQA) => {
    setEditingQA(qa);
    setFormData({
      question: qa.question,
      answer: qa.answer,
      keywords: qa.keywords.join(', '),
      priority: qa.priority,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQA(null);
    setFormData({ question: '', answer: '', keywords: '', priority: 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      question: formData.question,
      answer: formData.answer,
      keywords: formData.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      priority: formData.priority,
    };

    if (editingQA) {
      updateMutation.mutate({ qaId: editingQA.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Layout projectId={id as string} projectName={project?.name}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manual Q&A</h1>
          <p className="text-gray-500">
            Add custom question-answer pairs for specific responses
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Q&A
        </button>
      </div>

      {/* Info Card */}
      <div className="card p-4 mb-6 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          Manual Q&A pairs are checked before the AI searches documents. Use them for
          nuanced answers to sensitive questions or to override AI responses.
        </p>
      </div>

      {/* Q&A List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : qas?.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 mb-4">
            No manual Q&A pairs yet. Add custom responses for specific questions.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">
            Add Q&A Pair
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {qas?.map((qa) => (
            <div key={qa.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`
                        px-2 py-0.5 rounded text-xs font-medium
                        ${qa.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                        }
                      `}
                    >
                      {qa.active ? 'Active' : 'Inactive'}
                    </span>
                    {qa.priority > 0 && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                        Priority: {qa.priority}
                      </span>
                    )}
                  </div>

                  <p className="font-medium text-gray-900 mb-2">
                    Q: {qa.question}
                  </p>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    A: {qa.answer}
                  </p>

                  {qa.keywords.length > 0 && (
                    <div className="flex gap-1 mt-3">
                      {qa.keywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(qa)}
                    className="p-2 text-gray-400 hover:text-primary-600"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this Q&A?')) {
                        deleteMutation.mutate(qa.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingQA ? 'Edit Q&A' : 'Add Q&A'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="question" className="label">
                  Question *
                </label>
                <input
                  id="question"
                  type="text"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  className="input"
                  placeholder="What question does this answer?"
                  required
                />
              </div>

              <div>
                <label htmlFor="answer" className="label">
                  Answer *
                </label>
                <textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  className="input min-h-[120px]"
                  placeholder="The response to give for this question"
                  required
                />
              </div>

              <div>
                <label htmlFor="keywords" className="label">
                  Keywords (comma-separated)
                </label>
                <input
                  id="keywords"
                  type="text"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  className="input"
                  placeholder="parking, spaces, vehicles"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Keywords help match user questions to this answer
                </p>
              </div>

              <div>
                <label htmlFor="priority" className="label">
                  Priority
                </label>
                <input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                  }
                  className="input w-32"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher priority Q&As are preferred when multiple match
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn btn-primary"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingQA
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
