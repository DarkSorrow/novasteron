import { Stack, Typography, Box } from '@mui/material';

interface FormModelProps {
  title: string;
  name: React.ReactNode;
  description: React.ReactNode;
  imageURI: React.ReactNode;
  modelSelection: React.ReactNode;
  loraSelection?: React.ReactNode;
  config: React.ReactNode;
  onSubmit: () => void;
  submitButton: React.ReactNode;
}

export const FormModel = ({
  title,
  name,
  description,
  imageURI,
  modelSelection,
  loraSelection,
  config,
  onSubmit,
  submitButton
}: FormModelProps) => {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      <Stack direction="column" spacing={3}>
        {/* Image and Basic Info Section */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {imageURI}
          </Box>
          <Stack direction="column" spacing={2} flex={1}>
            {name}
            {description}
          </Stack>
        </Stack>

        {config}

        {/* Model and Lora Selection Section */}
        <Stack direction="column" spacing={2}>
          {modelSelection}
          {loraSelection}
        </Stack>

        {config}

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {submitButton}
        </Box>
      </Stack>
    </Box>
  );
};
