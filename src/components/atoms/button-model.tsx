import { ButtonBase, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

import { useAuth } from '../../providers/auth';

export interface ButtonModelProps {
  onClick?: () => void;
  isActive?: boolean;
  name?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

const StyledButton = styled(ButtonBase)(({ theme }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.primary.main,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: '16px',
  },
  '&.MuiButtonBase-root': {
    minWidth: '48px',
  },
}));

const ActiveButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: '16px',
}));

const ButtonContent = styled('div')({
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderRadius: 'inherit',
});

export const ButtonModel = ({ onClick, isActive = false, name, children, position }: ButtonModelProps) => {
  const { langDir } = useAuth();
  const ButtonComponent = isActive ? ActiveButton : StyledButton;

  return (
    <Tooltip
      title={name || ''}
      placement={position}
      arrow
    >
      <ButtonComponent onClick={onClick}>
        <ButtonContent>
          {children}
        </ButtonContent>
      </ButtonComponent>
    </Tooltip>
  );
};
