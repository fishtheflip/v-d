import {
    Box, Container, Typography, Stack, IconButton,
    Card, CardActionArea, CardMedia, CardContent, Button,
    ToggleButton, ToggleButtonGroup, Snackbar, Alert as MUIAlert, Collapse,
  } from '@mui/material';
  import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
  import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
  import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
  import  { useEffect, useMemo, useState } from 'react';
  
  import { db } from '../lib/firebase';
  import {
    collection, getDocs, query,
  } from 'firebase/firestore';
  import { useNavigate } from 'react-router-dom';
  
  type TabKind = 'course' | 'choreo';
  
  type Course = {
    id: string;
    courseName: string;
    authorTitle?: string;
    seasonNum?: number;
    imgUrl?: string;
    popPriority?: number;
    simpId?: string;
  };
  
  type Choreo = {
    id: string;
    name: string;
    Author?: string;
    imgUrl?: string;
    simpId?: string;
  };
  
  // ====== КЭШ (TTL = 1 час) ======
  const TTL_MS = 60 * 60 * 1000; // 1 час
  const K_COURSES = 'videos:courses';
  const K_CHOREOS = 'videos:choreos';
  
  type CacheBox<T> = { ts: number; data: T };
  
  function readCache<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CacheBox<T>;
      if (!parsed || typeof parsed.ts !== 'number') return null;
      if (Date.now() - parsed.ts > TTL_MS) return null;
      return parsed.data;
    } catch {
      return null;
    }
  }
  
  function writeCache<T>(key: string, data: T) {
    try {
      const box: CacheBox<T> = { ts: Date.now(), data };
      localStorage.setItem(key, JSON.stringify(box));
    } catch {
      // игнорируем ошибки квоты
    }
  }
  
  export default function VideosPageWeb() {
    const [tab, setTab] = useState<TabKind>('course');
  
    const [courses, setCourses] = useState<Course[]>([]);
    const [choreos, setChoreos] = useState<Choreo[]>([]);
  
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState<Record<string, boolean>>({});
  
    const [error, setError] = useState<string | null>(null);
    const [toastOpen, setToastOpen] = useState(false);
  
    const navigate = useNavigate();
  
    const toggleLike = (id: string) => setLiked((s) => ({ ...s, [id]: !s[id] }));
  
    // ----- Загрузка с учётом кэша -----
    const loadData = async (opts?: { force?: boolean }) => {
      const force = !!opts?.force;
      try {
        setLoading(true);
        setError(null);
  
        // 1) Попробуем кэш (если не force)
        let cachedCourses = !force ? readCache<Course[]>(K_COURSES) : null;
        let cachedChoreos = !force ? readCache<Choreo[]>(K_CHOREOS) : null;
  
        if (cachedCourses && cachedChoreos) {
          setCourses(cachedCourses);
          setChoreos(cachedChoreos);
          setLoading(false); // уже можем отрисовать
          return; // свежий кэш — выходим (без запроса к Firestore)
        }
  
        // 2) Иначе тянем из Firestore
        const [snapCourses, snapChoreos] = await Promise.all([
          getDocs(query(collection(db, 'courses'))),
          getDocs(query(collection(db, 'choreos'))),
        ]);
  
        const rawCourses = snapCourses.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Course[];
        const sortedCourses = rawCourses.sort(
          (a, b) => (Number(a.popPriority) || 0) - (Number(b.popPriority) || 0)
        );
  
        const rawChoreos = snapChoreos.docs.map((d) => {
          const r = d.data() as any;
          return {
            id: d.id,
            name: r?.name || '',
            Author: r?.Author,
            imgUrl: r?.imgUrl,
            simpId: r?.simpId,
          } as Choreo;
        });
  
        setCourses(sortedCourses);
        setChoreos(rawChoreos);
  
        // 3) Обновим кэш
        writeCache(K_COURSES, sortedCourses);
        writeCache(K_CHOREOS, rawChoreos);
      } catch (e: any) {
        console.error('Ошибка загрузки видео:', e);
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
      return () => { unmounted = true; };
    }, []);
  
    const list = useMemo(() => (tab === 'course' ? courses : choreos), [tab, courses, choreos]);
  
    const openCourse = (item: Course | Choreo) => {
      if (tab === 'course') {
        const c = item as Course;
        const slug = c.simpId || c.id;
        navigate(`/course/${slug}`, { state: c });
      } else {
        const ch = item as Choreo;
        navigate('/course', {
          state: {
            courseName: ch.name,
            imgUrl: ch.imgUrl,
            authorTitle: ch.Author,
            simpId: ch.simpId,
            from: 'choreo',
          },
        });
      }
    };
  
    return (
      <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', pb: 9 }}>
        <Container maxWidth={false} disableGutters sx={{ px: { xs: 1.5, sm: 2 }, pt: 2 }}>
          <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto' }}>
            <Collapse in={!!error}>
              <MUIAlert
                severity="error"
                variant="filled"
                sx={{ mb: 2, borderRadius: 2 }}
                action={
                  <ToggleButton
                    value="retry"
                    onClick={() => loadData({ force: true })}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '28px',
                      px: 2, py: 0.75,
                      color: '#fff', border: '1px solid rgba(255,255,255,0.4)'
                    }}
                  >
                    {loading ? 'Загружаем…' : 'Повторить'}
                  </ToggleButton>
                }
              >
                {error}
              </MUIAlert>
            </Collapse>
  
            <ToggleButtonGroup
              value={tab}
              exclusive
              onChange={(_, v) => v && setTab(v)}
              sx={{ mb: 2 }}
            >
              <ToggleButton
                value="course"
                sx={{
                  textTransform: 'none',
                  borderRadius: '28px',
                  px: 2.5, py: 1,
                  '&.Mui-selected': { bgcolor: '#F97316', color: '#fff', '&:hover': { bgcolor: '#ea6a11' } },
                }}
              >
                Курсы
              </ToggleButton>
              <ToggleButton
                value="choreo"
                sx={{ textTransform: 'none', borderRadius: '28px', px: 2.5, py: 1 }}
              >
                Хореография
              </ToggleButton>
            </ToggleButtonGroup>
  
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 1.5, md: 2 },
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                alignItems: 'stretch',
                opacity: loading ? 0.85 : 1,
              }}
            >
              {list.map((v) => {
                const id = v.id;
                const isCourse = tab === 'course';
                const title = isCourse ? (v as Course).courseName : (v as Choreo).name;
                const teacher = isCourse ? (v as Course).authorTitle ?? '' : (v as Choreo).Author ?? '';
                const seasons = isCourse ? (v as Course).seasonNum ?? 1 : 1;
                const image =
                  (v as any).imgUrl ||
                  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop';
  
                const isLiked = liked[id] ?? false;
  
                return (
                  <Card
                    key={id}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      bgcolor: '#fff',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={image}
                        alt={title}
                        sx={{
                          width: '100%',
                          aspectRatio: '16 / 9',
                          objectFit: 'cover',
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                          display: 'block',
                        }}
                      />
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); toggleLike(id); }}
                        sx={{
                          position: 'absolute', top: 8, right: 8,
                          bgcolor: 'rgba(255,255,255,0.85)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
                        }}
                      >
                        {isLiked ? <FavoriteRoundedIcon color="error" /> : <FavoriteBorderOutlinedIcon />}
                      </IconButton>
                    </Box>
  
                    <CardActionArea
                      onClick={() => openCourse(v)}
                      sx={{
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                        height: '100%',
                        display: 'flex',
                      }}
                    >
                      <CardContent
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          width: '100%',
                          minHeight: 120,
                          py: 1.25,
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.25 }}>
                          {title}
                        </Typography>
  
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mt: 0.5 }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                            <Typography sx={{ color: '#F97316', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {teacher || '—'}
                            </Typography>
                            <Typography sx={{ color: '#1F2937' }}>•</Typography>
                            <Typography sx={{ color: '#64748B', whiteSpace: 'nowrap' }}>
                              {seasons} сезон
                            </Typography>
                          </Stack>
  
                          {/* Оранжевая кнопка «Смотреть» */}
                          <Button
                            size="small"
                            endIcon={<PlayArrowRoundedIcon />}
                            sx={{
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
                          </Button>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          </Box>
        </Container>
  
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
  