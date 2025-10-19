// src/pages/VideoPageWeb.tsx
import  { useMemo } from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { useLocation, useNavigate } from 'react-router-dom';

const ORANGE = '#F97316';
const SLATE = '#0f172a';

/** Из любой vimeo-ссылки достаём id и собираем корректный player URL */
function toVimeoPlayerUrl(input?: string | null) {
  if (!input) return null;
  if (/player\.vimeo\.com\/video\/\d+/.test(input)) return input;             // уже player URL
  const m1 = input.match(/vimeo\.com\/(?:video\/)?(\d+)/);                     // обычная ссылка
  if (m1) return `https://player.vimeo.com/video/${m1[1]}?autoplay=0&playsinline=1&title=0&byline=0&portrait=0`;
  if (/^\d+$/.test(input))                                                     // чистый id
    return `https://player.vimeo.com/video/${input}?autoplay=0&playsinline=1&title=0&byline=0&portrait=0`;
  return input; // на крайний случай — отдадим как есть
}

/** Обёртка с фиксированным соотношением 16:9 */
function VimeoPlayer({ src }: { src: string | null }) {
  if (!src) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          bgcolor: '#0b0b0b',
          color: '#94a3b8',
          aspectRatio: '16 / 9',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Typography>Видео недоступно</Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        aspectRatio: '16 / 9',
        bgcolor: 'black',
      }}
    >
      <iframe
        src={src}
        title="Vimeo player"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </Box>
  );
}

export default function VideoPageWeb() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: any };

  // Принимаем данные из state, либо соберём из query/params при необходимости
  const courseItem = state ?? {};
  console.log('CCC', courseItem)
  function cleanUndefinedLine(str?: string): string {
    if (!str) return '';
    return str
      .replace(/^undefined\s*[—-]?\s*/i, '') // убирает "undefined — " в начале
      .trim();
  }
  const pageTitle: string =
  cleanUndefinedLine(courseItem?.name) || courseItem?.courseName || 'Видео';

  const pageDescription: string =
    courseItem?.description ||
    courseItem?.about ||
    'Описание появится скоро.';

  const playerSrc = useMemo(() => {
    const fromState =
      courseItem?.videoId ||
      courseItem?.videoUrl ||
      courseItem?.video ||
      courseItem?.url;
    // fallback demo id можно убрать
    return toVimeoPlayerUrl(fromState) ?? toVimeoPlayerUrl('76979871');
  }, [courseItem]);

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh' }}>
      <Container
        maxWidth={false}
        disableGutters
        sx={{ px: { xs: 2, sm: 3 }, py: 2 }}
      >
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
          {/* Локальный header, как в RN */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                boxShadow: 1,
                '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
              }}
            >
              <ArrowBackIosNewRoundedIcon sx={{ color: ORANGE }} />
            </IconButton>
            <Box sx={{ width: 40, height: 40 }} /> {/* заполнитель справа */}
          </Stack>

          {/* Заголовок */}
          <Typography
            sx={{
              fontWeight: 900,
              textAlign: 'center',
              fontSize: { xs: 22, md: 26 },
              color: SLATE,
              mb: 1,
            }}
          >
            {pageTitle}
          </Typography>

          {/* Vimeo player 16:9 */}
          <VimeoPlayer src={playerSrc} />

          {/* (Опционально) место под переключатели */}
          <Box sx={{ mt: 1 }} />

          {/* Описание */}
          <Typography
            sx={{
              mt: 2,
              color: '#334155',
              fontWeight: 600,
              fontSize: { xs: 14, md: 15 },
            }}
          >
            {pageDescription}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
