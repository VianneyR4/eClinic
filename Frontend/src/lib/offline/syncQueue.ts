// Minimal sync queue using localStorage. Replace with IndexedDB for scale.

type QueuedRequest = {
  id: string;
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  createdAt: number;
};

const KEY = 'eclinic_sync_queue_v1';

function loadQueue(): QueuedRequest[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveQueue(q: QueuedRequest[]) {
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function enqueue(url: string, options: RequestInit = {}) {
  const req: QueuedRequest = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    url,
    method: (options.method || 'POST').toUpperCase(),
    body: options.body ? JSON.parse(options.body as string) : undefined,
    headers: options.headers as Record<string, string> | undefined,
    createdAt: Date.now(),
  };
  const q = loadQueue();
  q.push(req);
  saveQueue(q);
}

export async function flushQueue(baseHeaders: Record<string, string> = {}) {
  if (!navigator.onLine) return;
  let q = loadQueue();
  const remain: QueuedRequest[] = [];
  for (const item of q) {
    try {
      const resp = await fetch(item.url, {
        method: item.method,
        headers: { 'Content-Type': 'application/json', ...(item.headers||{}), ...baseHeaders },
        body: item.body ? JSON.stringify(item.body) : undefined,
      });
      if (!resp.ok) throw new Error('HTTP '+resp.status);
    } catch (e) {
      remain.push(item);
    }
  }
  saveQueue(remain);
}

// Attach auto-flush on regain connectivity
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => flushQueue());
}
