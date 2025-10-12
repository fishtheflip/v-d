// src/App.tsx
import { CssBaseline, ThemeProvider, Box } from '@mui/material';
import { useMemo } from 'react';
import { useAppStore } from './store/useAppStore';
import { getTheme } from './theme';
import ProfilePageWeb from './pages/ProfilePage'

export default function App() {
  const themeMode = useAppStore((s) => s.themeMode);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', color: 'text.primary' }}>
        {/* <HomePageWeb /> */}
        <ProfilePageWeb/>
      </Box>
    </ThemeProvider>
  );
}
