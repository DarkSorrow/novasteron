import { forwardRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import { Trans, useTranslation } from "react-i18next";
import { useTheme } from '@mui/material/styles';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

import { useAuth } from '../../providers/auth';

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const AppSnackbar = () => {
  const { i18n } = useTranslation();
  const { snackbar, setOpenSnackbar } = useAuth();
  const theme = useTheme();

  const handleClose = () => {
    setOpenSnackbar(false, snackbar.severity, '');
  }

  return (
    <Snackbar
      data-testid={`snackbar-${snackbar.severity}`}
      open={snackbar.open}
      anchorOrigin={{ vertical: 'bottom', horizontal: (i18n.dir() === 'rtl') ? "right" : "left" }}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={snackbar.severity}>
        <Trans i18nKey={snackbar.i18nMessage} values={snackbar.i18nObject} />
      </Alert>
    </Snackbar>
  );
};

export default AppSnackbar;
