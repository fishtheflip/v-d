import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  Button,
  Chip
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { useNavigate } from 'react-router-dom';

const ORANGE = '#F97316';

export default function NotFoundPageWeb() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh' }}>
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
        <Box sx={{ width: '100%', maxWidth: 960, mx: 'auto' }}>
          {/* Верхняя панель */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Button
              onClick={() => navigate(-1)}
              startIcon={<ArrowBackIosNewRoundedIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.9)',
                boxShadow: 1,
                '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
              }}
            >
              Назад
            </Button>
          </Stack>

          {/* Hero-карточка */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: { xs: 3, md: 4 },
              bgcolor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Chip
              label="Страница не найдена"
              sx={{
                alignSelf: 'flex-start',
                bgcolor: `${ORANGE}1A`,
                color: ORANGE,
                fontWeight: 800,
                borderRadius: '999px'
              }}
            />

            <Typography sx={{ fontWeight: 900, fontSize: { xs: 32, md: 44 }, lineHeight: 1.1 }}>
              404 — ууупс! Такой страницы нет
            </Typography>

            <Typography sx={{ color: '#334155', fontSize: { xs: 15, md: 16 } }}>
              Возможно, ссылка устарела или вы опечатались в адресе.
              Давайте вернёмся к танцам 💃🕺
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ pt: 1 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                startIcon={<HomeRoundedIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: '999px',
                  px: 2.25,
                  bgcolor: ORANGE,
                  '&:hover': { bgcolor: '#ea6a11' }
                }}
              >
                На главную
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                startIcon={<PlayCircleOutlineRoundedIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: '999px',
                  px: 2.25
                }}
              >
                К видео
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate('/notes')}
                startIcon={<EditNoteRoundedIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: '999px',
                  px: 2.25
                }}
              >
                К авторам
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
