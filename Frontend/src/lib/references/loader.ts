import { ReferenceIndex } from './types';

let cache: ReferenceIndex | null = null;

export async function loadReferenceIndex(): Promise<ReferenceIndex> {
  if (cache) return cache;
  const res = await fetch('/references/index.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('Failed to load reference index');
  const data = (await res.json()) as ReferenceIndex;
  cache = data;
  return data;
}
