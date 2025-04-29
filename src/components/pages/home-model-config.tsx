import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { FieldText } from '../atoms/field-text';
import { FieldFile } from '../atoms/field-file';
import { FieldImage } from '../atoms/field-image';
import { FormModel } from '../templates/form-model';
import { modelSchema, Model } from '../../types/schema';
import { useAuth } from '../../providers/auth';
import { Button } from '@mui/material';
import { Loading } from '../molecules/loading';

type FormData = Omit<Model, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncedAt'>;

export const HomeModelConfig = () => {
  const { database, setOpenSnackbar, loadModel } = useAuth();
  const { modelId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Fetch model data if we're editing
  const { data: existingModel, isLoading } = useQuery({
    queryKey: ['model', { id: modelId }],
    queryFn: async () => {
      const models = await database.getModels();
      return models.find(m => m.id === modelId) || null;
    },
    enabled: modelId !== 'new'
  });

  const form = useForm<FormData>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      name: '',
      description: '',
      isCloud: false,
      imageURI: '',
      modelURI: '',
      loraURI: '',
    },
  });

  // Set form values when existing model is loaded
  useEffect(() => {
    if (existingModel) {
      form.reset({
        name: existingModel.name,
        description: existingModel.description,
        isCloud: existingModel.isCloud,
        imageURI: existingModel.imageURI,
        modelURI: existingModel.modelURI,
        loraURI: existingModel.loraURI,
      });
    }
  }, [existingModel]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      try {
        if (modelId && modelId !== 'new') {
          await database.updateModel(modelId, data);
          return modelId;
        }
        const modelID = await database.addModel(data);
        await loadModel({...data, id: modelID});
        return modelID;
      } catch (error) {
        console.error('Error saving model:', error);
        throw error;
      }
    },
    onSuccess: (id) => {
      // Invalidate both the specific model and the models list
      queryClient.invalidateQueries({ queryKey: ['model', { id }] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
      navigate('/');
    },
    onError: (error: Error) => {
      console.error('Error saving model:', error);
      setOpenSnackbar(true, 'error', t([`error.${error.message}`, "error.Unknown"]));
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return <Loading />;
  }
  return (
    <FormProvider {...form}>
      <FormModel
        title={modelId === 'new' ? t('model.createModel') : t('model.editModel')}
        name={
          <FieldText
            name="name"
            label={t('model.name')}
            fullWidth
          />
        }
        description={
          <FieldText
            name="description"
            label={t('model.description')}
            multiline
            rows={4}
            fullWidth
          />
        }
        imageURI={
          <FieldImage
            name="imageURI"
            label={t('model.image')}
            size={150}
          />
        }
        modelSelection={
          <FieldFile
            name="modelURI"
            label={t('model.file')}
            fileFilters={{
              accept: '.gguf,.bin',
              message: t('model.select_message', { formats: '.gguf,.bin' }),
              title: t('model.select'),
              filters: [{ name: t('model.select'), extensions: ['gguf', 'bin'] }],
            }}
          />
        }
        loraSelection={
          <FieldFile
            name="loraURI"
            label={t('model.loraFile')}
            fileFilters={{
              accept: '*',
              title: t('model.selectLora'),
              filters: [{ name: t('model.selectLora'), extensions: ['*'] }],
            }}
          />
        }
        config={/*
          <AdvancedFields description={t('model.advancedSettingsDescription')}>
            <FieldText
              name="config.n_gpu_layers"
              label={t('model.gpuLayers')}
              type="number"
            />
            <FieldText
              name="config.n_threads"
              label={t('model.threads')}
              type="number"
            />
            <FieldText
              name="config.n_batch"
              label={t('model.batchSize')}
              type="number"
            />
            <FieldText
              name="config.n_context"
              label={t('model.contextSize')}
              type="number"
            />
          </AdvancedFields>
        */null}
        onSubmit={form.handleSubmit(onSubmit)}
        submitButton={
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={mutation.isPending}
            loading={mutation.isPending}
            sx={{ mt: 2, alignSelf: 'flex-start' }}
          >
            {mutation.isPending ? t('saving') : (modelId === 'new' ? t('create') : t('modify'))}
          </Button>
        }
      />
    </FormProvider>
  );
};
