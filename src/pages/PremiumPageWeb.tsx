// src/pages/PremiumPageWeb.tsx
import {
  Box,
  Container,
  Stack,
  Typography,
  IconButton,
  Paper,
  Button,
  Chip,
} from '@mui/material';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useNavigate } from 'react-router-dom';

const EMERALD = '#10B981';
const EMERALD_BG = '#10B9811A';
const SLATE = '#0f172a';

export default function PremiumPageWeb() {
  const navigate = useNavigate();

  const handleSubscribe = () => alert('Оформление Premium');
  const handleBuyPass   = () => alert('Покупка Dance Pass');

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh' }}>
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ bgcolor: 'rgba(255,255,255,0.9)', boxShadow: 1, '&:hover': { bgcolor: '#fff' } }}
            >
              <ArrowBackIosNewRoundedIcon />
            </IconButton>
            <Stack direction="row" alignItems="center" spacing={1}>
              <DiamondRoundedIcon sx={{ color: EMERALD }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: SLATE }}>
                Премиум
              </Typography>
            </Stack>
          </Stack>

          {/* Hero */}
          <Paper elevation={0} sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, bgcolor: '#fff', mb: 2.5 }}>
            <Stack spacing={1}>
              <Chip
                label="Открой весь контент"
                size="small"
                icon={<AutoAwesomeRoundedIcon />}
                sx={{ alignSelf: 'flex-start', bgcolor: EMERALD_BG, color: EMERALD, fontWeight: 700 }}
              />
              <Typography sx={{ fontWeight: 900, fontSize: { xs: 22, md: 28 }, lineHeight: 1.15, color: SLATE }}>
                Учись быстрее и глубже с премиум-доступом
              </Typography>
              <Typography sx={{ color: '#334155', maxWidth: 760 }}>
                Премиум снимает ограничения: полный доступ к курсам и хореографиям, офлайн-доступ,
                эксклюзивные подборки и персональные рекомендации. Никакой рекламы — только танец.
              </Typography>
              <Typography sx={{ mt: 1.5, color: '#0B0616', fontWeight: 700, maxWidth: 760 }}>
                Выберите курс целиком (dance pass), если хотите владеть программой навсегда.
                Или подключите месячный доступ, чтобы открыть все курсы сразу и экспериментировать без ограничений.
              </Typography>
            </Stack>
          </Paper>

          {/* Сравнение — без MUI Grid, чтобы ничего не «выпирало» */}
          <Paper elevation={0} sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, bgcolor: '#FFFFFF' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,                 // безопасный gap, без отрицательных маргинов
              }}
            >
              {/* Dance Pass */}
              <Paper elevation={0} sx={{ borderRadius: 3, p: 2, border: '1px solid #E5E9EF' }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Inventory2RoundedIcon sx={{ color: SLATE }} />
                    <Typography sx={{ fontWeight: 900, color: SLATE }}>Dance Pass — ₸4 990</Typography>
                  </Stack>
                  <Stack spacing={0.75} sx={{ color: '#334155' }}>
                    <Bullet text="Курс остаётся у вас навсегда" />
                    <Bullet text="Доступны все уроки выбранного курса" />
                  </Stack>
                  <Button
                    variant="outlined"
                    onClick={handleBuyPass}
                    sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 999, mt: 0.5 }}
                  >
                    Купить Dance Pass
                  </Button>
                </Stack>
              </Paper>

              {/* Premium */}
              <Paper elevation={0} sx={{ borderRadius: 3, p: 2, border: '1px solid #E5E9EF' }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DiamondRoundedIcon sx={{ color: EMERALD }} />
                    <Typography sx={{ fontWeight: 900, color: SLATE }}>Premium — ₸8 900 / мес.</Typography>
                  </Stack>
                  <Stack spacing={0.75} sx={{ color: '#334155' }}>
                    <Bullet text="Доступ на любой курс и хореографию без ограничений" />
                    <Bullet text="Сертификаты о завершении курса" />
                  </Stack>
                  <Button
                    variant="contained"
                    onClick={handleSubscribe}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      borderRadius: 999,
                      bgcolor: EMERALD,
                      '&:hover': { bgcolor: '#059669' },
                      mt: 0.5,
                    }}
                  >
                    Оформить Premium
                  </Button>
                </Stack>
              </Paper>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

/* мини-компонент */
function Bullet({ text }: { text: string }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="flex-start">
      <CheckRoundedIcon sx={{ fontSize: 18, color: EMERALD, mt: '2px' }} />
      <Typography sx={{ fontSize: 14 }}>{text}</Typography>
    </Stack>
  );
}
