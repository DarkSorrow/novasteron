import { Stack, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
interface HomeErrorProps {
  message: string;
  details?: string | null;
}

export const HomeError = ({ message, details }: HomeErrorProps) => {
  return (
    <Stack direction="column" spacing={2} justifyContent="center" alignItems="center" height="100%">
      <ErrorOutlineIcon sx={{ fontSize: '48px' }} />
      <Typography variant="h6" component="h2">{message}</Typography>
      {details && <Typography variant="body1" component="p">{details}</Typography>}
    </Stack>
  );
};
