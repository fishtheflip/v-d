// src/pages/LandingPage.tsx
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Link as RouterLink } from 'react-router-dom';
import heroImg from '../assets/onboarding3.jpg';

const ORANGE = '#E86635';

export default function LandingPage() {
  return (
    <Box sx={{ bgcolor: '#0b1020', color: '#fff', minHeight: '100dvh' }}>
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

      <Box
        sx={{
          position: 'relative',
          height: { xs: 520, md: 640 },
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={heroImg}
          alt="hero"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'contrast(1.1) saturate(1.05)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(1200px 500px at 50% 0%, rgba(10,12,20,0.15), transparent 60%), linear-gradient(to bottom, rgba(5,7,12,0.75), rgba(5,7,12,0.75))',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.015em',
              mb: 1.5,
              fontSize: { xs: 36, md: 56 },
            }}
          >
            Vite Dance
          </Typography>
          <Typography sx={{ opacity: 0.92, maxWidth: 860, mx: 'auto', fontSize: 18 }}>
            Бесплатная платформа для танцев: сезоны, категории и 100+ уроков от топовых
            хореографов. Тренируйся где угодно.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="center"
            sx={{ mt: 3 }}
          >
            <Button
              component={RouterLink}
              to="/register"
              size="large"
              startIcon={<HowToRegRoundedIcon />}
              sx={{
                px: 3,
                py: 1.2,
                bgcolor: ORANGE,
                '&:hover': { bgcolor: '#db5e2d' },
                fontWeight: 900,
              }}
              variant="contained"
            >
              Начать бесплатно
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              size="large"
              startIcon={<PlayArrowRoundedIcon />}
              sx={{
                px: 3,
                py: 1.2,
                borderColor: 'rgba(255,255,255,0.4)',
                color: '#fff',
                fontWeight: 800,
                '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.06)' },
              }}
              variant="outlined"
            >
              Войти в аккаунт
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ height: 24 }} />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <IntroCard
          sx={{ mt: { xs: 6, md: 8 } }}
          title="Твой ритм. Твой танец."
          text="Откройте для себя разнообразие танцевальных направлений, совершенствуйтесь с лучшими хореографами и погружайтесь в мир танца с каждым новым сезоном."
          bullets={[
            'Профессиональные видео с хореографами',
            'Более 100 уроков',
            'Создай свой уникальный стиль',
          ]}
        />

        <IntroCard
          sx={{ mt: { xs: 4, md: 6 } }}
          caption="Сезоны"
          title="Гибкость и мобильность"
          text="Мы создали уникальную систему сезонов, где каждый преподаватель делится собственным стилем и энергией. Каждый сезон — это новое вдохновение и новые движения."
        />

        <IntroCard
          sx={{ mt: { xs: 4, md: 6 } }}
          caption="Категории"
          title="Ваш персональный путь"
          text="Развивайте свой уникальный стиль, укрепляйте уверенность и получайте удовольствие от каждого шага. Выбирайте из разных направлений — от Afro и K-Pop до Waacking."
        />

        {/* CTA — белая карточка */}
        <Paper
          elevation={6}
          sx={{
            mt: { xs: 6, md: 10 },
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            bgcolor: '#ffffff',
            color: '#0b1020',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
            Готов присоединиться?
          </Typography>
          <Typography sx={{ opacity: 0.9, mb: 2 }}>
            Создай аккаунт за минуту и получи доступ к первым занятиям.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
            <Button
              component={RouterLink}
              to="/register"
              size="large"
              sx={{
                px: 3,
                py: 1.2,
                bgcolor: ORANGE,
                '&:hover': { bgcolor: '#db5e2d' },
                fontWeight: 900,
                color: '#fff',
              }}
              variant="contained"
            >
              Регистрация
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              size="large"
              variant="outlined"
              sx={{
                px: 3,
                py: 1.2,
                borderColor: '#0b1020',
                color: '#0b1020',
                fontWeight: 800,
                '&:hover': { borderColor: '#0b1020', backgroundColor: 'rgba(11,16,32,0.06)' },
              }}
            >
              Войти
            </Button>
          </Stack>
        </Paper>
      </Container>

      {/* FOOTER */}
      <Divider sx={{ mt: { xs: 6, md: 10 }, borderColor: 'rgba(255,255,255,0.08)' }} />
    </Box>
  );
}

/* -------- sub components -------- */

function IntroCard({
  title,
  caption,
  text,
  bullets,
  img, // опционально
  sx,
}: {
  title: string;
  caption?: string;
  text: string;
  bullets?: string[];
  img?: string;
  sx?: any;
}) {
  const Content = (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        bgcolor: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        height: '100%',
        color: '#fff',
      }}
    >
      {caption && (
        <Typography sx={{ color: '#FFA377', fontWeight: 800, mb: 0.5 }}>
          {caption}
        </Typography>
      )}
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5, color: '#fff' }}>
        {title}
      </Typography>
      <Typography sx={{ color: '#fff', opacity: 0.92 }}>{text}</Typography>

      {bullets && (
        <Stack spacing={1.2} sx={{ mt: 2 }}>
          {bullets.map((b) => (
            <Stack key={b} direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.18)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 16, color: ORANGE }} />
              </Box>
              <Typography sx={{ color: '#fff' }}>{b}</Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Paper>
  );

  // Без картинки — просто контент
  if (!img) {
    return <Box sx={sx}>{Content}</Box>;
  }

  // С картинкой — двухколоночный layout на Box (аналог Grid container spacing={3})
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        m: -1.5, // имитация spacing={3} => отступы по 1.5 на item
        ...sx,
      }}
    >
      <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1.5 }}>{Content}</Box>
      <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1.5 }}>
        <Box
          component="img"
          src={img}
          alt=""
          sx={{
            width: '100%',
            height: { xs: 220, md: 360 },
            objectFit: 'cover',
            borderRadius: 4,
            display: 'block',
          }}
        />
      </Box>
    </Box>
  );
}
