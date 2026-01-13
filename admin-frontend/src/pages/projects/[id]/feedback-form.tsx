import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { api } from '@/api/client';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Copy,
  Check,
  GripVertical,
  Type,
  AlignLeft,
  List,
  CheckSquare,
  Mail,
  Star,
  EyeOff,
  X,
  ArrowLeft,
  Sparkles,
  Settings,
  FileText
} from 'lucide-react';

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'email' | 'radio' | 'rating' | 'hidden';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  sentimentField?: boolean;
  width?: 'full' | 'half';
  value?: string;
}

interface FormConfig {
  title: string;
  description: string;
  slug: string;
  status: 'active' | 'draft' | 'archived';
  submitButtonText: string;
  successMessage: string;
  fields: FormField[];
  notifyEmail: string;
  wizardMode: boolean;
}

const FIELD_TYPES = [
  { type: 'text', label: 'Text Field', icon: Type },
  { type: 'textarea', label: 'Text Area', icon: AlignLeft, canAnalyze: true },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'select', label: 'Dropdown', icon: List, hasOptions: true },
  { type: 'radio', label: 'Radio Buttons', icon: CheckSquare, hasOptions: true },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare, hasOptions: true },
  { type: 'rating', label: 'Star Rating', icon: Star },
  { type: 'hidden', label: 'Hidden Field', icon: EyeOff },
];

const DEFAULT_CONFIG: FormConfig = {
  title: 'Community Feedback Survey',
  description: 'Help us improve by sharing your thoughts and experiences.',
  slug: 'community-feedback',
  status: 'draft',
  submitButtonText: 'Submit Feedback',
  successMessage: 'Thank you for your feedback! We will review it carefully.',
  notifyEmail: '',
  wizardMode: false,
  fields: [
    { id: '1', type: 'text', label: 'Your Name', placeholder: 'Enter your name', required: true },
    { id: '2', type: 'email', label: 'Email Address', placeholder: 'your@email.com', required: true },
    { id: '3', type: 'textarea', label: 'Your Feedback', placeholder: 'Share your thoughts, questions, or concerns...', required: true, sentimentField: true },
  ]
};

export default function FeedbackFormPage() {
  const router = useRouter();
  const { id: projectId } = router.query;

  const [config, setConfig] = useState<FormConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'fields' | 'settings'>('fields');

  useEffect(() => {
    if (projectId) loadConfig();
  }, [projectId]);

  const loadConfig = async () => {
    try {
      const data = await api.get<{ config: FormConfig }>(`/projects/${projectId}/feedback-form`);
      if (data.config) setConfig(data.config);
    } catch (error) {
      console.error('Failed to load form config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await api.put(`/projects/${projectId}/feedback-form`, { config });
      alert('Form saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addField = (type: FormField['type']) => {
    const fieldType = FIELD_TYPES.find(f => f.type === type);
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: `New ${fieldType?.label || type}`,
      required: false,
      width: 'full',
      options: fieldType?.hasOptions ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      sentimentField: fieldType?.canAnalyze ? false : undefined,
    };
    setEditingField(newField);
    setShowFieldModal(true);
  };

  const saveField = () => {
    if (!editingField) return;

    const existingIndex = config.fields.findIndex(f => f.id === editingField.id);
    if (existingIndex >= 0) {
      setConfig({
        ...config,
        fields: config.fields.map(f => f.id === editingField.id ? editingField : f)
      });
    } else {
      setConfig({ ...config, fields: [...config.fields, editingField] });
    }
    setShowFieldModal(false);
    setEditingField(null);
  };

  const deleteField = (id: string) => {
    setConfig({
      ...config,
      fields: config.fields.filter(f => f.id !== id)
    });
  };

  const editField = (field: FormField) => {
    setEditingField({ ...field });
    setShowFieldModal(true);
  };

  const copyEmbedCode = () => {
    const code = `<script src="https://your-domain.com/widget.js"
  data-widget="feedback-form"
  data-project-id="${projectId}"
  data-form-slug="${config.slug}">
</script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFieldIcon = (type: string) => {
    const fieldType = FIELD_TYPES.find(f => f.type === type);
    return fieldType?.icon || Type;
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
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Feedback Form Builder</h1>
              <p className="text-gray-500">Create custom forms to collect stakeholder feedback</p>
            </div>
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
              onClick={saveConfig}
              disabled={saving}
              className="btn btn-primary"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Form'}
            </button>
          </div>
        </div>

        {/* Main Editor Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Form Settings Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary-600" />
                  Form Settings
                </h2>
              </div>
              <div className="card-body space-y-4">
                <div className="form-group">
                  <label className="label">Form Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    className="input"
                    placeholder="e.g., Community Feedback Survey"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Slug</label>
                  <input
                    type="text"
                    value={config.slug}
                    onChange={(e) => setConfig({ ...config, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="input"
                    placeholder="auto-generated-from-name"
                  />
                  <p className="form-hint">Used in embed code. Letters, numbers, and hyphens only.</p>
                </div>
                <div className="form-group">
                  <label className="label">Description</label>
                  <textarea
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                    className="textarea"
                    rows={2}
                    placeholder="Brief description of this form..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Status</label>
                    <select
                      value={config.status}
                      onChange={(e) => setConfig({ ...config, status: e.target.value as FormConfig['status'] })}
                      className="select"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Submit Button Text</label>
                    <input
                      type="text"
                      value={config.submitButtonText}
                      onChange={(e) => setConfig({ ...config, submitButtonText: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.wizardMode}
                      onChange={(e) => setConfig({ ...config, wizardMode: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Multi-Step Wizard Mode</span>
                      <p className="text-xs text-gray-500">Display one question per page with progress bar</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Fields Card */}
            <div className="card">
              <div className="card-header">
                <h2>Form Fields</h2>
                <span className="badge badge-primary">{config.fields.length} fields</span>
              </div>
              <div className="card-body">
                {config.fields.length === 0 ? (
                  <div className="empty-state py-12">
                    <AlignLeft className="empty-state-icon" />
                    <h3>No Fields Yet</h3>
                    <p>Click a field type from the sidebar to add your first field.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {config.fields.map((field, index) => {
                      const FieldIcon = getFieldIcon(field.type);
                      return (
                        <div
                          key={field.id}
                          className="field-item group"
                          onClick={() => editField(field)}
                        >
                          <div className="text-gray-400 cursor-grab">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className="field-item-icon">
                            <FieldIcon className="w-4 h-4" />
                          </div>
                          <div className="field-item-info">
                            <div className="field-item-label">
                              {field.label}
                              {field.required && (
                                <span className="field-item-badge required">Required</span>
                              )}
                              {field.sentimentField && (
                                <span className="field-item-badge ai">AI Analysis</span>
                              )}
                            </div>
                            <div className="field-item-type">
                              {FIELD_TYPES.find(f => f.type === field.type)?.label || field.type}
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); editField(field); }}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Field Types Palette */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-sm">Field Types</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 gap-2">
                  {FIELD_TYPES.map(ft => (
                    <button
                      key={ft.type}
                      onClick={() => addField(ft.type as FormField['type'])}
                      className="field-type-btn"
                    >
                      <ft.icon className="w-4 h-4" />
                      <span className="text-xs">{ft.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Embed Code */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-sm">Embed This Form</h3>
              </div>
              <div className="card-body">
                <input
                  type="text"
                  readOnly
                  value={`[consultation_form slug="${config.slug}"]`}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="shortcode-input mb-3"
                />
                <button
                  onClick={copyEmbedCode}
                  className="btn btn-secondary btn-sm w-full"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Full Embed Code'}
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-sm">Notifications</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="form-group">
                  <label className="label">Notification Email</label>
                  <input
                    type="email"
                    value={config.notifyEmail}
                    onChange={(e) => setConfig({ ...config, notifyEmail: e.target.value })}
                    className="input input-sm"
                    placeholder="notify@example.com"
                  />
                  <p className="form-hint">Receive email when submissions arrive</p>
                </div>
                <div className="form-group">
                  <label className="label">Success Message</label>
                  <textarea
                    value={config.successMessage}
                    onChange={(e) => setConfig({ ...config, successMessage: e.target.value })}
                    className="textarea"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-sm">Tips</h3>
              </div>
              <div className="card-body">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Mark textarea fields as "Use for AI Analysis" to include them in sentiment analysis</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Drag fields to reorder them</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-1.5 flex-shrink-0" />
                    <span>The first email field will be used for notifications</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Field Editor Modal */}
      {showFieldModal && editingField && (
        <div className="modal-overlay" onClick={() => setShowFieldModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{config.fields.find(f => f.id === editingField.id) ? 'Edit Field' : 'Add Field'}</h2>
              <button onClick={() => setShowFieldModal(false)} className="modal-close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="label">Label <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editingField.label}
                  onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                  className="input"
                />
              </div>

              {editingField.type !== 'rating' && editingField.type !== 'hidden' && (
                <div className="form-group">
                  <label className="label">Placeholder</label>
                  <input
                    type="text"
                    value={editingField.placeholder || ''}
                    onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                    className="input"
                  />
                </div>
              )}

              {(editingField.type === 'select' || editingField.type === 'radio' || editingField.type === 'checkbox') && (
                <div className="form-group">
                  <label className="label">Options (one per line)</label>
                  <textarea
                    value={editingField.options?.join('\n') || ''}
                    onChange={(e) => setEditingField({ ...editingField, options: e.target.value.split('\n').filter(o => o.trim()) })}
                    rows={4}
                    className="textarea"
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                  />
                </div>
              )}

              {editingField.type === 'hidden' && (
                <div className="form-group">
                  <label className="label">Default Value</label>
                  <input
                    type="text"
                    value={editingField.value || ''}
                    onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                    className="input"
                  />
                </div>
              )}

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingField.required}
                    onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600"
                  />
                  <span className="text-sm text-gray-700">Required field</span>
                </label>

                {editingField.type === 'textarea' && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingField.sentimentField || false}
                      onChange={(e) => setEditingField({ ...editingField, sentimentField: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600"
                    />
                    <div>
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-primary-600" />
                        Use for AI Sentiment Analysis
                      </span>
                      <p className="text-xs text-gray-500 ml-5">Include this field's content in AI analysis</p>
                    </div>
                  </label>
                )}

                <div className="pt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Field Width</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="width"
                        checked={editingField.width === 'full'}
                        onChange={() => setEditingField({ ...editingField, width: 'full' })}
                        className="text-primary-600"
                      />
                      <span className="text-sm">Full Width</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="width"
                        checked={editingField.width === 'half'}
                        onChange={() => setEditingField({ ...editingField, width: 'half' })}
                        className="text-primary-600"
                      />
                      <span className="text-sm">Half Width</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowFieldModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={saveField} className="btn btn-primary">
                <Check className="w-4 h-4" />
                Save Field
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
