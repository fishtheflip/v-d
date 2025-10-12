import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  IconButton,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useNavigate } from 'react-router-dom';

const SUPPORT_URL = 'https://t.me/vitedanceapp';

export default function SupportPageWeb() {
  const navigate = useNavigate();

  const openSupport = () => {
    try {
      window.open(SUPPORT_URL, '_blank', 'noopener,noreferrer');
    } catch {
      // на всякий случай — если popup заблокирован
      window.location.href = SUPPORT_URL;
    }
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh' }}>
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto' }}>
          {/* Шапка страницы (локальная) */}
          <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                boxShadow: 1,
                '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
              }}
            >
              <ArrowBackIosNewRoundedIcon />
            </IconButton>
            <Typography
              sx={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 16, color: '#0f172a' }}
            >
              Поддержка
            </Typography>
            {/* плейсхолдер для выравнивания заголовка по центру */}
            <Box sx={{ width: 40, height: 40 }} />
          </Stack>

          {/* Титул и описание */}
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 800,
              textAlign: 'center',
              color: '#0A0615',
              mb: 2.5,
            }}
          >
            Возникли проблемы?
          </Typography>

          <Typography
            sx={{
              fontSize: 15.5,
              color: '#0B0616',
              textAlign: 'center',
              maxWidth: 680,
              mx: 'auto',
            }}
          >
            Если у вас что-то не работает, нашли баг или не открывается курс — напишите нам.
            Опишите, что произошло, и приложите скриншоты/видео — так мы быстрее найдём причину
            и вернём вам нормальную работу приложения 🤖
          </Typography>

          {/* Карточка с пунктом «Чат поддержки» */}
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              overflow: 'hidden',
            }}
          >
            <ListItemButton onClick={openSupport} sx={{ py: 2 }}>
              <ListItemText
                primary="Чат поддержки"
                primaryTypographyProps={{ sx: { fontSize: 16, fontWeight: 700, color: '#0a0a0a' } }}
              />
              <ChevronRightRoundedIcon sx={{ color: '#A9B2BA' }} />
            </ListItemButton>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
