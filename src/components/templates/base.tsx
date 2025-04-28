import { Box, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface BaseProps {
  sideBar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

const LayoutContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100vw',
  backgroundColor: theme.palette.background.paper,
}));

const HeaderWrapper = styled(Box)({
  width: '100%',
  height: '48px', // Standard header height
});

const MainContent = styled(Box)({
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
});

const SidebarWrapper = styled(Box)({
  width: '68px', // Reduced width for sidebar
  height: '100%',
  position: 'relative',
  zIndex: 1,
});

export const Base = ({ sideBar, header, children }: BaseProps) => {
  const theme = useTheme();

  return (
    <LayoutContainer>
      <HeaderWrapper>
        {header}
      </HeaderWrapper>
      <MainContent>
        <SidebarWrapper>
          {sideBar}
        </SidebarWrapper>
        <Box style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: theme.palette.background.default,
          borderTop: `1px solid ${theme.palette.subtleDivider}`,
          borderLeft: theme.direction === 'ltr' ? `1px solid ${theme.palette.subtleDivider}` : 'none',
          borderRight: theme.direction === 'rtl' ? `1px solid ${theme.palette.subtleDivider}` : 'none',
          borderTopLeftRadius: theme.direction === 'ltr' ? '24px' : 0,
          borderTopRightRadius: theme.direction === 'rtl' ? '24px' : 0,
          marginLeft: theme.direction === 'ltr' ? '-1px' : 0,
          marginRight: theme.direction === 'rtl' ? '-1px' : 0,
        }}>
          {children}
        </Box>
      </MainContent>
    </LayoutContainer>
  );
};
