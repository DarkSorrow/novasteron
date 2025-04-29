import { Stack, Typography, Button, Box } from '@mui/material';

interface FormModelProps {
  title: string;
  name: React.ReactNode;
  description: React.ReactNode;
  imageURI: React.ReactNode;
  modelSelection: React.ReactNode;
  loraSelection?: React.ReactNode;
  config: React.ReactNode;
  onSubmit: () => void;
  submitLabel: string;
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
  submitLabel
}: FormModelProps) => {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      <Stack direction="column" spacing={3}>
        {/* Image and Basic Info Section */}
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {imageURI}
          <Stack direction="column" spacing={2} flex={1}>
            {name}
            {description}
          </Stack>
        </Stack>

        {/* Model and Lora Selection Section */}
        <Stack direction="column" spacing={2}>
          {modelSelection}
          {loraSelection}
        </Stack>

        {/* Advanced Configuration Section */}
        {config}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2, alignSelf: 'flex-start' }}
        >
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  );
};
