const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' ? 'http://localhost:8001/api' : '/api')
  : '/api';

// Get API key from local storage
function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('admin_api_key') || '';
}

export function setApiKey(key: string) {
  localStorage.setItem('admin_api_key', key);
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) return {} as T;

  return JSON.parse(text);
}

// Project types
export interface Project {
  id: string;
  name: string;
  client: string | null;
  site_address: string | null;
  status: string;
  persona_prompt: string | null;
  welcome_message: string | null;
  disclaimer: string | null;
  fallback_message: string | null;
  contact_email: string | null;
  blocked_topics: string[];
  widget_config: Record<string, any>;
  created_at: string;
  updated_at: string;
  document_count: number;
  chunk_count: number;
}

export interface Document {
  id: string;
  project_id: string;
  filename: string;
  original_filename: string | null;
  file_type: string | null;
  content_type: string;
  upload_date: string;
  processed: boolean;
  processing_error: string | null;
  page_count: number | null;
  tags: string[];
  chunk_count: number;
}

export interface ManualQA {
  id: string;
  project_id: string;
  question: string;
  answer: string;
  keywords: string[];
  priority: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  session_id: string;
  started_at: string;
  message_count: number;
  has_flagged: boolean;
}

export interface ConversationDetail {
  id: string;
  session_id: string;
  started_at: string;
  user_agent: string | null;
  messages: Message[];
}

export interface Message {
  id: string;
  role: string;
  content: string;
  confidence_score: number | null;
  feedback: string | null;
  created_at: string;
}

export interface Analytics {
  total_conversations: number;
  total_messages: number;
  user_messages: number;
  avg_messages_per_conversation: number;
  flagged_questions: number;
  resolved_flagged: number;
  helpful_feedback: number;
  not_helpful_feedback: number;
  avg_confidence: number;
  conversations_last_7_days: number;
  conversations_last_30_days: number;
}

export interface FlaggedQuestion {
  id: string;
  question: string;
  ai_response: string;
  reason: string;
  resolved: boolean;
  notes: string | null;
  created_at: string;
}

// Query types
export interface Query {
  id: string;
  project_id: string;
  subject: string;
  message: string;
  submitter_name: string;
  submitter_email: string;
  submitter_phone?: string;
  status: 'new' | 'in_progress' | 'pending_approval' | 'approved' | 'sent' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category_id?: string;
  assigned_to?: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface QueryStats {
  total: number;
  new: number;
  in_progress: number;
  pending_approval: number;
  sent: number;
}

export interface Widget {
  id: string;
  project_id: string;
  widget_type: string;
  name: string;
  config: Record<string, any>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// API functions
export const api = {
  // Generic methods
  async get<T>(endpoint: string): Promise<T> {
    return fetchApi(endpoint);
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    return fetchApi(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    return fetchApi(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint: string): Promise<void> {
    return fetchApi(endpoint, { method: 'DELETE' });
  },

  // Projects
  async listProjects(): Promise<Project[]> {
    return fetchApi('/projects');
  },

  async getProject(id: string): Promise<Project> {
    return fetchApi(`/projects/${id}`);
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    return fetchApi('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return fetchApi(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async archiveProject(id: string): Promise<void> {
    return fetchApi(`/projects/${id}`, { method: 'DELETE' });
  },

  async getEmbedCode(id: string): Promise<{ embed_code: string; project_id: string }> {
    return fetchApi(`/projects/${id}/embed-code`);
  },

  // Documents
  async listDocuments(projectId: string): Promise<Document[]> {
    return fetchApi(`/projects/${projectId}/documents`);
  },

  async uploadDocument(
    projectId: string,
    file: File,
    contentType: string = 'public',
    tags: string = ''
  ): Promise<Document> {
    const apiKey = getApiKey();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('content_type', contentType);
    formData.append('tags', tags);

    const response = await fetch(`${API_BASE}/projects/${projectId}/documents`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  },

  async deleteDocument(id: string): Promise<void> {
    return fetchApi(`/documents/${id}`, { method: 'DELETE' });
  },

  async scrapeUrl(
    projectId: string,
    url: string,
    contentType: string = 'public',
    tags: string[] = []
  ): Promise<{ message: string; chunks_created: number }> {
    return fetchApi(`/projects/${projectId}/scrape`, {
      method: 'POST',
      body: JSON.stringify({ url, content_type: contentType, tags }),
    });
  },

  async crawlSite(
    projectId: string,
    url: string,
    contentType: string = 'public',
    tags: string[] = [],
    maxPages: number = 50
  ): Promise<{ message: string; pages_scraped: number; chunks_created: number; errors: string | null }> {
    return fetchApi(`/projects/${projectId}/crawl`, {
      method: 'POST',
      body: JSON.stringify({ url, content_type: contentType, tags, max_pages: maxPages }),
    });
  },

  // Manual Q&A
  async listQAs(projectId: string): Promise<ManualQA[]> {
    return fetchApi(`/projects/${projectId}/qa`);
  },

  async createQA(projectId: string, data: Partial<ManualQA>): Promise<ManualQA> {
    return fetchApi(`/projects/${projectId}/qa`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateQA(id: string, data: Partial<ManualQA>): Promise<ManualQA> {
    return fetchApi(`/qa/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteQA(id: string): Promise<void> {
    return fetchApi(`/qa/${id}`, { method: 'DELETE' });
  },

  // Analytics
  async getAnalytics(projectId: string): Promise<Analytics> {
    return fetchApi(`/projects/${projectId}/analytics`);
  },

  async listConversations(projectId: string, limit = 50): Promise<Conversation[]> {
    return fetchApi(`/projects/${projectId}/conversations?limit=${limit}`);
  },

  async getConversation(id: string): Promise<ConversationDetail> {
    return fetchApi(`/conversations/${id}`);
  },

  async listFlaggedQuestions(projectId: string): Promise<FlaggedQuestion[]> {
    return fetchApi(`/projects/${projectId}/flagged`);
  },

  async resolveFlagged(id: string, notes?: string): Promise<void> {
    return fetchApi(`/flagged/${id}/resolve${notes ? `?notes=${encodeURIComponent(notes)}` : ''}`, {
      method: 'PUT',
    });
  },

  // Image upload
  async uploadImage(
    projectId: string,
    file: File
  ): Promise<{ url: string; filename: string; original_filename: string; size: number }> {
    const apiKey = getApiKey();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/projects/${projectId}/images`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  },

  async exportConversations(projectId: string): Promise<Blob> {
    const apiKey = getApiKey();
    const response = await fetch(`${API_BASE}/projects/${projectId}/export`, {
      headers: { 'X-API-Key': apiKey },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },
};
