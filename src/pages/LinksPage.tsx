// src/pages/LinksPage.tsx
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Paper,
} from '@mui/material';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import TelegramIcon from '@mui/icons-material/Telegram';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import { Link as RouterLink } from 'react-router-dom';
import { useEffect } from 'react';
import logo from '../assets/vite-dance-logo.png'; // <-- добавь файл сюда

const ORANGE = '#E86635';

export default function LinksPage() {
  // SEO: заголовок и meta description
  useEffect(() => {
    document.title = 'Vite Dance — онлайн платформа по обучению танцев';
    const metaDesc =
      document.querySelector('meta[name="description"]') ||
      (() => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'description');
        document.head.appendChild(m);
        return m;
      })();
    metaDesc.setAttribute('content', 'Vite Dance — онлайн платформа по обучению танцев. Сайт, Telegram и ссылки на приложения iOS/Android.');
  }, []);

  return (
    <Box sx={{ bgcolor: '#0b1020', color: '#fff', minHeight: '100dvh' }}>
      {/* Top bar */}
      <AppBar
        elevation={0}
        sx={{
          position: 'fixed',
          backdropFilter: 'saturate(180%) blur(8px)',
          backgroundColor: 'rgba(10,12,20,0.6)',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Typography sx={{ fontWeight: 900, letterSpacing: 0.2 }}>Vite Dance</Typography>
          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/login" color="inherit">
              Войти
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              sx={{ bgcolor: ORANGE, '&:hover': { bgcolor: '#db5e2d' }, fontWeight: 800 }}
              variant="contained"
            >
              Регистрация
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero area */}
      <Box
        sx={{
          pt: { xs: 12, md: 14 },
          pb: { xs: 6, md: 8 },
          textAlign: 'center',
          position: 'relative',
          background:
            'radial-gradient(1200px 500px at 50% 0%, rgba(10,12,20,0.15), transparent 60%), linear-gradient(to bottom, rgba(5,7,12,0.75), rgba(5,7,12,0.75))',
        }}
      >
        <Container maxWidth="sm">
          {/* ЛОГО */}
          <Box
            component="img"
            src={logo}
            alt="Vite Dance — логотип"
            sx={{
              width: 96,
              height: 96,
              objectFit: 'cover',
              borderRadius: 2,
              boxShadow: '0 10px 24px rgba(0,0,0,0.3)',
              mb: 2.5,
              mx: 'auto',
              display: 'block',
            }}
          />

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.015em',
              mb: 1,
              fontSize: { xs: 32, md: 44 },
            }}
          >
            Vite Dance
          </Typography>

          {/* КРАТКОЕ ОПИСАНИЕ */}
          <Typography sx={{ opacity: 0.92, mb: 3 }}>
            Онлайн платформа по обучению танцев
          </Typography>

          {/* Карточка со ссылками */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <Stack spacing={1.2}>
              <Button
                fullWidth
                size="large"
                startIcon={<LanguageRoundedIcon />}
                href="https://vite.dance"
                target="_blank"
                rel="noopener"
                variant="contained"
                sx={{
                  py: 1.2,
                  bgcolor: ORANGE,
                  color: '#fff',
                  fontWeight: 900,
                  '&:hover': { bgcolor: '#db5e2d' },
                }}
              >
                Сайт
              </Button>



              <Button
                fullWidth
                size="large"
                startIcon={<AppleIcon />}
                href="https://apps.apple.com/app/idYOUR_APP_ID"
                target="_blank"
                rel="noopener"
                variant="outlined"
                sx={{
                  py: 1.2,
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: '#fff',
                  fontWeight: 800,
                  '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.06)' },
                }}
              >
                iOS App
              </Button>

              {/* <Button
                fullWidth
                size="large"
                startIcon={<AndroidIcon />}
                href="https://play.google.com/store/apps/details?id=com.vitedance"
                target="_blank"
                rel="noopener"
                variant="outlined"
                sx={{
                  py: 1.2,
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: '#fff',
                  fontWeight: 800,
                  '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.06)' },
                }}
              >
                Android App
              </Button> */}
              <Button
                fullWidth
                size="large"
                startIcon={<TelegramIcon />}
                href="https://t.me/vitedance"
                target="_blank"
                rel="noopener"
                variant="outlined"
                sx={{
                  py: 1.2,
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: '#fff',
                  fontWeight: 800,
                  '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.06)' },
                }}
              >
                Telegram
              </Button>
            </Stack>
          </Paper>

          <Typography sx={{ mt: 2, opacity: 0.7, fontSize: 12 }}>
            *Приложение для андроид находится в разработке.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
