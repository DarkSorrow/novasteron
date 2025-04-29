import { useFormContext, Controller } from 'react-hook-form';
import { Box, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useTranslation } from "react-i18next";
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

interface FieldImageProps {
  name: string;
  label?: string;
  size?: number;
  defaultValue?: string;
  onChange?: (url: string) => void;
}

export const FieldImage = ({
  name,
  label,
  size = 200,
  defaultValue = '',
  onChange,
  ...otherProps
}: FieldImageProps) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setTempUrl(watch(name) || '');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    setValue(name, tempUrl);
    if (onChange) {
      onChange(tempUrl);
    }
    handleCloseModal();
  };

  const handleDelete = () => {
    setValue(name, '');
    if (onChange) {
      onChange('');
    }
    handleCloseModal();
  };

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <>
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
            onClick={handleOpenModal}
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

          <Dialog
            open={isModalOpen}
            onClose={handleCloseModal}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>{label || t('manageImage')}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {tempUrl ? (
                  <>
                    <Box
                      component="img"
                      src={tempUrl}
                      alt={label || t('previewImage')}
                      sx={{
                        width: '100%',
                        maxHeight: 300,
                        objectFit: 'contain',
                        borderRadius: 1,
                      }}
                    />
                    <TextField
                      fullWidth
                      label={t('imageUrl')}
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                      error={!!errors[name]}
                      helperText={errors[name]?.message as string}
                      placeholder="https://example.com/image.jpg"
                    />
                  </>
                ) : (
                  <TextField
                    fullWidth
                    label={t('imageUrl')}
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    error={!!errors[name]}
                    helperText={errors[name]?.message as string}
                    placeholder="https://example.com/image.jpg"
                  />
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              {tempUrl && (
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  color="error"
                >
                  {t('delete')}
                </Button>
              )}
              <Button onClick={handleCloseModal}>
                {t('cancel')}
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={!tempUrl}
              >
                {t('save')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    />
  );
};
