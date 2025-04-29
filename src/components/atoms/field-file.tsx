import { useFormContext, Controller } from 'react-hook-form';
import { Button } from '@mui/material';
import { useTranslation } from "react-i18next";
import { useFileDialog } from '../../hooks/useFileDialog';
import { FileDialogOptions } from '../../types/default';

interface FieldFileProps {
  name: string;
  label?: string;
  defaultValue?: string;
  onChange?: (filePath: string) => void;
  fileFilters?: FileDialogOptions;
}

export const FieldFile = ({
  name,
  label,
  defaultValue = '',
  onChange,
  fileFilters,
  ...otherProps
}: FieldFileProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { t } = useTranslation();
  const openFileDialog = useFileDialog({
    accept: fileFilters?.accept || 'file/*',
    message: fileFilters?.message || t('file.message'),
    title: fileFilters?.title || t('file.title'),
    filters: fileFilters?.filters || [{ name: t('file.filter'), extensions: ['*'] }],
    buttonLabel: fileFilters?.buttonLabel || t('open'),
  });

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <Button
          variant="outlined"
          onClick={async () => {
            const filePath = await openFileDialog();
            if (filePath && typeof filePath === 'string') {
              field.onChange(filePath);
              if (onChange) {
                onChange(filePath);
              }
            }
          }}
          sx={{ width: '100%' }}
          {...otherProps}
        >
          {field.value ? field.value.split(/[\\/]/).pop() : label || t('selectFile')}
        </Button>
      )}
    />
  );
};
