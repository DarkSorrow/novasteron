/**
 * Should think of a way to easily import encryption key and allow its use here
 * Cloud based key too with asymmetric encryption?
 */
import { app } from 'electron';
import crypto from 'crypto';
import { Model } from '../../src/types/schema';

interface DatabaseConfig {
  encryptionKey?: string;
}

export interface DatabaseFunctions {
  getModels(): Promise<Model[]>;
  addModel(model: Omit<Model, 'id' | 'createdAt'>): Promise<string>;
  updateModel(id: string, model: Partial<Omit<Model, 'id' | 'createdAt'>>): Promise<void>;
  deleteModel(id: string): Promise<void>;
  getPrompts(key: string): Promise<any>;
  setPrompts(key: string, value: any): Promise<void>;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private db: IDBDatabase | null = null;
  private encryptionKey: string | null = null;
  private dbName = 'novastera-db';
  private dbVersion = 1;

  private constructor(config: DatabaseConfig = {}) {
    if (config.encryptionKey) {
      this.encryptionKey = config.encryptionKey;
    }
    this.initializeDatabase();
  }

  public static getInstance(config?: DatabaseConfig): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService(config);
    }
    return DatabaseService.instance;
  }

  private initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create models store
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models', { keyPath: 'id' });
        }

        // Create settings store
        if (!db.objectStoreNames.contains('prompts')) {
          db.createObjectStore('prompts', { keyPath: 'id' });
        }

        // Create chat history store
        if (!db.objectStoreNames.contains('chatHistory')) {
          const chatStore = db.createObjectStore('chatHistory', { keyPath: 'id' });
          chatStore.createIndex('promptId', 'promptId', { unique: false });
        }
      };
    });
  }

  // Generic database operations
  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.initializeDatabase();
    }
    const transaction = this.db!.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Models operations
  public async addModel(model: Omit<Model, 'id' | 'createdAt'>): Promise<string> {
    const store = await this.getStore('models', 'readwrite');
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      const request = store.add({
        ...model,
        id,
        createdAt: new Date().toISOString()
      });
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  public async updateModel(id: string, model: Partial<Omit<Model, 'id' | 'createdAt'>>): Promise<void> {
    const store = await this.getStore('models', 'readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existingModel = getRequest.result;
        if (!existingModel) {
          reject(new Error('NotFound'));
          return;
        }
        const updatedModel = {
          ...existingModel,
          ...model,
          id, // Ensure ID stays the same
          createdAt: existingModel.createdAt, // Preserve creation date
          updatedAt: new Date().toISOString()
        };
        const updateRequest = store.put(updatedModel);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  public async deleteModel(id: string): Promise<void> {
    const store = await this.getStore('models', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getModels(): Promise<Model[]> {
    const store = await this.getStore('models');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Chat history operations
  public async addChatMessage(modelId: number, message: string, response?: string): Promise<number> {
    const store = await this.getStore('chatHistory', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add({
        modelId,
        message: this.encryptionKey ? this.encryptData(message) : message,
        response: response ? (this.encryptionKey ? this.encryptData(response) : response) : null,
        timestamp: new Date().toISOString()
      });
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  public async getChatHistory(modelId: number): Promise<any[]> {
    const store = await this.getStore('chatHistory');
    return new Promise((resolve, reject) => {
      const request = store.index('modelId').getAll(modelId);
      request.onsuccess = () => {
        const results = request.result;
        if (this.encryptionKey) {
          results.forEach(item => {
            item.message = this.decryptData(item.message);
            if (item.response) {
              item.response = this.decryptData(item.response);
            }
          });
        }
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Prompts operations
  public async setPrompts(key: string, value: any): Promise<void> {
    const store = await this.getStore('prompts', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getPrompts(key: string): Promise<any> {
    const store = await this.getStore('prompts');
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  // Encryption methods
  public setEncryptionKey(key: string): void {
    this.encryptionKey = key;
  }

  private encryptData(data: string): string {
    if (!this.encryptionKey) throw new Error('Encryption key not set');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  private decryptData(encryptedData: string): string {
    if (!this.encryptionKey) throw new Error('Encryption key not set');
    const textParts = encryptedData.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // The existing functions will be used directly
  // No need to add duplicate implementations
}
