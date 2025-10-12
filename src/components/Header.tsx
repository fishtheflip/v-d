import { AppBar, Box, IconButton, Toolbar, Typography, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAppStore } from '../store/useAppStore';

export default function Header() {
  const { themeMode, toggleTheme, reset } = useAppStore();

  return (
    <AppBar position="sticky" color="primary" elevation={0}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>
          Vite + React + MUI + Zustand
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Toggle theme">
            <IconButton color="inherit" onClick={toggleTheme} size="small">
              {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset demo state">
            <IconButton color="inherit" onClick={reset} size="small">
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
