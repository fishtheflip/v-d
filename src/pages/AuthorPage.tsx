// src/pages/AuthorPageWeb.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Typography, Stack, Button, Chip,
  Card, CardActionArea, CardMedia, CardContent,
  Avatar, Paper, Divider, IconButton, Snackbar, Alert as MUIAlert, Collapse,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

type AuthorDoc = { id?: string; simpId?: string; name: string; about?: string; imgurl?: string; };
type Course = { id: string; courseName: string; authorTitle?: string; seasonNum?: number; imgUrl?: string; simpId?: string; popPriority?: number; };
type Choreo = { id: string; name: string; Author?: string; authors?: string[]; imgUrl?: string; simpId?: string; };

function useAuthorFromRoute(): { author: AuthorDoc | null; loading: boolean; error: string | null } {
  const { authorSlug } = useParams<{ authorSlug?: string }>();
  const location = useLocation() as any;
  const stateAuthor: AuthorDoc | undefined = location?.state;

  const [author, setAuthor] = useState<AuthorDoc | null>(stateAuthor ?? null);
  const [loading, setLoading] = useState(!stateAuthor && !!authorSlug);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (stateAuthor || !authorSlug) return;
      try {
        setLoading(true);
        setError(null);
        const q1 = query(collection(db, 'authors'), where('simpId', '==', authorSlug));
        const s1 = await getDocs(q1);
        if (!cancelled && !s1.empty) {
          const d = s1.docs[0];
          setAuthor({ id: d.id, ...(d.data() as Omit<AuthorDoc, 'id'>) });
          return;
        }
        const ref = doc(db, 'authors', authorSlug);
        const snap = await getDoc(ref);
        if (!cancelled && snap.exists()) {
          setAuthor({ id: snap.id, ...(snap.data() as Omit<AuthorDoc, 'id'>) });
          return;
        }
        if (!cancelled) setError('Автор не найден');
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Не удалось загрузить автора');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authorSlug, stateAuthor]);

  return { author, loading, error };
}

const AuthorPageWeb: React.FC = () => {
  const navigate = useNavigate();
  const { author, loading: authorLoading, error: authorErr } = useAuthorFromRoute();

  const [courses, setCourses] = useState<Course[]>([]);
  const [choreos, setChoreos] = useState<Choreo[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!author?.name) return;
      try {
        setLoading(true);
        setError(null);
        const qCourses = query(collection(db, 'courses'), where('authorTitle', '==', author.name));
        const snapCourses = await getDocs(qCourses);
        const cs = snapCourses.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Course[];
        cs.sort((a, b) =>
          (Number(a.popPriority) || 0) - (Number(b.popPriority) || 0) ||
          (a.courseName || '').localeCompare(b.courseName || '')
        );
        if (!cancelled) setCourses(cs);

        const qCh = query(collection(db, 'choreos'), where('authors', 'array-contains', author.name));
        const snapCh = await getDocs(qCh);
        const ch = snapCh.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Choreo[];
        if (!cancelled) setChoreos(ch);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Не удалось загрузить курсы и хореографии автора.');
          setToastOpen(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [author?.name]);

  const title = useMemo(() => author?.name || 'Автор', [author?.name]);

  const openCourse = (c: Course) => navigate(`/course/${c.simpId || c.id}`, { state: c });
  const openChoreo = (ch: Choreo) =>
    navigate('/course', { state: { courseName: ch.name, imgUrl: ch.imgUrl, authorTitle: ch.Author, simpId: ch.simpId, from: 'choreo' } });

  const heroUrl = author?.imgurl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop';
  const isBusy = authorLoading || loading;

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh' }}>
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, md: 3 } }}>
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
          {/* ошибки */}
          <Collapse in={!!authorErr || !!error}>
            <MUIAlert
              severity="error"
              variant="filled"
              sx={{ mb: 2, borderRadius: 2 }}
              action={<Button color="inherit" size="small" onClick={() => window.location.reload()} disabled={isBusy}>Обновить</Button>}
            >
              {authorErr || error}
            </MUIAlert>
          </Collapse>

          {/* заголовок */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }, boxShadow: 1 }}>
              <ArrowBackIosNewRoundedIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>{title}</Typography>
            {author?.simpId && <Chip label={author.simpId} size="small" sx={{ ml: 1, borderRadius: 1.5 }} />}
          </Stack>

          {/* HERO */}
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
              minHeight: { xs: 200, sm: 240, md: 280 },
              maxHeight: { xs: 260, sm: 320, md: 380 },
              bgcolor: '#000',
              mb: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src={heroUrl}
              alt={author?.name || 'author'}
              sx={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', m: '0 auto' }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: 16, bottom: 16, right: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1,
                borderRadius: 2,
                bgcolor: 'rgba(0,0,0,0.45)',
                color: '#fff',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Avatar src={author?.imgurl} alt={author?.name} sx={{ width: 48, height: 48, border: '2px solid rgba(255,255,255,0.7)' }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 18, lineHeight: 1.1 }}>{author?.name || 'Автор'}</Typography>
                {author?.about && <Typography sx={{ fontSize: 13, opacity: 0.92, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{author.about}</Typography>}
              </Box>
            </Box>
          </Paper>

          {/* О себе */}
          {author?.about && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: '#0f172a', fontWeight: 800, mb: 0.75 }}>О авторе</Typography>
              <Typography sx={{ color: '#334155', whiteSpace: 'pre-wrap' }}>{author.about}</Typography>
            </Box>
          )}

          {/* КУРСЫ — ОДНА ПОЛНАЯ КОЛОНКА + КНОПКА В СВОЁЙ СТРОКЕ */}
            {/* КУРСЫ — старый размер сетки, кнопка в своей строке */}
            {courses.length > 0 && (
            <>
                <SectionHeader title="Доступные курсы" />
                <Box
                sx={{
                    display: 'grid',
                    gap: { xs: 1.5, md: 2 },
                    gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    md: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                    },
                    mb: 2,
                    opacity: isBusy ? 0.85 : 1,
                }}
                >
                {courses.map((c) => (
                    <Card
                    key={c.id}
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        bgcolor: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'visible', // не подрезать тень/кнопку
                    }}
                    >
                    <CardActionArea
                        onClick={() => openCourse(c)}
                        sx={{ borderRadius: 3, overflow: 'visible' }}
                    >
                        <CardMedia
                        component="img"
                        image={
                            c.imgUrl ||
                            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop'
                        }
                        alt={c.courseName}
                        sx={{
                            width: '100%',
                            aspectRatio: '16 / 9',
                            objectFit: 'cover',
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                            display: 'block',
                        }}
                        />

                        <CardContent sx={{ py: 1.25, px: 2, pr: 2.5, minHeight: 112 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.25, mb: 0.75 }}>
                            {c.courseName}
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minHeight: 24 }}>
                            {c.authorTitle && (
                            <Typography sx={{ color: '#F97316', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                {c.authorTitle}
                            </Typography>
                            )}
                            {typeof c.seasonNum === 'number' && (
                            <Typography component="span" sx={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                                • {c.seasonNum} сезон
                            </Typography>
                            )}
                        </Stack>

                        {/* кнопка — отдельной строкой справа */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Button
                            size="small"
                            endIcon={<PlayArrowRoundedIcon />}
                            sx={{
                                borderRadius: 999,
                                px: 1.75,
                                py: 0.5,
                                fontWeight: 800,
                                textTransform: 'none',
                                bgcolor: '#F97316',
                                color: '#fff',
                                '&:hover': { bgcolor: '#ea6a11' },
                                boxShadow: '0 6px 16px rgba(249,115,22,0.28)',
                                minWidth: 0,
                            }}
                            >
                            Смотреть
                            </Button>
                        </Box>
                        </CardContent>
                    </CardActionArea>
                    </Card>
                ))}
                </Box>
            </>
            )}


          {/* ХОРЕОГРАФИИ — чёрный блок */}
          {choreos.length > 0 && (
            <>
              <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: 20, md: 24 }, mt: { xs: 2.5, md: 3 }, mb: { xs: 1.25, md: 1.5 }, color: '#0f172a' }}>
                Доступные хореографии
              </Typography>
              <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: '#0b0b0d', color: '#e5e7eb' }}>
                {choreos.map((ch, i) => (
                  <Box key={ch.id}>
                    <CardActionArea onClick={() => openChoreo(ch)} sx={{ display: 'block' }}>
                      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 1.25, py: 1 }}>
                        <Avatar variant="rounded" src={ch.imgUrl} sx={{ width: 56, height: 56, borderRadius: 2, border: '1px solid rgba(255,255,255,0.18)' }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fafafa' }}>
                            {ch.name}
                          </Typography>
                          <Typography sx={{ color: '#cbd5e1', fontSize: 13 }}>
                            {ch.Author || (Array.isArray(ch.authors) ? ch.authors.join(', ') : '—')}
                          </Typography>
                        </Box>
                        <IconButton edge="end" sx={{ color: '#e5e7eb' }}>
                          <ChevronRightRoundedIcon />
                        </IconButton>
                      </Stack>
                    </CardActionArea>
                    {i < choreos.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />}
                  </Box>
                ))}
              </Paper>
            </>
          )}

          {!isBusy && courses.length === 0 && choreos.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>
              <Typography>Пока нет контента у этого автора.</Typography>
            </Box>
          )}
        </Box>
      </Container>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MUIAlert onClose={() => setToastOpen(false)} severity="error" sx={{ width: '100%' }} elevation={6} variant="filled">
          {error || 'Произошла ошибка'}
        </MUIAlert>
      </Snackbar>
    </Box>
  );
};

export default AuthorPageWeb;

/** Заголовок секции */
function SectionHeader({ title, actionLabel }: { title: string; actionLabel?: string }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: { xs: 2.5, md: 3 }, mb: { xs: 1.25, md: 1.5 } }}>
      <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: 20, md: 24 }, color: '#0f172a' }}>
        {title}
      </Typography>
      {actionLabel && (
        <Button size="small" color="inherit" sx={{ opacity: 0.6, fontWeight: 600 }}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}
