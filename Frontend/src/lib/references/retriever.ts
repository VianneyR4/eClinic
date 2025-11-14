import { loadReferenceIndex } from './loader';
import { RetrievedChunk } from './types';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export async function retrieveRelevant(query: string, k = 5): Promise<RetrievedChunk[]> {
  const index = await loadReferenceIndex();
  const qTokens = tokenize(query);
  const qSet = new Set(qTokens);

  const results: RetrievedChunk[] = [];

  for (const src of index.sources) {
    for (const sec of src.sections) {
      const tokens = tokenize(sec.title + ' ' + sec.content);
      // Simple keyword overlap score; prioritize title matches
      let score = 0;
      for (const t of tokens) {
        if (qSet.has(t)) score += 1;
      }
      // Boost if title tokens overlap
      const titleTokens = tokenize(sec.title);
      for (const t of titleTokens) {
        if (qSet.has(t)) score += 2;
      }
      if (score > 0) {
        results.push({
          sourceId: src.id,
          sourceName: src.name,
          sectionId: sec.id,
          title: sec.title,
          content: sec.content,
          score,
          references: sec.references,
        });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, k);
}

export function synthesizeAnswer(query: string, chunks: RetrievedChunk[]): { answer: string; citations: RetrievedChunk[] } {
  if (chunks.length === 0) {
    return {
      answer: 'No matching guidance found in local references. Please refine your query.',
      citations: [],
    };
  }

  const bulletPoints = chunks.map((c) => `- ${c.title}: ${c.content}`);
  const answer = [
    `Here is guidance based on local references:`,
    ...bulletPoints,
    ``,
    `This answer is synthesized from the sources listed below.`,
  ].join('\n');

  return { answer, citations: chunks };
}
