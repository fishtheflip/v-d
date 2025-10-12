import {
  Box,
  Container,
  Paper,
  Chip,
  Stack,
  Avatar,
  Typography,
  ButtonBase,
  Snackbar,
  Alert as MUIAlert,
  Collapse,
  CircularProgress,
} from '@mui/material';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
type Teacher = {
  id: string;
  name: string;
  imgurl?: string;        // поле как в RN
  photo?: string;         // на всякий — поддержим оба
  category?: string[];    // массив категорий (жанры)
  simpId?: string;        // ЧПУ-слизень, если есть
};

// ====== КЭШ (TTL = 1 час) ======
const TTL_MS = 60 * 60 * 1000; // 1 час
const K_AUTHORS = 'notes:authors';

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
    // ignore quota errors
  }
}

export default function NotesPageWeb() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selected, setSelected] = useState<string>('Все');
  const [loading, setLoading] = useState(true);

  // UI ошибки
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  const navigate = useNavigate();

  const loadData = async (opts?: { force?: boolean }) => {
    const force = !!opts?.force;
    try {
      setLoading(true);
      setError(null);

      // 1) читаем кэш (если не force)
      const cached = !force ? readCache<Teacher[]>(K_AUTHORS) : null;
      if (cached) {
        setTeachers(cached);
        setLoading(false);
        return;
      }

      // 2) тянем из Firestore
      const snap = await getDocs(collection(db, 'authors'));
      const list = snap.docs.map(
        (d: QueryDocumentSnapshot<DocumentData>) =>
          ({ id: d.id, ...(d.data() as any) })
      );

      setTeachers(list);
      writeCache(K_AUTHORS, list); // 3) обновим кэш
    } catch (e: any) {
      console.error('Ошибка загрузки authors:', e);
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

  // Формируем список тегов на лету из документов
  const tags = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach(t => (t.category || []).forEach(c => set.add(c)));
    return ['Все', ...Array.from(set).sort()];
  }, [teachers]);

  // Фильтрация
  const list = useMemo(() => {
    if (selected === 'Все') return teachers;
    return teachers.filter(t => (t.category || []).includes(selected));
  }, [teachers, selected]);

  // Навигация на страницу автора
  const openAuthor = useCallback((t: Teacher) => {
    const slug = t.simpId || t.id;
    navigate(`/author/${slug}`, { state: t });
  }, [navigate]);

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', pb: 9 }}>
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 1.5, sm: 2 }, pt: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', color: 'text.primary' }}>
          {/* Верхний алерт об ошибке */}
          <Collapse in={!!error}>
            <MUIAlert
              severity="error"
              variant="filled"
              sx={{ mb: 2, borderRadius: 2 }}
              action={
                <Chip
                  label={loading ? 'Загружаем…' : 'Повторить'}
                  onClick={() => loadData({ force: true })}   // форс-перезагрузка, минуя кэш
                  color="default"
                  sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 700 }}
                />
              }
            >
              {error}
            </MUIAlert>
          </Collapse>

          {/* Чип-фильтры */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.25,
              overflowX: 'auto',
              pb: 1,
              '::-webkit-scrollbar': { display: 'none' },
              mb: 2,
              opacity: loading && !error ? 0.8 : 1,
            }}
          >
            {(loading && tags.length === 1 ? ['Все', '...'] : tags).map(tag => (
              <Chip
                key={tag}
                label={tag}
                clickable
                onClick={() => setSelected(tag)}
                sx={{
                  px: 1.75,
                  py: 0.5,
                  borderRadius: '999px',
                  bgcolor: selected === tag ? '#F97316' : 'transparent',
                  color: selected === tag ? '#fff' : 'inherit',
                  border: selected === tag ? 'none' : '1px solid #E5E9EF',
                  fontWeight: 600,
                }}
              />
            ))}
          </Box>

          {/* Сетка карточек авторов */}
          {loading && !teachers.length ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>Загружаем авторов…</Typography>
            </Stack>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 3, md: 4 },
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                alignItems: 'start',
              }}
            >
              {list.map(t => (
                <ButtonBase
                  key={t.id}
                  focusRipple
                  onClick={() => openAuthor(t)}
                  sx={{
                    width: '100%',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 3,
                    p: 1,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                  }}
                >
                  <Avatar
                    alt={t.name}
                    src={t.imgurl || t.photo}
                    sx={{
                      width: { xs: 140, md: 160 },
                      height: { xs: 140, md: 160 },
                      mb: 1.25,
                    }}
                  />
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: 18, md: 20 },
                      textAlign: 'center',
                    }}
                  >
                    {t.name}
                  </Typography>
                </ButtonBase>
              ))}
            </Box>
          )}
        </Box>
      </Container>

      {/* Нижняя навигация (контейнер, как в макете) */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          borderTopLeftRadius: 16, borderTopRightRadius: 16,
        }}
      />

      {/* Snackbar для ошибок */}
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
