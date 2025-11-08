// CouchDB Replication setup
// Note: This requires RxDB to be initialized first

import { getDB } from '../db/rxdb';

const COUCHDB_URL = process.env.NEXT_PUBLIC_COUCHDB_URL || 'http://localhost:5984';
const COUCHDB_DB_NAME = process.env.NEXT_PUBLIC_COUCHDB_DB_NAME || 'eclinic';

export interface ReplicationOptions {
  collection: string;
  url: string;
  database: string;
  auth?: {
    username: string;
    password: string;
  };
}

export const setupReplication = async (
  collectionName: string,
  options?: Partial<ReplicationOptions>
) => {
  // Only work on client side
  if (typeof window === 'undefined') {
    return null;
  }

  const db = getDB();
  if (!db) {
    throw new Error('Database not initialized. Call initRxDB() first.');
  }

  const collection = db[collectionName];
  if (!collection) {
    throw new Error(`Collection ${collectionName} not found`);
  }

  try {
    // Dynamic import to avoid SSR issues
    const replicationModule = await import('rxdb/plugins/replication-couchdb');
    const { replicateCouchDB } = replicationModule;

    const replicationOptions: ReplicationOptions = {
      collection: collectionName,
      url: options?.url || COUCHDB_URL,
      database: options?.database || COUCHDB_DB_NAME,
      auth: options?.auth,
    };

    const replicationState = replicateCouchDB({
      collection,
      replicationIdentifier: `${replicationOptions.database}-${collectionName}`,
      url: replicationOptions.url,
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        // Add authentication if provided
        const fetchOptions: RequestInit = { ...init };
        if (replicationOptions.auth) {
          const auth = btoa(
            `${replicationOptions.auth.username}:${replicationOptions.auth.password}`
          );
          fetchOptions.headers = {
            ...fetchOptions.headers,
            Authorization: `Basic ${auth}`,
          };
        }
        return fetch(input, fetchOptions);
      },
      live: true,
      retryTime: 5000,
      autoStart: true,
      waitForLeadership: true,
      pull: {
        batchSize: 100,
        modifier: (doc: any) => {
          // Transform documents if needed
          return doc;
        },
      },
      push: {
        batchSize: 100,
        modifier: (doc: any) => {
          // Transform documents if needed
          return doc;
        },
      },
    });

    return replicationState;
  } catch (error) {
    console.error('Error setting up replication:', error);
    throw error;
  }
};

export const startReplication = async (collectionName: string) => {
  try {
    const replicationState = await setupReplication(collectionName);
    if (replicationState) {
      replicationState.start();
    }
    return replicationState;
  } catch (error) {
    console.error('Error starting replication:', error);
    throw error;
  }
};

export const stopReplication = (replicationState: any) => {
  if (replicationState) {
    replicationState.cancel();
  }
};

export default setupReplication;
