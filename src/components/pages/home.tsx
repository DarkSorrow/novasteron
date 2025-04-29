import { useLayoutEffect, useState, MouseEvent } from 'react';
import { Base } from '../templates/base';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getModels } from '../../services/database';
import { HeaderNovastera } from '../molecules/header-novastera';
import { HeaderModel } from '../molecules/header-model';
import { NavigationModel } from '../organisms/navigation-model';
import { Model } from '../../types/schema';

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
  const navigate = useNavigate();

  const { data: models = [], isLoading, error } = useQuery({
    queryKey: ['models'],
    queryFn: getModels,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });

  useLayoutEffect(() => {
    // Signal that the app is ready to show once UI is fully loaded
    if (window.splashScreen?.appReady) {
      console.log('Splash screen found, signaling app ready');
      window.splashScreen.appReady();
    }
  }, []);

  if (error) {
    console.error('Error loading models:', error);
    // You might want to show an error UI here
  }

  const handleModelClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.currentTarget.dataset && event.currentTarget.dataset['id']) {
      const modelId = event.currentTarget.dataset['id'];
      console.log('model to load', modelId);
      setSelectedModel(modelId);
      navigate('/');
    }
  };

  const handleAddModelClick = () => {
    navigate('/model/new');
    setSelectedModel(null);
  };

  const handleEjectModelClick = () => {
    setSelectedModel(null);
    navigate('/');
  };

  const handleConfigureModelClick = () => {
    if (selectedModel) {
      navigate(`/model/${selectedModel}`);
    }
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
