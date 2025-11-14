'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadReferenceIndex } from '@/lib/references/loader';
import type { ReferenceIndex, ReferenceSection, ReferenceSource } from '@/lib/references/types';
import { SearchNormal1, DocumentText } from 'iconsax-react';

export default function DocsPage() {
  const [index, setIndex] = useState<ReferenceIndex | null>(null);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<{ sourceId: string; sectionId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReferenceIndex()
      .then((data) => {
        setIndex(data);
        if (data.sources[0]?.sections[0]) {
          setSelected({ sourceId: data.sources[0].id, sectionId: data.sources[0].sections[0].id });
        }
      })
      .catch((e) => setError(e?.message || 'Failed to load documentation'));
  }, []);

  const filter = (text: string) => text.toLowerCase().includes(q.toLowerCase());

  const filteredSources = useMemo(() => {
    if (!index) return [] as ReferenceSource[];
    if (!q.trim()) return index.sources;
    return index.sources
      .map((s) => ({
        ...s,
        sections: s.sections.filter((sec) => filter(sec.title) || filter(sec.content)),
      }))
      .filter((s) => s.sections.length > 0 || filter(s.name));
  }, [index, q]);

  const currentSection: ReferenceSection | null = useMemo(() => {
    if (!index || !selected) return null;
    const src = index.sources.find((s) => s.id === selected.sourceId);
    return src?.sections.find((sec) => sec.id === selected.sectionId) || null;
  }, [index, selected]);

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <SearchNormal1 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles and content"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border-b border-red-200">{error}</div>
          )}
          {filteredSources.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No results</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredSources.map((src) => (
                <li key={src.id}>
                  <div className="px-3 pt-3 pb-2 text-xs font-semibold text-gray-600 flex items-center gap-2">
                    <DocumentText size={14} className="text-gray-500" />
                    {src.name}
                  </div>
                  <ul>
                    {src.sections.map((sec) => {
                      const isActive = selected && selected.sourceId === src.id && selected.sectionId === sec.id;
                      return (
                        <li key={sec.id}>
                          <button
                            onClick={() => setSelected({ sourceId: src.id, sectionId: sec.id })}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                              isActive ? 'bg-gray-50 text-primary' : 'text-gray-700'
                            }`}
                          >
                            {sec.title}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="lg:col-span-9">
        {!currentSection ? (
          <div className="p-6 bg-white border border-gray-200 rounded-lg text-sm text-gray-500">Select a section to view content.</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-5 border-b border-gray-200">
              <h1 className="text-lg font-semibold text-gray-800">{currentSection.title}</h1>
              {selected && (
                <p className="text-xs text-gray-500 mt-1">
                  Source: {index?.sources.find((s) => s.id === selected.sourceId)?.name}
                </p>
              )}
            </div>
            <div className="p-5">
              <div className="prose max-w-none text-sm text-gray-800 whitespace-pre-wrap">{currentSection.content}</div>
              {currentSection.references && currentSection.references.length > 0 && (
                <div className="mt-4 text-xs text-gray-600">
                  <div className="font-semibold mb-1">References</div>
                  <ul className="list-disc ml-5 space-y-1">
                    {currentSection.references.map((r, idx) => (
                      <li key={idx}>
                        <span className="font-medium">{r.label}</span>: {r.citation}
                        {r.link && (
                          <>
                            {' '}<a href={r.link} target="_blank" rel="noreferrer" className="text-primary hover:underline">link</a>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
