import { useFormContext, Controller } from 'react-hook-form';
import { Button, Box, Paper } from '@mui/material';
import { useTranslation } from "react-i18next";
import ImageIcon from '@mui/icons-material/Image';
import { useFileDialog } from '../../hooks/useFileDialog';
import { FileDialogOptions } from '../../types/default';

interface FieldImageProps {
  name: string;
  label?: string;
  size?: number;
  defaultValue?: string;
  fileFilters?: FileDialogOptions;
  onChange?: (filePath: string) => void;
}
//"filters": [{ "name": "Image File", "extensions": ["png", "jpg", "jpeg", "webp", "gif", "svg"] }],
export const FieldImage = ({
  name,
  label,
  size = 200,
  defaultValue = '',
  onChange,
  fileFilters,
  ...otherProps
}: FieldImageProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { t } = useTranslation();
  const openFileDialog = useFileDialog({
    accept: fileFilters?.accept || 'image/*',
    message: fileFilters?.message || t('image.message'),
    title: fileFilters?.title || t('image.title'),
    filters: fileFilters?.filters || [{ name: t('image.filter'), extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'] }],
    buttonLabel: fileFilters?.buttonLabel || t('open'),
  });

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <Paper
          elevation={1}
          sx={{
            width: size,
            height: size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: 'background.default',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          onClick={async () => {
            const filePath = await openFileDialog();
            if (filePath && typeof filePath === 'string') {
              field.onChange(filePath);
              if (onChange) {
                onChange(filePath);
              }
            }
          }}
          {...otherProps}
        >
          {field.value ? (
            <Box
              component="img"
              src={field.value}
              alt={label || t('selectedImage')}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <ImageIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              <Box sx={{ color: 'text.secondary', textAlign: 'center' }}>
                {label || t('selectImage')}
              </Box>
            </Box>
          )}
        </Paper>
      )}
    />
  );
};
