import Box from "@mui/material/Box";


interface BaseProps {
  sideBar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

export const Base = ({ sideBar, header, children }: BaseProps) => {
  return (
    <Box sx={{ display: 'flex' }}>
      {sideBar}
      {header}
      {children}
    </Box>
  );
}
