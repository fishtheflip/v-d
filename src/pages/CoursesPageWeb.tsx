// src/pages/CoursePageWeb.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Paper, Typography, IconButton, Stack, Chip,
  List, ListItemButton, ListItemAvatar, Avatar, ListItemText, Divider,
  CircularProgress, Alert, Button
} from '@mui/material';
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
import {
  collection, doc, getDoc, getDocs, query, where, limit
} from 'firebase/firestore';

type Lesson = {
  name: string;
  duration?: string | number; // "0:30" или минуты
  isOpen?: boolean;
  thumbUrl?: string;

  // ↓ поля для видео (любое из них может прийти)
  videoId?: string;   // чистый vimeo id: "76979871"
  vimeoId?: string;   // альтернативное имя
  videoUrl?: string;  // полная ссылка на vimeo (или player)
  url?: string;       // на всякий случай
  description?: string;
};

type Course = {
  id: string;
  simpId?: string;          // твой короткий id
  courseName: string;
  authorTitle?: string;
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

// полезно: собрать payload для страницы плеера
function buildVideoState(course: Course, lesson: Lesson) {
  return {
    name: `${course.courseName} — ${lesson.name}`,
    description: lesson.description || course.authorTitle || '',
    // оба варианта — компонент VideoPageWeb умеет любой из них
    videoId: lesson.videoId || lesson.vimeoId,
    videoUrl: lesson.videoUrl || lesson.url,
  };
}

export default function CoursePageWeb() {
  const nav = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const params = useParams(); // если зайдём по /course/:simpId

  const draftCourse: Partial<Course> | undefined = location.state as any;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [haveAccess, setHaveAccess] = useState(false);

  // 1) тянем курс
  useEffect(() => {
    let unmounted = false;

    const load = async () => {
      try {
        setLoading(true);
        setErr(null);

        let found: Course | null = null;

        // (а) если есть simpId в роуте — ищем по нему
        if (params?.id || params?.simpId) {
          const simpId = (params.id || params.simpId)!;
          const q = query(collection(db, 'courses'), where('simpId', '==', simpId), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const d = snap.docs[0];
            found = { id: d.id, ...(d.data() as any) } as Course;
          }
        }

        // (б) иначе, если нам передали черновик — ищем по authorTitle
        if (!found && draftCourse?.authorTitle) {
          const q = query(
            collection(db, 'courses'),
            where('authorTitle', '==', draftCourse.authorTitle),
            limit(1)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const d = snap.docs[0];
            found = { id: d.id, ...(d.data() as any) } as Course;
          }
        }

        // (в) крайний случай — если draftCourse уже полноценный
        if (!found && draftCourse?.courseName) {
          found = { id: draftCourse.id || 'draft', ...(draftCourse as any) } as Course;
        }

        if (!found) throw new Error('Курс не найден');

        const ls = Array.isArray(found.lessons) ? found.lessons : [];
        if (!unmounted) {
          setCourse(found);
          setLessons(ls);
        }

        // 2) проверяем доступ пользователя
        if (user) {
          const uref = doc(db, 'users', user.uid);
          const usnap = await getDoc(uref);
          const profile = usnap.exists() ? (usnap.data() as any) : {};
          const ac = profile?.availableCourses;
          const ok =
            ac === 'all' ||
            (Array.isArray(ac) && found.simpId && ac.includes(found.simpId));

          if (!unmounted) setHaveAccess(!!ok);
        } else {
          if (!unmounted) setHaveAccess(false);
        }
      } catch (e: any) {
        console.error(e);
        if (!unmounted) setErr(e?.message || 'Не удалось загрузить курс');
      } finally {
        if (!unmounted) setLoading(false);
      }
    };

    load();
    return () => { unmounted = true; };
  }, [draftCourse, params.id, params.simpId, user]);

  const title = useMemo(() => course?.courseName || 'Курс', [course]);

  // первый доступный урок (для кнопки «Начать»)
  const firstOpenIndex = useMemo(() => {
    if (!lessons.length) return -1;
    const idx = lessons.findIndex(l => haveAccess || l.isOpen);
    return idx < 0 ? -1 : idx;
  }, [lessons, haveAccess]);

  const openLesson = (lesson: Lesson) => {
    if (!course) return;
    const payload = buildVideoState(course, lesson);
    nav('/video', { state: payload }); // VideoPageWeb принимает этот state
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh' }}>
      <Container maxWidth={false} disableGutters sx={{ pb: 6 }}>
        <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto' }}>
          {/* cover */}
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={course?.imgUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop'}
              alt={title}
              sx={{
                width: '100%',
                height: { xs: 220, sm: 280, md: 340 },
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                right: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <IconButton
                onClick={() => nav(-1)}
                sx={{ bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
              >
                <ArrowBackIosNewRoundedIcon />
              </IconButton>
              <IconButton
                onClick={() => setFav(v => !v)}
                sx={{ bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
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
            }}
          >
            {err && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {err}
              </Alert>
            )}

            <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: 24, md: 30 } }}>
                {title}
              </Typography>
              {course?.seasonNum != null && (
                <Typography sx={{ color: 'primary.main', fontWeight: 700 }}>
                  {course.seasonNum} сезон
                </Typography>
              )}
            </Stack>

            {/* метрики */}
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {course?.sumDuration != null && (
                <Chip
                  icon={<AccessTimeRoundedIcon />}
                  label={`${course.sumDuration} мин`}
                  variant="outlined"
                />
              )}
              {course?.sumLessons != null && (
                <Chip
                  icon={<WhatshotRoundedIcon />}
                  label={pluralizeLessons(course.sumLessons)}
                  variant="outlined"
                />
              )}
              {course?.level && (
                <Chip
                  icon={<BoltRoundedIcon />}
                  label={course.level}
                  variant="outlined"
                />
              )}
            </Stack>

            {/* CTA */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
              {!haveAccess && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => nav('/premium')}
                  sx={{ borderRadius: 999, px: 2.5, py: 1.2, fontWeight: 800 }}
                >
                  Получить доступ
                </Button>
              )}
              {!!haveAccess && firstOpenIndex >= 0 && (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => openLesson(lessons[firstOpenIndex])}
                  sx={{ borderRadius: 999, px: 2.5, py: 1.2, fontWeight: 800 }}
                >
                  Начать
                </Button>
              )}
            </Stack>

            {/* Уроки */}
            <Typography sx={{ mt: 3, mb: 1, fontSize: 20, fontWeight: 900 }}>
              Уроки
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
                        sx={{ borderRadius: 2, py: 1.25 }}
                      >
                        <ListItemAvatar>
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
                          sx={{ mr: 1 }}
                        />
                        {open ? <PlayArrowRoundedIcon /> : <LockRoundedIcon color="disabled" />}
                      </ListItemButton>
                      {i < lessons.length - 1 && <Divider sx={{ ml: 9 }} />}
                    </Box>
                  );
                })}
                {lessons.length === 0 && (
                  <Typography sx={{ color: 'text.secondary', py: 2 }}>
                    Пока нет уроков.
                  </Typography>
                )}
              </List>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
