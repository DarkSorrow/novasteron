import { createRendererSideBirpc } from '../utils/createRendererSideBirpc';
import type { DatabaseFunctions } from '../../electron/services/database';

import { Model } from '../types/schema';


export interface Settings {
  theme: 'dark' | 'light' | 'system';
  language: string;
}

export const databaseService = createRendererSideBirpc<DatabaseFunctions, {}>(
  'database-to-renderer',
  'database-to-main',
  {}
);

// Helper functions for common operations
export const getModels = async (): Promise<Model[]> => {
  return databaseService.getModels();
};

export const addModel = async (model: Omit<Model, 'id' | 'createdAt'>): Promise<string> => {
  return databaseService.addModel(model);
};

export const updateModel = async (id: string, model: Partial<Omit<Model, 'id' | 'createdAt'>>): Promise<void> => {
  return databaseService.updateModel(id, model);
};

export const deleteModel = async (id: string): Promise<void> => {
  return databaseService.deleteModel(id);
};

export const getSettings = async (): Promise<Settings> => {
  return databaseService.getPrompts('settings') || {
    theme: 'system',
    language: 'en'
  };
};

export const setSettings = async (settings: Settings): Promise<void> => {
  return databaseService.setPrompts('settings', settings);
};

