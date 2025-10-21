// src/pages/CoursePageWeb.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Paper, Typography, IconButton, Stack, Chip,
  List, ListItemButton, ListItemAvatar, Avatar, ListItemText, Divider,
  CircularProgress, Button, Snackbar, Collapse,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../auth/AuthProvider';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, limit } from 'firebase/firestore';

const ORANGE = '#F25D29';
const ORANGE_DARK = '#D94F22';
const ORANGE_SOFT = 'rgba(242,93,41,0.08)';

type Lesson = {
  name: string;
  duration?: string | number;
  isOpen?: boolean;
  thumbUrl?: string;
  videoId?: string;
  vimeoId?: string;
  videoUrl?: string;
  url?: string;
  description?: string;
};

type Course = {
  id: string;
  simpId?: string;
  courseName: string;
  authorTitle?: string;  // для choreo тоже используем authorTitle (как в RN-примере)
  Author?: string;       // на всякий — если документ в choreos хранит Author
  seasonNum?: number;
  sumDuration?: number | string;
  sumLessons?: number;
  level?: string;
  imgUrl?: string;
  lessons?: Lesson[];
};

function pluralizeLessons(n?: number) {
  if (n == null || Number.isNaN(n)) return '';
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} урок`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} урока`;
  return `${n} уроков`;
}

function buildVideoState(course: Course, lesson: Lesson) {
  return {
    name: `${course.courseName} — ${lesson.name}`,
    description: lesson.description || course.authorTitle || course.Author || '',
    videoId: lesson.videoId || lesson.vimeoId,
    videoUrl: lesson.videoUrl || lesson.url,
  };
}

/* === Vimeo helpers (укорочено) === */
function extractVimeoId(input?: string): string | null {
  if (!input) return null;
  if (/^\d+$/.test(input)) return input;
  try {
    const u = new URL(input);
    if (u.hostname.includes('player.vimeo.com')) {
      const m = u.pathname.match(/\/video\/(\d+)/);
      if (m) return m[1];
    }
    const m2 = u.pathname.match(/\/(\d+)(?:$|[/?#])/);
    if (m2) return m2[1];
    const clip = u.searchParams.get('clip_id');
    if (clip && /^\d+$/.test(clip)) return clip;
  } catch {}
  return null;
}

async function getVimeoThumbnailByAny(lesson: Lesson): Promise<string | null> {
  const id =
    extractVimeoId(lesson.videoId) ||
    extractVimeoId(lesson.vimeoId) ||
    extractVimeoId(lesson.videoUrl) ||
    extractVimeoId(lesson.url);
  if (!id) return null;

  try {
    const r = await fetch(`https://player.vimeo.com/video/${id}/config`, { mode: 'cors' });
    if (r.ok) {
      const data = await r.json();
      const sizes = data?.video?.pictures?.sizes;
      if (Array.isArray(sizes) && sizes.length) {
        return sizes[sizes.length - 1]?.link || sizes[sizes.length - 1]?.src || null;
      }
      const thumbs = data?.video?.thumbs;
      if (thumbs) {
        const keys = Object.keys(thumbs).filter(k => /^\d+$/.test(k)).map(Number).sort((a,b)=>a-b);
        const bestKey = keys[keys.length - 1];
        return thumbs[bestKey] || thumbs.base || null;
      }
    }
  } catch {}
  try {
    const o = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}`);
    if (o.ok) {
      const data = await o.json();
      return data?.thumbnail_url ?? null;
    }
  } catch {}
  try {
    const v2 = await fetch(`https://vimeo.com/api/v2/video/${id}.json`);
    if (v2.ok) {
      const arr = await v2.json();
      const item = Array.isArray(arr) ? arr[0] : null;
      return item?.thumbnail_large || item?.thumbnail_medium || item?.thumbnail_small || null;
    }
  } catch {}
  return null;
}

export default function CoursePageWeb() {
  const nav = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const params = useParams();

  const draftCourse: Partial<Course> | undefined = location.state as any;
  const isChoreo = (draftCourse as any)?.from === 'choreo';

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [haveAccess, setHaveAccess] = useState(false);

  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [heroReady, setHeroReady] = useState(false);

  // === загрузка документа курса/хорео + прав доступа (как в RN-логике) ===
  const loadCourse = async () => {
    try {
      setLoading(true);
      setErr(null);

      const colName = isChoreo ? 'choreos' : 'courses';

      let found: Course | null = null;

      // 1) если есть simpId/id в URL — пробуем по simpId в своей коллекции
      if (!isChoreo && (params?.id || params?.simpId)) {
        const simpId = (params.id || params.simpId)!;
        const qy = query(collection(db, 'courses'), where('simpId', '==', simpId), limit(1));
        const snap = await getDocs(qy);
        if (!snap.empty) {
          const d = snap.docs[0];
          found = { id: d.id, ...(d.data() as any) } as Course;
        }
      }

      // 2) если нет — ищем по authorTitle в соответствующей коллекции (как RN)
      if (draftCourse?.authorTitle?.includes('/')) {
        const parts = draftCourse.authorTitle.split('/');
        draftCourse.authorTitle = parts[1]?.trim() || draftCourse.authorTitle.trim();
      }
      if (!found && draftCourse?.authorTitle) {
        const qy = query(collection(db, colName), where('authorTitle', '==', draftCourse.authorTitle), limit(1));
        const snap = await getDocs(qy);
        if (!snap.empty) {
          const d = snap.docs[0];
          found = { id: d.id, ...(d.data() as any) } as Course;
        }
      }

      // 3) fallback — берём state как есть (например, пришли из списка хорео)
      if (!found && draftCourse?.courseName) {
        found = { id: draftCourse.id || 'draft', ...(draftCourse as any) } as Course;
      }

      if (!found) throw new Error(isChoreo ? 'Хореография не найдена' : 'Курс не найден');

      const ls = Array.isArray(found.lessons) ? found.lessons : [];
      setCourse(found);
      setLessons(ls);

      // === права доступа (как в RN) ===
      if (!user?.uid) {
        setHaveAccess(false);
      } else {
        const uref = doc(db, 'users', user.uid);
        const usnap = await getDoc(uref);
        const profile = usnap.exists() ? (usnap.data() as any) : {};
        const ac = profile?.availableCourses;

        const byAll = ac === 'all';
        const byArray =
          Array.isArray(ac) && (found.simpId ? ac.includes(found.simpId) : false);

        setHaveAccess(!!(byAll || byArray));
      }
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || (isChoreo ? 'Не удалось загрузить хореографию' : 'Не удалось загрузить курс'));
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unmounted = false;
    (async () => { if (!unmounted) await loadCourse(); })();
    return () => { unmounted = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChoreo, draftCourse?.authorTitle, draftCourse?.courseName, draftCourse?.simpId, params.id, params.simpId, user?.uid]);

  // выбор обложки (как раньше)
  useEffect(() => {
    let aborted = false;
    async function pickCover() {
      if (course?.imgUrl) { if (!aborted) setCoverUrl(course.imgUrl); return; }
      const withThumb = lessons.find(l => !!l.thumbUrl);
      if (withThumb?.thumbUrl) { if (!aborted) setCoverUrl(withThumb.thumbUrl); return; }
      const v = lessons.find(l => l.videoId || l.vimeoId || l.videoUrl || l.url);
      if (v) {
        const t = await getVimeoThumbnailByAny(v);
        if (!aborted && t) setCoverUrl(t);
        return;
      }
      if (!aborted) setCoverUrl(null);
    }
    pickCover();
    return () => { aborted = true; };
  }, [course?.imgUrl, lessons]);

  // плейсхолдер до загрузки основной обложки
  const heroSrc = coverUrl || course?.imgUrl || null;
  useEffect(() => {
    setHeroReady(false);
    if (!heroSrc) return;
    const img = new Image();
    img.src = heroSrc;
    img.onload = () => setHeroReady(true);
    img.onerror = () => setHeroReady(false);
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [heroSrc]);

  const title = useMemo(
    () => (isChoreo ? 'Хореография' : (course?.courseName || 'Курс')),
    [isChoreo, course?.courseName]
  );

  const secondLine = useMemo(() => {
    if (isChoreo) return course?.authorTitle || course?.Author || '';
    if (typeof course?.seasonNum === 'number') return `${course?.seasonNum} сезон`;
    return '';
  }, [isChoreo, course?.authorTitle, course?.Author, course?.seasonNum]);

  const firstOpenIndex = useMemo(() => {
    if (!lessons.length) return -1;
    const idx = lessons.findIndex(l => haveAccess || l.isOpen);
    return idx < 0 ? -1 : idx;
  }, [lessons, haveAccess]);

  const openLesson = (lesson: Lesson) => {
    if (!course) return;
    const payload = buildVideoState(course, lesson);
    nav('/video', { state: payload });
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', pb: 2 }}>
      <Container maxWidth={false} disableGutters sx={{ pb: 6, px: { xs: 0, sm: 0 } }}>
        <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto' }}>
          {/* Ошибка */}
          <Collapse in={!!err} unmountOnExit>
            <MuiAlert
              severity="error"
              variant="filled"
              sx={{ m: 2, borderRadius: 2 }}
              action={
                <Button
                  onClick={() => loadCourse()}
                  size="small"
                  sx={{
                    textTransform: 'none',
                    borderRadius: '28px',
                    px: 2, py: 0.5,
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.4)'
                  }}
                >
                  {loading ? 'Загружаем…' : 'Повторить'}
                </Button>
              }
            >
              {err}
            </MuiAlert>
          </Collapse>

          {/* cover */}
          {/* cover */}
          <Box sx={{ position: 'relative', zIndex: 0 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                // единый контейнер и для плейсхолдера, и для финального кадра
                aspectRatio: { xs: '4 / 3', sm: '16 / 9', md: '21 / 9' },
                overflow: 'hidden',
                opacity: loading ? 0.85 : 1,
              }}
            >
              {/* Плейсхолдер (до загрузки основного изображения) */}
              {(!heroSrc || !heroReady) && (
                <Box
                  component="img"
                  src={`${import.meta.env.BASE_URL}assets/feature.png`}
                  alt={`${title} (placeholder)`}
                  sx={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    // слегка поднять кадр, чтобы центр не резал головы
                    objectPosition: { xs: '50% 30%', md: '50% 35%' },
                    display: 'block',
                    transform: 'translateZ(0)',   // сглаживает субпиксельные «ступеньки»
                  }}
                />
              )}

              {/* Основное изображение */}
              {heroSrc && heroReady && (
                <Box
                  component="img"
                  src={heroSrc}
                  alt={title}
                  sx={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    // фокус вверх; можно подставить из курса: `${course.coverFocusX}% ${course.coverFocusY}%`
                    objectPosition: { xs: '50% 30%', md: '50% 35%' },
                    display: 'block',
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                  }}
                />
              )}
            </Box>

            {/* overlay-кнопки */}
            <Box
              sx={{
                position: 'absolute',
                top: 12, left: 12, right: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                pointerEvents: 'none',
              }}
            >
              <IconButton
                onClick={() => nav(-1)}
                sx={{ bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }, pointerEvents: 'auto' }}
              >
                <ArrowBackIosNewRoundedIcon />
              </IconButton>
              <IconButton
                onClick={() => setFav(v => !v)}
                sx={{ bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }, pointerEvents: 'auto' }}
              >
                {fav ? <FavoriteRoundedIcon color="error" /> : <FavoriteBorderOutlinedIcon />}
              </IconButton>
            </Box>
          </Box>


          {/* details */}
          <Paper
            elevation={0}
            sx={{
              mt: -4,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              p: { xs: 2, sm: 3 },
              position: 'relative', zIndex: 1, bgcolor: '#fff',
              opacity: loading ? 0.95 : 1,
            }}
          >
            {/* Заголовок + вторая строка */}
            <Stack spacing={0.25} sx={{ mb: 1 }}>
              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: 24, md: 30 } }}>{title}</Typography>
                {!isChoreo && course?.seasonNum != null && (
                  <Typography sx={{ color: ORANGE, fontWeight: 800 }}>
                    {course.seasonNum} сезон
                  </Typography>
                )}
              </Stack>
              {!!secondLine && (
                <Typography sx={{ color: isChoreo ? ORANGE : 'text.secondary', fontWeight: isChoreo ? 800 : 600 }}>
                  {secondLine}
                </Typography>
              )}
            </Stack>

            {/* метрики — прячем для choreo */}
            {!isChoreo && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {course?.sumDuration != null && <Chip icon={<AccessTimeRoundedIcon />} label={`${course.sumDuration} мин`} variant="outlined" />}
                {course?.sumLessons != null && <Chip icon={<WhatshotRoundedIcon />} label={pluralizeLessons(course.sumLessons)} variant="outlined" />}
                {course?.level && <Chip icon={<BoltRoundedIcon />} label={course.level} variant="outlined" />}
              </Stack>
            )}

            {/* CTA */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
              {!haveAccess && (
                <Button
                  variant="contained"
                  onClick={() => nav('/premium')}
                  sx={{
                    borderRadius: 999, px: 2.5, py: 1.2, fontWeight: 800,
                    bgcolor: ORANGE, '&:hover': { bgcolor: ORANGE_DARK }
                  }}
                >
                  Получить доступ
                </Button>
              )}
              {!!haveAccess && firstOpenIndex >= 0 && (
                <Button
                  variant="contained"
                  onClick={() => openLesson(lessons[firstOpenIndex])}
                  sx={{
                    borderRadius: 999, px: 2.5, py: 1.2, fontWeight: 800,
                    bgcolor: ORANGE, '&:hover': { bgcolor: ORANGE_DARK }
                  }}
                >
                  Начать
                </Button>
              )}
            </Stack>

            {/* Список уроков/разборов */}
            <Typography sx={{ mt: 3, mb: 1, fontSize: 20, fontWeight: 900 }}>
              {isChoreo ? 'Разбор хореографии' : 'Уроки'}
            </Typography>

            {loading ? (
              <Stack alignItems="center" sx={{ py: 4 }}>
                <CircularProgress />
              </Stack>
            ) : (
              <List disablePadding>
                {lessons.map((l, i) => {
                  const open = haveAccess || !!l.isOpen;
                  return (
                    <Box key={`${l.name}-${i}`}>
                      <ListItemButton
                        onClick={() => open && openLesson(l)}
                        disabled={!open}
                        sx={{
                          borderRadius: 2,
                          py: 1.25,
                          columnGap: 1.25,
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 64 }}>
                          <Avatar
                            variant="rounded"
                            src={l.thumbUrl}
                            sx={{ width: 56, height: 56, borderRadius: 2 }}
                          >
                            {open ? <PlayArrowRoundedIcon /> : <LockRoundedIcon />}
                          </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          primary={l.name}
                          secondary={l.duration ? `${l.duration}` : undefined}
                          primaryTypographyProps={{ fontWeight: 800 }}
                          sx={{ ml: 1.25, mr: 1.25 }}
                        />

                        <Box sx={{ ml: 0.5 }}>
                          {open ? <PlayArrowRoundedIcon /> : <LockRoundedIcon color="disabled" />}
                        </Box>
                      </ListItemButton>

                      {l.description && (
                        <Box
                          sx={{
                            ml: { xs: 9, sm: 9 },
                            mr: 1,
                            mt: 0.5,
                            mb: 1,
                            p: 1.25,
                            bgcolor: ORANGE_SOFT,
                            borderLeft: `3px solid ${ORANGE}`,
                            borderRadius: 1.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            title={l.description}                // полный текст по hover
                            sx={{
                              color: '#2f2f2f',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,                // <= максимум 2 строки
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            <b style={{ color: ORANGE }}></b> {l.description}
                          </Typography>
                        </Box>
                      )}

                      {i < lessons.length - 1 && <Divider sx={{ ml: 9 }} />}
                    </Box>
                  );
                })}

                {lessons.length === 0 && (
                  <Typography sx={{ color: 'text.secondary', py: 2 }}>
                    Пока нет материалов.
                  </Typography>
                )}
              </List>
            )}
          </Paper>
        </Box>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setToastOpen(false)} severity="error" sx={{ width: '100%' }} elevation={6} variant="filled">
          {err || 'Произошла ошибка'}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
