'use client';

import { useEffect, useMemo, useState } from 'react';
import { retrieveRelevant, synthesizeAnswer } from '@/lib/references/retriever';
import { loadReferenceIndex } from '@/lib/references/loader';
import type { RetrievedChunk } from '@/lib/references/types';
import { SearchNormal1, Information } from 'iconsax-react';

export default function AssistantPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chunks, setChunks] = useState<RetrievedChunk[]>([]);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Warm up reference index cache
    loadReferenceIndex().catch(() => {});
  }, []);

  const canAsk = query.trim().length > 2;

  const handleAsk = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!canAsk) return;
    setLoading(true);
    setError(null);
    try {
      const retrieved = await retrieveRelevant(query, 5);
      setChunks(retrieved);
      const synth = synthesizeAnswer(query, retrieved);
      setAnswer(synth.answer);
    } catch (err: any) {
      setError(err?.message || 'Failed to search references');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Virtual Assistant</h1>
          <p className="text-sm text-gray-500 mt-1">
            Answers are generated only from local references (WHO and Rwanda manuals). Works offline.
          </p>
        </div>
        <a
          href="/dashboard/docs"
          className="text-sm text-primary hover:underline"
        >
          Browse Documentation
        </a>
      </div>

      <form onSubmit={handleAsk} className="mb-4">
        <div className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <SearchNormal1 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about a case (e.g., child fever, ANC danger signs, malaria protocol)"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={!canAsk || loading}
            className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Ask'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md mb-4">{error}</div>
      )}

      {answer && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Information size={18} className="text-primary" />
            <h2 className="text-sm font-semibold text-gray-800">Assistant Answer</h2>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">{answer}</pre>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Sources</h3>
        </div>
        {chunks.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No citations yet. Ask a question above.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {chunks.map((c) => (
              <li key={c.sectionId} className="p-4">
                <div className="text-xs text-gray-500 mb-1">{c.sourceName}</div>
                <div className="text-sm font-medium text-gray-800">{c.title}</div>
                <div className="text-sm text-gray-700 mt-1">{c.content}</div>
                {c.references && c.references.length > 0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    References: {c.references.map((r, idx) => (
                      <span key={idx}>
                        {r.label}{r.link ? (
                          <>
                            {' '}<a className="text-primary hover:underline" href={r.link} target="_blank" rel="noreferrer">link</a>
                          </>
                        ) : null}{idx < c.references!.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
