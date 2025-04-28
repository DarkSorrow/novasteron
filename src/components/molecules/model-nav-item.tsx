import SmartToyIcon from '@mui/icons-material/SmartToy';
import { styled } from '@mui/material/styles';
import { ButtonModel } from '../atoms/button-model';

interface ModelNavItemProps {
  imageUrl?: string;
  name: string;
  onClick: () => void;
  isActive: boolean;
  position?: 'left' | 'right';
}

const ButtonImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const ModelNavItem = ({ imageUrl, name, onClick, isActive, position }: ModelNavItemProps) => {
  return (
    <ButtonModel name={name} onClick={onClick} isActive={isActive} position={position}>
      {imageUrl ? (
        <ButtonImage src={imageUrl} alt="Model" />
      ) : (
        <SmartToyIcon sx={{ fontSize: 24 }} />
      )}
    </ButtonModel>
  );
};
