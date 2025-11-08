// RxDB initialization for client-side only
// Note: RxDB requires browser environment (IndexedDB)

import patientSchema from './schemas/patient.schema';

// Dynamic imports to avoid SSR issues
let db: any = null;
let RxDB: any = null;

export const initRxDB = async (): Promise<any> => {
  // Only initialize on client side
  if (typeof window === 'undefined') {
    console.warn('RxDB can only be initialized on the client side');
    return null;
  }

  if (db) {
    return db;
  }

  try {
    // Dynamic import to avoid SSR issues
    const rxdbModule = await import('rxdb');
    const dexieStorage = await import('rxdb/plugins/storage-dexie');
    
    // Import replication plugin (only if needed for CouchDB sync)
    let replicationPlugin: any = null;
    try {
      replicationPlugin = await import('rxdb/plugins/replication-couchdb');
      if (replicationPlugin?.RxDBReplicationCouchDBPlugin) {
        rxdbModule.addRxPlugin(replicationPlugin.RxDBReplicationCouchDBPlugin);
      }
    } catch (err) {
      console.warn('Replication plugin not available:', err);
    }

    RxDB = rxdbModule;

    // Create database
    db = await rxdbModule.createRxDatabase({
      name: 'eclinic_db',
      storage: dexieStorage.getRxStorageDexie(),
    });

    // Add collections
    await db.addCollections({
      patients: {
        schema: patientSchema,
      },
    });

    console.log('RxDB initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing RxDB:', error);
    // Return null instead of throwing to allow app to work without DB
    return null;
  }
};

export const getDB = (): any => {
  return db;
};

export default initRxDB;
