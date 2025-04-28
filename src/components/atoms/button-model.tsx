import { ButtonBase } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { styled } from '@mui/material/styles';

interface ButtonModelProps {
  imageUrl?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const StyledButton = styled(ButtonBase)(({ theme }) => ({
  minWidth: '48px',
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
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderRadius: 'inherit',
});

const ButtonImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const ButtonModel = ({ imageUrl, onClick, isActive = false }: ButtonModelProps) => {
  const ButtonComponent = isActive ? ActiveButton : StyledButton;

  return (
    <ButtonComponent onClick={onClick}>
      <ButtonContent>
        {imageUrl ? (
          <ButtonImage src={imageUrl} alt="Model" />
        ) : (
          <SmartToyIcon sx={{ fontSize: 24 }} />
        )}
      </ButtonContent>
    </ButtonComponent>
  );
};
