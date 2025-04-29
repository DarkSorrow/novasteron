import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, styled } from '@mui/material';

import { Model } from "../../types/schema";
import { ModelNavAdd } from '../molecules/model-nav-add';
import { ModelNavItem } from '../molecules/model-nav-item';
import { USER_PROFILE_HEIGHT } from '../../utils/constants';
import { useAuth } from '../../providers/auth';

interface NavigationModelProps {
  selectedModel: Model | null;
  models: Model[];
  onModelClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onAddModelClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

const NavigationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '64px',
  backgroundColor: theme.palette.background.paper,
}));

const ModelsList = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  padding: '8px 0',
  overflowY: 'auto',
  overflowX: 'hidden',
  // Hide scrollbar for Chrome, Safari and Opera
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  // Hide scrollbar for IE, Edge and Firefox
  msOverflowStyle: 'none',  // IE and Edge
  scrollbarWidth: 'none',  // Firefox
});

const Divider = styled(Box)(({ theme }) => ({
  width: '42px',
  height: '1px',
  backgroundColor: theme.palette.divider,
  opacity: 0.5,
  margin: '8px auto',
}));

const ProfileSection = styled(Box)({
  height: USER_PROFILE_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'red',
});

const FixedSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '8px 0',
});

export const NavigationModel = ({
  selectedModel,
  models,
  onModelClick,
  onAddModelClick
}: NavigationModelProps) => {
  const { t } = useTranslation();
  const { langDir } = useAuth();
  const position = langDir === 'rtl' ? 'left' : 'right';
  return (
    <NavigationContainer>
      <FixedSection>
        <ModelNavAdd
          name={t('nav.addModel')}
          onClick={onAddModelClick}
          isActive={selectedModel === null}
          position={position}
        />
        <Divider />
      </FixedSection>
      <ModelsList>
        {models.map((model) => model.id && (
          <ModelNavItem
            key={model.id}
            isActive={selectedModel?.id === model.id}
            name={model.name}
            imageUrl={model.imageURI}
            position={position}
            onClick={onModelClick}
            modelID={model.id}
          />
        ))}
      </ModelsList>
      <ProfileSection>
        {/* Profile component will be added later */}
      </ProfileSection>
    </NavigationContainer>
  );
};
