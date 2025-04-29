import { useTranslation } from 'react-i18next';

import { App } from '../../App/App';
import { useAuth } from '../../providers/auth';
import { Loading } from '../molecules/loading';
import { HomeError } from '../organisms/home-error';
import { parseError } from '../../utils/function';
import { useEffect } from 'react';

export const HomeModel = () => {
  const { t } = useTranslation();
  const { isLoading, modelError, selectedModel } = useAuth();
  console.log({
    isLoading,
    modelError,
    selectedModel,
  });

  if (isLoading) {
    return <Loading message={t('model.loading')} />;
  }

  if (modelError) {
    return <HomeError message={t('error.Model')} details={parseError(modelError)} />;
  }
  return <App />;
};
