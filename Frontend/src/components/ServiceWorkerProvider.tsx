"use client";

import { useEffect, useState } from 'react';

export default function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <>
      {!online && (
        <div style={{position:'fixed',bottom:12,left:12,zIndex:9999}} className="px-3 py-1 text-xs rounded bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm">
          You are offline. Changes will sync when back online.
        </div>
      )}
      {children}
    </>
  );
}
