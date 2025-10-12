import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Snackbar,
  Alert as MUIAlert,
  CircularProgress,
} from '@mui/material';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { useNavigate } from 'react-router-dom';

type Certificate = {
  id: string;
  title?: string;
  courseName?: string;
  dateIssued?: string;
  hours?: number;
  instructor?: string;
  serial?: string;
  previewUrl?: string;
  fileUrl?: string;
  userId?: string;
};

export default function CertificatesPageWeb() {
  const navigate = useNavigate();
  const [items] = useState<Certificate[]>([]);
  const [loading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity?: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [error, setError] = useState<string | null>(null);

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh' }}>
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
          {/* Заголовок с кнопкой "назад" */}
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
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
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Сертификаты
            </Typography>
          </Stack>

          {/* Ошибка */}
          {error && (
            <MUIAlert
              severity="error"
              variant="filled"
              sx={{ mb: 2, borderRadius: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </MUIAlert>
          )}

          {/* Лоадер */}
          {loading && (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
              <CircularProgress />
              <Typography sx={{ mt: 1.5, color: 'text.secondary' }}>Загружаем…</Typography>
            </Stack>
          )}

          {/* Пусто */}
          {!loading && !items.length && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                textAlign: 'center',
                bgcolor: '#fff',
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 22, sm: 24 },
                  fontWeight: 800,
                  color: '#1f2937',
                  mb: 1,
                }}
              >
                У вас пока нет сертификатов об окончании
              </Typography>
              <Typography
                sx={{
                  color: '#334155',
                  maxWidth: 640,
                  mx: 'auto',
                  fontSize: { xs: 15, sm: 16 },
                }}
              >
                Если вы прошли курс и хотите получить сертификат, обратитесь в поддержку 🙈
              </Typography>
            </Paper>
          )}

          {/* Список сертификатов — flex grid вместо MUI Grid */}
          {!loading && !!items.length && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                m: { xs: -1, md: -1.5 }, // имитация spacing: xs=2 (16px), md=3 (24px)
              }}
            >
              {items.map((c) => {
                const title = c.title || 'Сертификат об окончании';
                const subtitle = c.courseName
                  ? `${c.courseName}${c.instructor ? ` • ${c.instructor}` : ''}`
                  : c.instructor;
                const issued = c.dateIssued ? new Date(c.dateIssued).toLocaleDateString() : undefined;

                return (
                  <Box
                    key={c.id}
                    sx={{
                      width: { xs: '100%', sm: '50%', md: '33.333%' }, // xs=12, sm=6, md=4
                      p: { xs: 1, md: 1.5 },
                    }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        bgcolor: '#fff',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={
                          c.previewUrl ||
                          'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?q=80&w=1200&auto=format&fit=crop'
                        }
                        alt={title}
                        sx={{
                          width: '100%',
                          aspectRatio: '16 / 9',
                          objectFit: 'cover',
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                        }}
                      />
                      <CardContent sx={{ flex: 1 }}>
                        <Stack spacing={0.5}>
                          <Typography sx={{ fontWeight: 800, fontSize: 16 }}>{title}</Typography>
                          {subtitle && <Typography sx={{ color: '#334155', fontSize: 14 }}>{subtitle}</Typography>}
                          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                            {issued && <Chip size="small" label={`Выдан: ${issued}`} />}
                            {c.hours ? <Chip size="small" label={`${c.hours} ч`} /> : null}
                            {c.serial ? <Chip size="small" label={`№ ${c.serial}`} /> : null}
                          </Stack>
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={1}>
                          {c.fileUrl && (
                            <>
                              <Button
                                size="small"
                                component="a"
                                variant="contained"
                                href={c.fileUrl as string}
                                target="_blank"
                                rel="noreferrer"
                                startIcon={<OpenInNewRoundedIcon />}
                                sx={{
                                  textTransform: 'none',
                                  borderRadius: 999,
                                  bgcolor: '#F97316',
                                  '&:hover': { bgcolor: '#ea6a11' },
                                  fontWeight: 800,
                                }}
                              >
                                Открыть
                              </Button>
                              <Button
                                size="small"
                                component="a"
                                variant="outlined"
                                href={c.fileUrl as string}
                                download
                                startIcon={<FileDownloadRoundedIcon />}
                                sx={{ textTransform: 'none', borderRadius: 999, fontWeight: 700 }}
                              >
                                Скачать
                              </Button>
                            </>
                          )}
                        </Stack>
                      </CardActions>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Container>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MUIAlert
          elevation={6}
          variant="filled"
          severity={toast.severity || 'success'}
          onClose={() => setToast({ ...toast, open: false })}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </MUIAlert>
      </Snackbar>
    </Box>
  );
}
