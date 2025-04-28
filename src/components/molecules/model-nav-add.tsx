import { ButtonModel } from '../atoms/button-model';
import AddIcon from '@mui/icons-material/Add';

interface ModelNavAddProps {
  name: string;
  onClick: () => void;
  isActive: boolean;
  position?: 'left' | 'right';
}

export const ModelNavAdd = ({ name, onClick, isActive, position }: ModelNavAddProps) => {
  return (
    <ButtonModel name={name} onClick={onClick} isActive={isActive} position={position}>
      <AddIcon sx={{ fontSize: 24 }} />
    </ButtonModel>
  );
};
