import { Typography, IconButton, Stack, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import EjectIcon from '@mui/icons-material/Eject';
import { HeaderContainer } from '../atoms/header-container';
import { useTranslation } from 'react-i18next';
interface HeaderModelProps {
  modelName: string;
  onEject?: () => void;
  onConfigure?: () => void;
}

export const HeaderModel = ({ modelName, onEject, onConfigure }: HeaderModelProps) => {
  const { t } = useTranslation();

  return (
    <HeaderContainer>
      <Stack direction="row" spacing={2} alignItems="center">
        <Tooltip title={t('nav.ejectModel')}>
          <IconButton
            onClick={onEject}
            size="small"
            aria-label={t('nav.ejectModel')}
          >
            <EjectIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h6" fontWeight={600}>
          {modelName}
        </Typography>
        <Tooltip title={t('nav.configureModel')}>
          <IconButton
            onClick={onConfigure}
            size="small"
            aria-label={t('nav.configureModel')}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </HeaderContainer>
  );
};
