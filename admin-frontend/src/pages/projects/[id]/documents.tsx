import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Upload, FileText, Globe, Trash2, RefreshCw, Check, X, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import { api, Document } from '@/api/client';

export default function DocumentsPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showCrawlModal, setShowCrawlModal] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [crawlUrl, setCrawlUrl] = useState('');
  const [maxPages, setMaxPages] = useState(50);
  const [uploadContentType, setUploadContentType] = useState('public');

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(id as string),
    enabled: !!id,
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => api.listDocuments(id as string),
    enabled: !!id,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      api.uploadDocument(id as string, file, uploadContentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  const scrapeMutation = useMutation({
    mutationFn: () => api.scrapeUrl(id as string, scrapeUrl, uploadContentType),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setShowUrlModal(false);
      setScrapeUrl('');
      alert(`Scrape complete! Created ${data.chunks_created} chunks from the URL.`);
    },
  });

  const crawlMutation = useMutation({
    mutationFn: () => api.crawlSite(id as string, crawlUrl, uploadContentType, [], maxPages),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setShowCrawlModal(false);
      setCrawlUrl('');
      alert(`Crawl complete! Scraped ${data.pages_scraped} pages and created ${data.chunks_created} chunks.`);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        uploadMutation.mutate(file);
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (doc: Document) => {
    if (doc.processing_error) {
      return <AlertCircle className="text-red-500" size={16} />;
    }
    if (doc.processed) {
      return <Check className="text-green-500" size={16} />;
    }
    return <RefreshCw className="text-yellow-500 animate-spin" size={16} />;
  };

  return (
    <Layout projectId={id as string} projectName={project?.name}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Documents</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCrawlModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Globe size={20} />
            Crawl Site
          </button>
          <button
            onClick={() => setShowUrlModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Globe size={20} />
            Scrape URL
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary flex items-center gap-2"
          >
            <Upload size={20} />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Content Type Selector */}
      <div className="card p-4 mb-6">
        <label className="label">Content Type for New Uploads</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="contentType"
              value="public"
              checked={uploadContentType === 'public'}
              onChange={(e) => setUploadContentType(e.target.value)}
              className="text-primary-600"
            />
            <span>Public (can be quoted in responses)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="contentType"
              value="internal"
              checked={uploadContentType === 'internal'}
              onChange={(e) => setUploadContentType(e.target.value)}
              className="text-primary-600"
            />
            <span>Internal (informs responses but not quoted)</span>
          </label>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadMutation.isPending && (
        <div className="card p-4 mb-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2">
            <RefreshCw className="animate-spin text-blue-600" size={20} />
            <span>Uploading and processing document...</span>
          </div>
        </div>
      )}

      {/* Documents List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : documents?.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 mb-4">
            No documents yet. Upload PDFs, DOCX, or TXT files to build the knowledge base.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
          >
            Upload Documents
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Document
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Chunks
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Uploaded
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents?.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="text-gray-400" size={20} />
                      <span className="font-medium">
                        {doc.original_filename || doc.filename}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${doc.content_type === 'public'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                        }
                      `}
                    >
                      {doc.content_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc)}
                      <span className="text-sm">
                        {doc.processing_error
                          ? 'Error'
                          : doc.processed
                          ? 'Processed'
                          : 'Processing'}
                      </span>
                    </div>
                    {doc.processing_error && (
                      <p className="text-xs text-red-500 mt-1">
                        {doc.processing_error}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {doc.chunk_count}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {format(new Date(doc.upload_date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        if (confirm('Delete this document?')) {
                          deleteMutation.mutate(doc.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* URL Scrape Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Scrape URL Content</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                scrapeMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="url" className="label">
                  URL
                </label>
                <input
                  id="url"
                  type="url"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  className="input"
                  placeholder="https://example.com/page"
                  required
                />
              </div>

              {scrapeMutation.isError && (
                <p className="text-red-600 text-sm">
                  Failed to scrape URL. Please check the URL and try again.
                </p>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scrapeMutation.isPending}
                  className="btn btn-primary"
                >
                  {scrapeMutation.isPending ? 'Scraping...' : 'Scrape Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Site Crawl Modal */}
      {showCrawlModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Crawl Entire Site</h2>
            <p className="text-sm text-gray-600 mb-4">
              This will discover and scrape all pages on the website, starting from the URL you provide.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                crawlMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="crawlUrl" className="label">
                  Starting URL
                </label>
                <input
                  id="crawlUrl"
                  type="url"
                  value={crawlUrl}
                  onChange={(e) => setCrawlUrl(e.target.value)}
                  className="input"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="maxPages" className="label">
                  Maximum Pages: {maxPages}
                </label>
                <input
                  id="maxPages"
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={maxPages}
                  onChange={(e) => setMaxPages(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>5</span>
                  <span>100</span>
                </div>
              </div>

              {crawlMutation.isError && (
                <p className="text-red-600 text-sm">
                  Failed to crawl site. Please check the URL and try again.
                </p>
              )}

              {crawlMutation.isPending && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="animate-spin text-blue-600" size={16} />
                    <span className="text-sm text-blue-700">
                      Crawling site... This may take a few minutes.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCrawlModal(false)}
                  className="btn btn-secondary"
                  disabled={crawlMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={crawlMutation.isPending}
                  className="btn btn-primary"
                >
                  {crawlMutation.isPending ? 'Crawling...' : 'Start Crawl'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
