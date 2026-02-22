import { useState, FormEvent } from 'react';
import { Globe, Key, Copy, RefreshCw } from 'lucide-react';
import { useSites, useCreateSite, useRotateApiKey } from '../hooks/use-sites';

export function SitesPage() {
  const { data, isLoading } = useSites();
  const createSite = useCreateSite();
  const rotateKey = useRotateApiKey();
  const [domain, setDomain] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const sites = data?.data ?? [];

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    await createSite.mutateAsync(domain.trim());
    setDomain('');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sites</h2>

      {/* Add site form */}
      <form
        onSubmit={handleCreate}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add a new site
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={createSite.isPending}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {createSite.isPending ? 'Adding...' : 'Add site'}
          </button>
        </div>
      </form>

      {/* Sites list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse h-32"
            />
          ))}
        </div>
      ) : sites.length > 0 ? (
        <div className="space-y-4">
          {sites.map((site) => (
            <div
              key={site.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-brand-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {site.domain}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full uppercase">
                    {site.plan}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <Key size={14} className="text-gray-400" />
                <code className="flex-1 text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {site.apiKey}
                </code>
                <button
                  onClick={() => copyToClipboard(site.apiKey, site.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Copy API key"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={() => rotateKey.mutate(site.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Rotate API key"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
              {copied === site.id && (
                <p className="mt-2 text-xs text-green-600">Copied to clipboard!</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No sites yet. Add your first site above.
        </div>
      )}
    </div>
  );
}
