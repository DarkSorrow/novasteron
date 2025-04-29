import { MouseEvent } from 'react';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { styled } from '@mui/material/styles';
import { ButtonModel } from '../atoms/button-model';

interface ModelNavItemProps {
  imageUrl?: string;
  name: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  isActive: boolean;
  position?: 'left' | 'right';
  modelID: string;
}

const ButtonImage = styled('img')({
  width: 42,
  height: 42,
  borderRadius: '16px',
  objectFit: 'cover',
});

export const ModelNavItem = ({ imageUrl, name, onClick, isActive, position, modelID }: ModelNavItemProps) => {
  return (
    <ButtonModel name={name} onClick={onClick} isActive={isActive} position={position} modelID={modelID}>
      {imageUrl ? (
        <ButtonImage src={imageUrl} alt="Model" />
      ) : (
        <SmartToyIcon sx={{ fontSize: 24 }} />
      )}
    </ButtonModel>
  );
};
