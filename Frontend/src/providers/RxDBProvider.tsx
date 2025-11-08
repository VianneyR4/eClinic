'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { initRxDB, getDB } from '../db/rxdb';

interface RxDBContextType {
  db: any;
  isInitialized: boolean;
  error: string | null;
}

const RxDBContext = createContext<RxDBContextType>({
  db: null,
  isInitialized: false,
  error: null,
});

export const useRxDB = () => {
  const context = useContext(RxDBContext);
  if (!context) {
    throw new Error('useRxDB must be used within RxDBProvider');
  }
  return context;
};

interface RxDBProviderProps {
  children: ReactNode;
}

export default function RxDBProvider({ children }: RxDBProviderProps) {
  const [db, setDb] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeDB = async () => {
      try {
        console.log('Initializing RxDB...');
        const database = await initRxDB();
        
        if (isMounted) {
          setDb(database);
          setIsInitialized(true);
          setError(null);
          console.log('RxDB initialized successfully');
        }
      } catch (err: any) {
        console.error('Failed to initialize RxDB:', err);
        if (isMounted) {
          setError(err.message || 'Failed to initialize database');
          setIsInitialized(false);
        }
      }
    };

    // Only initialize on client side
    if (typeof window !== 'undefined') {
      initializeDB();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <RxDBContext.Provider value={{ db, isInitialized, error }}>
      {children}
    </RxDBContext.Provider>
  );
}

