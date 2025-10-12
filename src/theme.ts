// src/theme/index.ts
import { createTheme } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark' = 'light') =>
  createTheme({
    palette: {
      mode,
      background: { default: '#F8FAFC' },
    },
    typography: {
      // Основной стек
      fontFamily: `"InterVariable", "ManropeVariable", system-ui, -apple-system, 
                   Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"`,
      h1: { fontWeight: 900, letterSpacing: '-0.02em' },
      h2: { fontWeight: 900, letterSpacing: '-0.02em' },
      h3: { fontWeight: 900, letterSpacing: '-0.02em' },
      h4: { fontWeight: 900, letterSpacing: '-0.01em' },
      h5: { fontWeight: 800 },
      button: { fontWeight: 800, textTransform: 'none' },
      body1: { fontWeight: 500 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 999 }, // круглые кнопки в проекте смотрятся лучше
        },
      },
    },
  });
