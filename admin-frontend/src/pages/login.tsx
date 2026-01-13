import { useState } from 'react';
import { useRouter } from 'next/router';
import { setApiKey } from '@/api/client';

export default function LoginPage() {
  const router = useRouter();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Test the API key - use port 8001 for local development
      const apiBase = window.location.hostname === 'localhost'
        ? 'http://localhost:8001/api'
        : '/api';
      const response = await fetch(`${apiBase}/projects`, {
        headers: { 'X-API-Key': apiKeyInput },
      });

      if (!response.ok) {
        throw new Error('Invalid API key');
      }

      // Save and redirect
      setApiKey(apiKeyInput);
      router.push('/');
    } catch (err) {
      setError('Invalid API key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">Consultation AI</h1>
          <p className="text-gray-600 mt-2">Admin Dashboard</p>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="label">
                Admin API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="input"
                placeholder="Enter your API key"
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4">
            The default API key for development is:{' '}
            <code className="bg-gray-100 px-1 rounded">change-this-admin-key-in-production</code>
          </p>
        </div>
      </div>
    </div>
  );
}
