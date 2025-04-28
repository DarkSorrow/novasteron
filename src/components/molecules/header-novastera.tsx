import { Typography, styled } from '@mui/material';
import novasteraLogo from '../../../public/novastera.svg';
import { HeaderContainer } from '../atoms/header-container';

const Logo = styled('img')({
  height: '32px',
  width: 'auto',
});

export const HeaderNovastera = () => {
  return (
    <HeaderContainer>
      <Logo src={novasteraLogo} alt="Novastera" />
      <Typography variant="h6" component="h1" fontWeight={600}>
        Novasteron
      </Typography>
    </HeaderContainer>
  );
};
