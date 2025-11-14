export interface ReferenceSource {
  id: string;
  name: string;
  url?: string;
  sections: ReferenceSection[];
}

export interface ReferenceSection {
  id: string;
  title: string;
  content: string;
  embedding?: number[];
  references?: Array<{ label: string; citation: string; link?: string }>; 
}

export interface ReferenceIndex {
  version: number;
  sources: ReferenceSource[];
}

export interface RetrievedChunk {
  sourceId: string;
  sourceName: string;
  sectionId: string;
  title: string;
  content: string;
  score: number;
  references?: Array<{ label: string; citation: string; link?: string }>;
}
