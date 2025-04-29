import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FieldText } from '../atoms/field-text';
import { FieldFile } from '../atoms/field-file';
import { FieldImage } from '../atoms/field-image';
import { FormModel } from '../templates/form-model';
import { modelSchema, Model } from '../../types/schema';
import { getModels, addModel, updateModel } from '../../services/database';
import { Loading } from '../molecules/loading';
import { useAuth } from '../../providers/auth';
import { Button } from '@mui/material';

type FormData = Omit<Model, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncedAt'>;

export const HomeModelConfig = () => {
  const { setOpenSnackbar } = useAuth();
  const { modelId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

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

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (modelId && modelId !== 'new') {
        return updateModel(modelId, data);
      }
      return addModel(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      navigate('/');
    },
    onError: (error: any) => {
      setOpenSnackbar(true, 'error', t([`error.${error.message}`, "error.Unknown"]), {
        name: form.getValues('name')
      });
      console.error('Error saving model:', error);
    },
  });

  useEffect(() => {
    const loadModel = async () => {
      if (modelId && modelId !== 'new') {
        const models = await getModels();
        const model = models.find(m => m.id === modelId);
        if (model) {
          const { id, createdAt, updatedAt, lastSyncedAt, ...formData } = model;
          form.reset(formData);
        }
      }
      setIsLoading(false);
    };

    loadModel();
  }, [modelId]);

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
