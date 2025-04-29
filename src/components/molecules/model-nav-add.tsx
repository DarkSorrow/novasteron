import { MouseEvent } from 'react';
import { ButtonModel } from '../atoms/button-model';
import AddIcon from '@mui/icons-material/Add';

interface ModelNavAddProps {
  name: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  isActive: boolean;
  position?: 'left' | 'right';
}

export const ModelNavAdd = ({ name, onClick, isActive, position }: ModelNavAddProps) => {
  return (
    <ButtonModel name={name} onClick={onClick} isActive={isActive} position={position} modelID="new">
      <AddIcon sx={{ fontSize: 24 }} />
    </ButtonModel>
  );
};
