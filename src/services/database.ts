import type { Model, ChatMessage } from '../types/schema';

const DB_NAME = 'novasteron-db';
const DB_VERSION = 1;

const STORES = {
  MODELS: 'models',
  CHAT_HISTORY: 'chatHistory',
  PROMPTS: 'prompts'
} as const;

class Database {
  private static instance: Database;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private isInitializing = false;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    if (this.isInitializing) {
      throw new Error('Database is already being initialized');
    }

    this.isInitializing = true;
    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        const error = new Error(`Failed to open database: ${request.error?.message}`);
        console.error(error);
        this.isInitializing = false;
        reject(error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitializing = false;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create models store
        if (!db.objectStoreNames.contains(STORES.MODELS)) {
          const store = db.createObjectStore(STORES.MODELS, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: true });
        }

        // Create chat history store
        if (!db.objectStoreNames.contains(STORES.CHAT_HISTORY)) {
          const store = db.createObjectStore(STORES.CHAT_HISTORY, { keyPath: 'id' });
          store.createIndex('modelId', 'modelId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create prompts store
        if (!db.objectStoreNames.contains(STORES.PROMPTS)) {
          const store = db.createObjectStore(STORES.PROMPTS, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('modelIDS', 'modelIDS', { unique: false, multiEntry: true });
        }
      };

      request.onblocked = () => {
        const error = new Error('Database is blocked by another connection');
        console.error(error);
        this.isInitializing = false;
        reject(error);
      };
    });

    return this.initPromise;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db.transaction(storeName, mode).objectStore(storeName);
  }

  // Models operations
  async getModels(): Promise<Model[]> {
    await this.ensureInitialized();
    const store = this.getStore(STORES.MODELS);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to get models: ${request.error?.message}`));
    });
  }

  async addModel(model: Omit<Model, 'id' | 'createdAt'>): Promise<string> {
    await this.ensureInitialized();
    const store = this.getStore(STORES.MODELS, 'readwrite');
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      const request = store.add({
        ...model,
        id,
        createdAt: new Date().toISOString()
      });
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(new Error(`Failed to add model: ${request.error?.message}`));
    });
  }

  async updateModel(id: string, model: Partial<Omit<Model, 'id' | 'createdAt'>>): Promise<void> {
    await this.ensureInitialized();
    const store = this.getStore(STORES.MODELS, 'readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existingModel = getRequest.result;
        if (!existingModel) {
          reject(new Error(`Model with id ${id} not found`));
          return;
        }
        const updateRequest = store.put({
          ...existingModel,
          ...model,
          id,
          createdAt: existingModel.createdAt
        });
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(new Error(`Failed to update model: ${updateRequest.error?.message}`));
      };
      getRequest.onerror = () => reject(new Error(`Failed to get model: ${getRequest.error?.message}`));
    });
  }

  async deleteModel(id: string): Promise<void> {
    await this.ensureInitialized();
    const store = this.getStore(STORES.MODELS, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete model: ${request.error?.message}`));
    });
  }

  // Chat History operations
  async addChatMessage(modelId: string, message: string, response?: string): Promise<string> {
    await this.ensureInitialized();
    const store = this.getStore(STORES.CHAT_HISTORY, 'readwrite');
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      const request = store.add({
        id,
        modelId,
        role: 'user',
        content: message,
        timestamp: Date.now()
      });
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(new Error(`Failed to add chat message: ${request.error?.message}`));
    });
  }

  async getChatHistory(modelId: string): Promise<ChatMessage[]> {
    await this.ensureInitialized();
    const store = this.getStore(STORES.CHAT_HISTORY);
    return new Promise((resolve, reject) => {
      const request = store.index('modelId').getAll(modelId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to get chat history: ${request.error?.message}`));
    });
  }

  // Prompts operations
  async getPrompts<T = any>(key: string): Promise<T | undefined> {
    await this.ensureInitialized();
    const store = this.getStore(STORES.PROMPTS);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(new Error(`Failed to get prompts: ${request.error?.message}`));
    });
  }

  async setPrompts<T = any>(key: string, value: T): Promise<void> {
    await this.ensureInitialized();
    const store = this.getStore(STORES.PROMPTS, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ id: key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to set prompts: ${request.error?.message}`));
    });
  }

  // Cleanup method
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

export const database = Database.getInstance();
