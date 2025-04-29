import React, { useEffect } from 'react';
import { useLayoutEffect, useState, MouseEvent } from 'react';
import { Base } from '../templates/base';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { HeaderNovastera } from '../molecules/header-novastera';
import { HeaderModel } from '../molecules/header-model';
import { NavigationModel } from '../organisms/navigation-model';
import { Model } from '../../types/schema';
import { useAuth } from '../../providers/auth';
import { Loading } from '../molecules/loading';
//import {electronLlmRpc} from "../../electron/rpc/llmRpc.ts";
import { llmState } from '../../state/llmState';
import { useExternalState } from '../../hooks/useExternalState';

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
/*
reset the chat
<button
          className="resetChatButton"
          disabled={onResetChatClick == null}
          onClick={onResetChatClick}
        >
          <DeleteIconSVG className="icon" />
        </button>
*/
export const Home = () => {
  const { database, selectedModel, loadModel } = useAuth();

  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: models = [], isLoading: modelsLoading, error: modelsError } = useQuery<Model[]>({
    queryKey: ['models'],
    queryFn: () => database.getModels(),
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

  if (modelsLoading) {
    return <Loading />;
  }

  if (modelsError) {
    console.error('Error loading models:', modelsError);
    return <div>Error loading models: {modelsError.message}</div>;
  }
  console.log('selectedModel', selectedModel);
  const handleModelClick = async (event: MouseEvent<HTMLButtonElement>) => {
    if (event.currentTarget.dataset && event.currentTarget.dataset['id']) {
      const modelId = event.currentTarget.dataset['id'];
      if (modelId !== selectedModel?.id) {
        const model = models.find(model => model.id === modelId);
        if (model) {
          try {
            setModelLoading(true);
            await loadModel(model);
          } catch (error) {
            console.error('Error loading model:', error);
          } finally {
            setModelLoading(false);
          }
        }
        navigate('/');
      }
    }
  };

  const handleAddModelClick = () => {
    navigate('/model/new');
  };

  const handleEjectModelClick = () => {
    navigate('/');
  };

  const handleConfigureModelClick = () => {
    if (selectedModel) {
      navigate(`/model/${selectedModel.id}`);
    }
  };

  return (
    <Base
      header={selectedModel ? (
        <HeaderModel
          modelName={selectedModel.name}
          onEject={handleEjectModelClick}
          onConfigure={handleConfigureModelClick}
        />
      ) : (
        <HeaderNovastera />
      )}
      sideBar={
        <NavigationModel
          selectedModel={selectedModel}
          models={models}
          onModelClick={handleModelClick}
          onAddModelClick={handleAddModelClick}
        />
      }
    >
      {modelLoading ? <Loading /> : <Outlet />}
    </Base>
  );
};
