import { useLayoutEffect, useState } from 'react';
import { Base } from '../templates/base';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

import { HeaderNovastera } from '../molecules/header-novastera';
import { HeaderModel } from '../molecules/header-model';
import { NavigationModel } from '../organisms/navigation-model';
import { Model } from '../../types/default';

// Test data for development
export const TEST_MODELS: Model[] = [
  {
    id: 'llama-7b',
    name: 'LLaMA 7B',
    imageUrl: 'https://img.icons8.com/color/96/000000/llama.png',
    description: 'Meta\'s 7B parameter LLaMA model',
    config: { n_gpu_layers: 32, n_threads: 4, n_batch: 512, n_context: 2048 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    description: 'Mistral AI\'s 7B parameter model',
    config: { n_gpu_layers: 32, n_threads: 4, n_batch: 512, n_context: 4096 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'gemma-7b',
    name: 'Gemma 7B',
    description: 'Google\'s 7B parameter Gemma model',
    config: { n_gpu_layers: 32, n_threads: 4, n_batch: 512, n_context: 8192 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'phi-2',
    name: 'Phi-2',
    description: 'Microsoft\'s 2.7B parameter Phi-2 model',
    config: { n_gpu_layers: 24, n_threads: 4, n_batch: 512, n_context: 2048 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: 'openchat-3.5',
    name: 'OpenChat 3.5',
    description: 'Open-source chat model',
    config: { n_gpu_layers: 32, n_threads: 4, n_batch: 512, n_context: 4096 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: 'stable-lm',
    name: 'StableLM',
    description: 'Stability AI\'s language model',
    config: { n_gpu_layers: 28, n_threads: 4, n_batch: 512, n_context: 4096 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: 'falcon-7b',
    name: 'Falcon 7B',
    description: 'TII\'s 7B parameter Falcon model',
    config: { n_gpu_layers: 32, n_threads: 4, n_batch: 512, n_context: 2048 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-20')
  },
  {
    id: 'yi-6b',
    name: 'Yi 6B',
    description: '01.AI\'s 6B parameter Yi model',
    config: { n_gpu_layers: 28, n_threads: 4, n_batch: 512, n_context: 4096 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-03-25'),
    updatedAt: new Date('2024-03-25')
  },
  {
    id: 'qwen-7b',
    name: 'Qwen 7B',
    description: 'Alibaba\'s 7B parameter Qwen model',
    config: { n_gpu_layers: 32, n_threads: 4, n_batch: 512, n_context: 8192 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01')
  },
  {
    id: 'deepseek-7b',
    name: 'DeepSeek 7B',
    description: 'DeepSeek\'s 7B parameter model',
    config: { n_gpu_layers: 32, n_threads: 4, n_batch: 512, n_context: 4096 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-04-05')
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    description: 'Mistral AI\'s mixture of experts model',
    config: { n_gpu_layers: 48, n_threads: 8, n_batch: 512, n_context: 32768 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-04-10'),
    updatedAt: new Date('2024-04-10')
  },
  {
    id: 'solar-10.7b',
    name: 'Solar 10.7B',
    description: 'Upstage\'s 10.7B parameter model',
    config: { n_gpu_layers: 40, n_threads: 4, n_batch: 512, n_context: 4096 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-04-15')
  },
  {
    id: 'nous-hermes',
    name: 'Nous Hermes',
    description: 'Nous Research\'s Hermes model',
    config: { n_gpu_layers: 32, n_threads: 4, n_batch: 512, n_context: 4096 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-04-20'),
    updatedAt: new Date('2024-04-20')
  },
  {
    id: 'neural-chat',
    name: 'Neural Chat',
    description: 'Intel\'s Neural Chat model',
    config: { n_gpu_layers: 32, n_threads: 4, n_batch: 512, n_context: 4096 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-04-25'),
    updatedAt: new Date('2024-04-25')
  },
  {
    id: 'starling-lm',
    name: 'Starling LM',
    description: 'Berkeley\'s Starling language model',
    config: { n_gpu_layers: 32, n_threads: 4, n_batch: 512, n_context: 4096 },
    isCloud: false,
    promptIDs: [],
    createdAt: new Date('2024-04-30'),
    updatedAt: new Date('2024-04-30')
  }
];

/**
 * Home page
 * Should handle model selection,
 * menu on the side with a + button to add a new model, and below the list of existing models
 * top is a two state
 *     - No model / Add model -> logo and novasteron in the middle center
 *     - Model selected -> model name in the middle, unload button, settings <button className="
 *   (Maybe the top later can be moved to electron header)
 *
 * center is the page that change according the the model
 *
 * @returns
 *
 */

export const Home = () => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>(TEST_MODELS);

  useLayoutEffect(() => {
    // remove the splash screen after dom load
    if (window.splashScreen) {
      console.log('Splash screen found');
      window.splashScreen.appReady();
    }
  }, []);

  const handleModelClick = (model: Model) => {
    setSelectedModel(model.id);
  };

  const handleAddModelClick = () => {
    setSelectedModel(null);
  };

  const handleEjectModelClick = () => {
    setSelectedModel(null);
  };

  const handleConfigureModelClick = () => {
    setSelectedModel(null);
  };

  return (
    <Base
      header={selectedModel ? (
        <HeaderModel
          modelName={selectedModel}
          onEject={handleEjectModelClick}
          onConfigure={handleConfigureModelClick}
        />
      ) : (
        <HeaderNovastera />
      )}
      sideBar={<NavigationModel
          selectedModel={selectedModel}
          models={models}
          onModelClick={handleModelClick}
          onAddModelClick={handleAddModelClick}
        />
      }
    >
      <Outlet />
    </Base>
  );
};
