// src/pages/HomePageWeb.tsx
import {
  Box, Container, Typography, Stack, Chip, Button,
  Card, CardActionArea, CardContent,
  IconButton, Paper, Divider, ListItemButton, ListItemText, ListItemAvatar, Avatar,
  Tooltip, useMediaQuery, Snackbar, Alert as MUIAlert, Collapse,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../auth/AuthProvider';
import { db } from '../lib/firestore';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/banner.webp';
import { getCachedChoreos, getCachedCourses, loadChoreos, loadCourses } from '../lib/catalogCache';
import ImageWithSkeleton from '../components/ImageWithSkeleton';

type Category = { id: string; name: string; title?: string; icon?: string };
type Course = {
  id: string;
  courseName: string;
  title?: string;
  simpId?: string;
  authorTitle?: string;
  seasonNum?: number;
  imgUrl?: string;
  popular?: boolean;
  popPriority?: number;
};
type Choreo = { id: string; name: string; Author?: string; imgUrl?: string; simpId?: string };

// =====================
// 🔒 Простой кэш с TTL
// =====================
type CacheEntry<T> = { data: T; ts: number };
type InFlightMap = Record<string, Promise<any> | undefined>;
const TTL_MS = 60 * 60 * 1000; // 1 час
const LS_PREFIX = 'home_cache:'; // префикс ключей в localStorage
const memCache = new Map<string, CacheEntry<any>>();
const inFlight: InFlightMap = {};

function setToCache<T>(key: string, data: T) {
  const entry: CacheEntry<T> = { data, ts: Date.now() };
  memCache.set(key, entry);
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry));
  } catch {}
}

function getFromCache<T>(key: string): T | undefined {
  const now = Date.now();
  const mem = memCache.get(key);
  if (mem && now - mem.ts < TTL_MS) return mem.data as T;

  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (raw) {
      const parsed = JSON.parse(raw) as CacheEntry<T>;
      if (now - parsed.ts < TTL_MS) {
        memCache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch {}
  return undefined;
}

async function cachedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  // 1) свежий кэш
  const cached = getFromCache<T>(key);
  if (cached !== undefined) return cached;

  // 2) есть активный запрос — дожидаемся
  if (inFlight[key]) return inFlight[key] as Promise<T>;

  // 3) идём в сеть
  const p = fetcher()
    .then((data) => {
      setToCache(key, data);
      return data;
    })
    .finally(() => {
      inFlight[key] = undefined;
    });

  inFlight[key] = p;
  return p;
}

// =====================
// 🧩 Вспомогалки
// =====================
const EMOJIS = ['', '', '', '', '', '', '', '', '', ''];
const addIcons = (items: Category[]): Category[] => {
  let i = 0;
  return items.map((item) => {
    let icon = EMOJIS[i++ % EMOJIS.length];
    if (item.name === 'Hobby Male') icon = '';
    else if (item.name === 'Hobby Female') icon = '';
    return { ...item, icon };
  });
};

export default function HomePageWeb() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [popular, setPopular] = useState<Course[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [choreos, setChoreos] = useState<Choreo[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔔 UI ошибки
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  const catRef = useRef<HTMLDivElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (el: HTMLDivElement | null, dir: 1 | -1) => {
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.9, 320);
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  // 👉 переход к курсу
  const openCourse = (c: Course) => {
    const slug = c.simpId || c.id;
    navigate(`/course/${slug}`, { state: c });
  };

  const openCategory = (category: Category) => {
    try {
      const categoryTitle = (category.title || category.name).trim().toLocaleLowerCase();
      const course = courses.find((item) =>
        (item.courseName || item.title || '').trim().toLocaleLowerCase() === categoryTitle
      );

      if (!course) {
        throw new Error(`Курс «${category.title || category.name}» не найден`);
      }

      openCourse(course);
    } catch (e: any) {
      setError(e?.message || 'Не удалось открыть курс');
      setToastOpen(true);
    }
  };

  // 👉 переход к хореографии (как openCourse, но с другим payload)
  const openChoreo = (ch: Choreo) => {
    navigate('/course', {
      state: {
        courseName: ch.name,
        imgUrl: ch.imgUrl,
        authorTitle: ch.Author,
        simpId: ch.simpId,
        from: 'choreo',
      },
    });
  };

  // ================
  // 🔽 Фетчеры с кэшем
  // ================
  const fetchCategories = async () =>
    cachedFetch<Category[]>('categories', async () => {
      const snap = await getDocs(collection(db, 'category'));
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Category[];
      return addIcons(rows);
    });

  const fetchCourses = async () => loadCourses() as Promise<Course[]>;
  const fetchChoreos = async () => loadChoreos() as Promise<Choreo[]>;

  // 👇 Загрузка
  const loadData = async () => {
    if (authLoading) return;

    try {
      setLoading(true);
      setError(null);

      // подставим кэш, если есть
      const cachedCat = getFromCache<Category[]>('categories');
      const cachedCh = getCachedChoreos() as Choreo[] | null;
      const cachedCourses = getCachedCourses() as Course[] | null;
      if (cachedCat) setCategories(cachedCat);
      if (cachedCh) setChoreos(cachedCh);
      if (cachedCourses) {
        setCourses(cachedCourses);
        setPopular(cachedCourses.filter((course) => course.popular));
      }

      // Подтягиваем блоки независимо: категории не должны пропадать,
      // если курсы/хореографии временно не доступны после login/logout.
      const [catResult, chResult, coursesResult] = await Promise.allSettled([
        fetchCategories(),
        fetchChoreos(),
        fetchCourses(),
      ]);

      if (catResult.status === 'fulfilled') {
        setCategories(catResult.value);
      } else if (!cachedCat) {
        throw catResult.reason;
      }

      if (chResult.status === 'fulfilled') {
        setChoreos(chResult.value);
      }

      if (coursesResult.status === 'fulfilled') {
        setCourses(coursesResult.value);
        setPopular(coursesResult.value.filter((course) => course.popular));
      }

      const failedOptional = [chResult, coursesResult].some((result) => result.status === 'rejected');
      if (failedOptional && !cachedCh && !cachedCourses) {
        setError('Часть данных не загрузилась. Категории доступны, попробуйте обновить страницу.');
        setToastOpen(true);
      }
    } catch (e: any) {
      console.error('Ошибка загрузки данных:', e);
      setError(e?.message || 'Не удалось загрузить данные. Попробуйте ещё раз.');
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unmounted = false;
    (async () => {
      if (!unmounted) await loadData();
    })();
    return () => {
      unmounted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.uid]);

  const hello = useMemo(() => {
    const name = user?.displayName?.trim();
    if (!name) return undefined;
    return (name === 'Адеми' || name === 'айым')
      ? `Bonjour 😘 ${name}`
      : `Привет, ${name}`;
  }, [user?.displayName]);

  return (
    <Box sx={{ bgcolor: '#f7f9fc', minHeight: '100dvh', color: 'text.primary' }}>
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, md: 4 } }}>
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
          {/* Верхний алерт об ошибке */}
          <Collapse in={!!error}>
            <MUIAlert
              severity="error"
              variant="filled"
              sx={{ mb: 2, borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={loadData} disabled={loading}>
                  {loading ? 'Загружаем…' : 'Обновить'}
                </Button>
              }
            >
              {error}
            </MUIAlert>
          </Collapse>

          {/* hero */}
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
              p: { xs: 2, sm: 2.5, md: 3 },
              bgcolor: '#f8d7e2',
              minHeight: { xs: 160, sm: 180, md: 220 },
              display: 'flex',
              alignItems: 'center',
              opacity: loading ? 0.9 : 1,
            }}
          >
            <Box sx={{ maxWidth: { xs: '70%', md: '55%' } }}>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.12, fontSize: { xs: 22, sm: 26, md: 32 } }}>
                {hello ? (
                  <>
                    {hello}
                    <br />
                    Выбирай не просто движения — выбирай стиль
                  </>
                ) : (
                  <>
                    Выбирай не просто
                    <br />
                    движения —<br />
                    выбирай стиль
                  </>
                )}
              </Typography>
            </Box>
            <Box
              component="img"
              alt="hero"
              src={heroImg}
              sx={{
                position: 'absolute',
                right: { xs: -12, md: -6 },
                bottom: { xs: -4, md: -10 },
                height: { xs: 200, sm: 220, md: 280 },
                maxWidth: 'none',
                objectFit: 'cover',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          </Paper>

          {/* Категории */}
          <SectionHeader title="Категории" />
          <Box
            ref={catRef}
            sx={{
              display: 'flex',
              gap: 1.5,
              overflowX: 'auto',
              pb: 1,
              scrollSnapType: 'x mandatory',
              '::-webkit-scrollbar': { display: 'none' },
              opacity: loading ? 0.8 : 1,
            }}
          >
            {(loading && !categories.length
              ? Array.from({ length: 8 }).map((_, i) => ({ id: `s${i}`, name: '…', icon: '⏳' }))
              : categories
            ).map((c) => (
              <Chip
                key={c.id}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span style={{ fontSize: isMdUp ? 18 : 16 }}>{c.icon ?? '✨'}</span>
                    <span>{c.name}</span>
                  </Stack>
                }
                clickable
                onClick={() => openCategory(c)}
                disabled={loading && !categories.length}
                sx={{
                  flex: '0 0 auto',
                  px: 1,
                  height: { xs: 38, sm: 42, md: 46 },
                  borderRadius: 3,
                  bgcolor: '#fff',
                  border: '1px solid #E5E9EF',
                  scrollSnapAlign: 'start',
                }}
              />
            ))}
          </Box>

          {/* Популярное */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1.5, fontWeight: 800, fontSize: { xs: 20, md: 24 } }}>
            Популярное
          </Typography>
          <Scroller
            refEl={popRef}
            onPrev={() => scrollBy(popRef.current, -1)}
            onNext={() => scrollBy(popRef.current, 1)}
          >
            <Box
              ref={popRef}
              sx={{
                display: 'flex',
                gap: { xs: 1.5, sm: 2, md: 3 },
                overflowX: 'auto',
                pb: 1,
                '::-webkit-scrollbar': { display: 'none' },
                opacity: loading ? 0.8 : 1,
              }}
            >
              {(loading && !popular.length ? [] : popular).map((c) => (
                <Card
                  key={c.id}
                  elevation={0}
                  sx={{
                    flex: '0 0 auto',
                    width: { xs: 260, sm: 280, md: 300 },
                    borderRadius: 3,
                    bgcolor: '#fff',
                  }}
                >
                  <CardActionArea onClick={() => openCourse(c)} sx={{ borderRadius: 3 }}>
                    <ImageWithSkeleton
                      src={
                        c.imgUrl ||
                        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop'
                      }
                      alt={c.courseName}
                      sx={{
                        width: '100%',
                        height: { xs: 160, sm: 180, md: 200 },
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                      }}
                    />
                    <CardContent sx={{ px: { xs: 1, sm: 1.5 }, py: { xs: 1, sm: 1.5 } }}>
                      <Typography sx={{ mt: 0.5, fontWeight: 800, fontSize: { xs: 16, md: 18 } }}>
                        {c.courseName}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mt: 0.5 }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                          {c.authorTitle && (
                            <Typography
                              sx={{
                                color: '#F97316',
                                fontWeight: 700,
                                display: 'inline',
                                fontSize: { xs: 13, md: 14 },
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {c.authorTitle}
                            </Typography>
                          )}
                          {typeof c.seasonNum === 'number' && (
                            <Typography
                              component="span"
                              sx={{ color: '#64748b', ml: 1, fontSize: { xs: 12, md: 13 }, whiteSpace: 'nowrap' }}
                            >
                              • {c.seasonNum} сезон
                            </Typography>
                          )}
                        </Stack>

                        {/* Визуальная кнопка внутри CardActionArea без вложенного <button>. */}
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            ml: 1,
                            flexShrink: 0,
                            borderRadius: 999,
                            px: 1.75,
                            py: 0.5,
                            fontWeight: 800,
                            textTransform: 'none',
                            bgcolor: '#F97316',
                            color: '#fff',
                            '&:hover': { bgcolor: '#ea6a11' },
                            boxShadow: '0 6px 16px rgba(249,115,22,0.28)',
                          }}
                        >
                          Смотреть
                          <PlayArrowRoundedIcon fontSize="small" />
                        </Box>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          </Scroller>

          {/* Хореография */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1.5, fontWeight: 800, fontSize: { xs: 20, md: 24 } }}>
            Хореография
          </Typography>
          <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', opacity: loading ? 0.85 : 1 }}>
            {(loading && !choreos.length ? [] : choreos).map((ch, i) => (
              <Box key={ch.id}>
                <ListItemButton
                  sx={{ py: { xs: 1, md: 1.25 } }}
                  disabled={loading && !choreos.length}
                  onClick={() => openChoreo(ch)} // ← навигация как openCourse(c)
                >
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      src={ch.imgUrl}
                      sx={{ width: { xs: 52, md: 56 }, height: { xs: 52, md: 56 }, borderRadius: 2 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={ch.name}
                    secondary={ch.Author}
                    primaryTypographyProps={{ fontWeight: 800, fontSize: { xs: 15, md: 16 } }}
                    sx={{ ml: 1 }}
                  />
                  <IconButton edge="end" size={isMdUp ? 'medium' : 'small'}>
                    <ChevronRightRoundedIcon />
                  </IconButton>
                </ListItemButton>
                {i < choreos.length - 1 && <Divider />}
              </Box>
            ))}
          </Paper>
        </Box>
      </Container>

      {/* Нижний Snackbar (авто-скрытие) */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MUIAlert
          onClose={() => setToastOpen(false)}
          severity="error"
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {error || 'Произошла ошибка'}
        </MUIAlert>
      </Snackbar>
    </Box>
  );
}

/** Обёртка для горизонтального скролла со стрелками */
function Scroller({
  children,
  refEl,
  onPrev,
  onNext,
}: {
  children: React.ReactNode;
  refEl: React.RefObject<HTMLDivElement | null>; // ✅ тип допускает null
  onPrev: () => void;
  onNext: () => void;
}) {
  void refEl; // помечаем prop как использованный (TS6133)

  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      {/* стрелки — скрываем на xs (мобилка) */}
      <Box sx={{ display: { xs: 'none', sm: 'flex' }, pointerEvents: 'none' }}>
        <Tooltip title="Назад">
          <IconButton
            onClick={onPrev}
            size="small"
            sx={{
              pointerEvents: 'auto',
              position: 'absolute',
              top: '50%',
              left: -8,
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <ArrowBackIosNewRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Вперёд">
          <IconButton
            onClick={onNext}
            size="small"
            sx={{
              pointerEvents: 'auto',
              position: 'absolute',
              top: '50%',
              right: -8,
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <ArrowForwardIosRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function SectionHeader({ title, actionLabel }: { title: string; actionLabel?: string }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mt: { xs: 2.5, md: 3 }, mb: { xs: 1.25, md: 1.5 } }}
    >
      <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: 20, md: 24 } }}>
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
