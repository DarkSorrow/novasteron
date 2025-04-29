import { Stack, Typography } from '@mui/material';

interface FormModelProps {
  name: React.ReactNode;
  description: React.ReactNode;
  imageURI: React.ReactNode;
  modelSelection: React.ReactNode;
  loraSelection: React.ReactNode;
  config: React.ReactNode;
}

export const FormModel = ({ name, description, imageURI, modelSelection, loraSelection, config }: FormModelProps) => {
  return <Stack direction="column" spacing={2}>
    <Stack direction="row" spacing={2}>
      {imageURI}
      <Stack direction="column" spacing={2}>
        <Typography variant="h6">{name}</Typography>
        <Typography variant="body1">{description}</Typography>
      </Stack>
    </Stack>
    {modelSelection}
    {loraSelection}
    {config}
  </Stack>;
};
