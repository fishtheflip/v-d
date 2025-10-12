import { Outlet, NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container } from '@mui/material';
export default function RootLayout() {
  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Button color="inherit" component={NavLink} to="/">Home</Button>
          <Button color="inherit" component={NavLink} to="/catalog">Catalog</Button>
          <Button color="inherit" component={NavLink} to="/cart">Cart</Button>
          <Button color="inherit" component={NavLink} to="/account">Account</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </>
  );
}
