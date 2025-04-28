import { CircularProgress, Stack, Typography } from '@mui/material';

interface LoadingProps {
  message?: string;
}

export const Loading = ({ message }: LoadingProps) => {
  return (
    <Stack direction="column" spacing={2} justifyContent="center" alignItems="center" height="100%">
      <CircularProgress />
      {message && <Typography variant="h6" component="h2">{message}</Typography>}
    </Stack>
  );
};
