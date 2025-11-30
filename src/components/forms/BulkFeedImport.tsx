'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IndustryMultiSelect } from './IndustryMultiSelect';
import { feedsApi } from '@/lib/api/feeds';
import { industriesApi } from '@/lib/api/industries';
import type { Industry } from '@/lib/types/industry';
import { ApiClientError } from '@/lib/api/client';

interface BulkFeedImportProps {
  onClose?: () => void;
}

interface FeedInput {
  name: string;
  url: string;
  logoUrl?: string;
}

export function BulkFeedImport({ onClose }: BulkFeedImportProps) {
  const router = useRouter();
  const [textInput, setTextInput] = useState('');
  const [defaultIndustries, setDefaultIndustries] = useState<Industry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    created: number;
    failed: number;
    failedItems: Array<{ name: string; url: string; error: string }>;
  } | null>(null);

  const parseFeeds = (text: string): FeedInput[] => {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const feeds: FeedInput[] = [];

    for (const line of lines) {
      if (line.startsWith('http://') || line.startsWith('https://')) {
        const url = line;
        const name = extractFeedName(url);
        feeds.push({ name, url });
      } else if (line.includes('|')) {
        const parts = line.split('|').map((p) => p.trim());
        if (parts.length >= 2 && parts[1].startsWith('http')) {
          feeds.push({
            name: parts[0],
            url: parts[1],
            logoUrl: parts[2]?.startsWith('http') ? parts[2] : undefined,
          });
        }
      } else if (line.includes(',')) {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 2 && parts[1].startsWith('http')) {
          feeds.push({
            name: parts[0],
            url: parts[1],
            logoUrl: parts[2]?.startsWith('http') ? parts[2] : undefined,
          });
        }
      }
    }

    return feeds;
  };

  const extractFeedName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');
      const parts = hostname.split('.');
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } catch {
      return 'RSS Feed';
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!textInput.trim()) {
      setError('Please enter at least one RSS feed URL');
      setIsSubmitting(false);
      return;
    }

    if (defaultIndustries.length === 0) {
      setError('Please select at least one industry for all feeds');
      setIsSubmitting(false);
      return;
    }

    try {
      const parsedFeeds = parseFeeds(textInput);

      if (parsedFeeds.length === 0) {
        setError(
          'No valid RSS feed URLs found. Please enter URLs starting with http:// or https://',
        );
        setIsSubmitting(false);
        return;
      }

      const industryIds = defaultIndustries.map((ind) => ind.id);

      const bulkData = parsedFeeds.map((feed) => ({
        name: feed.name,
        url: feed.url,
        logoUrl: feed.logoUrl,
        industries: industryIds,
        autoUpdate: true,
        fullText: false,
        enabled: true,
      }));

      const result = await feedsApi.bulkCreate(bulkData);

      setSuccess({
        created: result.created,
        failed: result.failed,
        failedItems: result.results.failed.map((f: any) => ({
          name: f.feed.name || f.feed.url,
          url: f.feed.url,
          error: f.error,
        })),
      });

      if (result.created > 0) {
        setTimeout(() => {
          router.push('/dashboard/feeds');
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message || 'Failed to import feeds');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          RSS Feed URLs
        </label>
        <p className="mb-2 text-xs text-zinc-500">
          Enter one RSS feed URL per line, or use format: Name|URL|LogoURL
        </p>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={`https://techcrunch.com/feed/
https://www.theverge.com/rss/index.xml
TechCrunch|https://techcrunch.com/feed/|https://techcrunch.com/logo.png
The Verge|https://www.theverge.com/rss/index.xml`}
          className="min-h-[200px] w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          required
        />
        <p className="mt-1 text-xs text-zinc-400">
          {textInput.split('\n').filter((l) => l.trim()).length} feed(s)
          detected
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Default Industries (applied to all feeds)
        </label>
        <IndustryMultiSelect
          selected={defaultIndustries}
          onChange={setDefaultIndustries}
        />
        <p className="mt-1 text-xs text-zinc-400">
          These industries will be assigned to all imported feeds
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          <div className="font-medium">
            Import completed: {success.created} created, {success.failed}{' '}
            failed
          </div>
          {success.failedItems.length > 0 && (
            <div className="mt-2">
              <p className="font-medium">Failed feeds:</p>
              <ul className="mt-1 list-disc pl-5">
                {success.failedItems.map((item, idx) => (
                  <li key={idx}>
                    {item.name}: {item.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Importing...' : `Import ${textInput.split('\n').filter((l) => l.trim()).length} Feed(s)`}
        </Button>
        {onClose && (
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

