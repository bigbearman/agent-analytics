import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Globe, Code, CheckCircle2, Loader2, Copy, Check } from 'lucide-react';
import clsx from 'clsx';
import { useOnboarding } from '../../hooks/use-onboarding';
import { useSites, useCreateSite } from '../../hooks/use-sites';
import { api } from '../../lib/api';

const STEP_INFO = [
  { label: 'Add Site', icon: Globe },
  { label: 'Install Tracker', icon: Code },
  { label: 'Verify', icon: CheckCircle2 },
];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { step, stepIndex, nextStep, setStep } = useOnboarding();
  const { data: sitesData } = useSites();
  const sites = sitesData?.data ?? [];

  // Redirect if already done
  if (step === 'done') {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to AgentPulse</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Let&apos;s set up AI traffic tracking for your site in 3 simple steps
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4">
        {STEP_INFO.map((s, i) => {
          const isActive = i === stepIndex;
          const isDone = i < stepIndex;

          return (
            <div key={s.label} className="flex items-center gap-2">
              {i > 0 && (
                <div className={clsx('w-12 h-0.5', isDone ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700')} />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    isDone
                      ? 'bg-brand-500 text-white'
                      : isActive
                        ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 ring-2 ring-brand-500'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400',
                  )}
                >
                  {isDone ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className={clsx(
                    'text-sm font-medium hidden sm:inline',
                    isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400',
                  )}
                >
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
        {step === 'create-site' && <CreateSiteStep onComplete={nextStep} />}
        {step === 'install-snippet' && (
          <InstallSnippetStep
            siteId={sites[sites.length - 1]?.id ?? ''}
            onComplete={nextStep}
          />
        )}
        {step === 'verify' && (
          <VerifyStep
            siteId={sites[sites.length - 1]?.id ?? ''}
            onComplete={() => {
              setStep('done');
              navigate('/', { replace: true });
            }}
          />
        )}
      </div>
    </div>
  );
}

function CreateSiteStep({ onComplete }: { onComplete: () => void }) {
  const [domain, setDomain] = useState('');
  const createSite = useCreateSite();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    await createSite.mutateAsync(domain.trim());
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add your website</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Enter the domain you want to track AI traffic for
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Domain
          </label>
          <input
            id="domain"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {createSite.isError && (
          <p className="text-sm text-red-600">{(createSite.error as Error).message}</p>
        )}

        <button
          type="submit"
          disabled={!domain.trim() || createSite.isPending}
          className="w-full py-2.5 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {createSite.isPending ? 'Creating...' : 'Add Site'}
        </button>
      </form>
    </div>
  );
}

function InstallSnippetStep({
  siteId,
  onComplete,
}: {
  siteId: string;
  onComplete: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const { data } = useQuery({
    queryKey: ['snippet', siteId],
    queryFn: () => api.get<{ data: { snippet: string } }>(`/sites/${siteId}/snippet`),
    enabled: !!siteId,
  });

  const snippet = data?.data?.snippet ?? '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Install the tracking snippet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Add this snippet to the <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">&lt;head&gt;</code> of your website
        </p>
      </div>

      <div className="relative">
        <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-800 dark:text-gray-200 overflow-x-auto border border-gray-200 dark:border-gray-700">
          {snippet || 'Loading...'}
        </pre>
        {snippet && (
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} className="text-gray-500" />
            )}
          </button>
        )}
      </div>

      <button
        onClick={onComplete}
        className="w-full py-2.5 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors"
      >
        I&apos;ve installed the snippet
      </button>
    </div>
  );
}

function VerifyStep({
  siteId,
  onComplete,
}: {
  siteId: string;
  onComplete: () => void;
}) {
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setChecking(true);
    setError('');
    try {
      const res = await api.get<{ data: { verified: boolean } }>(
        `/sites/${siteId}/verify`,
      );
      if (res.data.verified) {
        setVerified(true);
      } else {
        setError('No events detected yet. Make sure the snippet is installed and visit your site.');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verify installation</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Visit your website and then click verify to confirm the tracking snippet is working
        </p>
      </div>

      {verified ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Installation verified!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your site is now tracking AI traffic. Let&apos;s go to your dashboard.
          </p>
          <button
            onClick={onComplete}
            className="w-full py-2.5 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-700 dark:text-yellow-400">
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={checking}
            className="w-full py-2.5 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {checking ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Checking...
              </>
            ) : (
              'Verify Installation'
            )}
          </button>

          <button
            onClick={onComplete}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}
