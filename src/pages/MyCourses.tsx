import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Paper,
  Stack,
  Avatar,
  CircularProgress,
  useMediaQuery,
  Button,
} from '@mui/material';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// ===============================
//            TYPES
// ===============================
export type Course = {
  id: string;
  imgUrl?: string;
  courseName: string;
  seasonNum?: number;
  simpId?: string;
  simpid?: string; // на случай опечатки
  [k: string]: any;
};

const getSimp = (c: Course) => c.simpId || c.simpid || c.id;

// ===============================
//        SAFE LOCAL STORAGE
// ===============================
const safeStorage = {
  getItem(key: string) {
    try { return window?.localStorage?.getItem(key) ?? null; } catch { return null; }
  },
  setItem(key: string, value: string) {
    try { window?.localStorage?.setItem(key, value); } catch {}
  },
  removeItem(key: string) {
    try { window?.localStorage?.removeItem(key); } catch {}
  },
};

// ===============================
//            ZUSTAND
// ===============================
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

// --- Главный стор с курсами ---
type MainCoursesState = {
  courses: Course[];
  loading: boolean;
  error: string | null;
  setCourses: (cs: Course[]) => void;
  clearCourses: () => void;
};

export const useMainCoursesStore = create<MainCoursesState>()(
  devtools((set) => ({
    courses: [],
    loading: false,
    error: null,
    setCourses: (cs) => set({ courses: cs }),
    clearCourses: () => set({ courses: [] }),
  }))
);

// --- Понравившиеся ---
type LikedState = {
  likedCourses: string[]; // simpId[]
  toggleLikedCourse: (simpId: string) => void;
  isLiked: (simpId: string) => boolean;
  fetchLikedCourses: () => Promise<void>; // совместимость с RN
  clearLikes: () => void;
};

export const useLikedCoursesStore = create<LikedState>()(
  devtools(
    persist(
      (set, get) => ({
        likedCourses: [],
        toggleLikedCourse: (simpId) => {
          const setNew = new Set(get().likedCourses);
          setNew.has(simpId) ? setNew.delete(simpId) : setNew.add(simpId);
          set({ likedCourses: Array.from(setNew) });
        },
        isLiked: (simpId) => get().likedCourses.includes(simpId),
        fetchLikedCourses: async () => { /* persist сам подтянет */ },
        clearLikes: () => set({ likedCourses: [] }),
      }),
      {
        name: 'likedCourses',
        storage: createJSONStorage(() => safeStorage as unknown as Storage),
      }
    )
  )
);

// --- Доступные ---
type AvailableState = {
  availableCourses: string[]; // simpId[]
  toggleAvailableCourse: (simpId: string) => void;
  fetchAvailableCourses: () => Promise<void>;
  clearAvailable: () => void;
};

export const useAvailableCoursesStore = create<AvailableState>()(
  devtools(
    persist(
      (set, get) => ({
        availableCourses: [],
        toggleAvailableCourse: (simpId) => {
          const setNew = new Set(get().availableCourses);
          setNew.has(simpId) ? setNew.delete(simpId) : setNew.add(simpId);
          set({ availableCourses: Array.from(setNew) });
        },
        fetchAvailableCourses: async () => {},
        clearAvailable: () => set({ availableCourses: [] }),
      }),
      {
        name: 'availableCourses',
        storage: createJSONStorage(() => safeStorage as unknown as Storage),
      }
    )
  )
);

// --- Законченные ---
type FinishedState = {
  finishedCourses: string[]; // simpId[]
  toggleFinishedCourse: (simpId: string) => void;
  fetchFinishedCourses: () => Promise<void>;
  clearFinished: () => void;
};

export const useFinishedCoursesStore = create<FinishedState>()(
  devtools(
    persist(
      (set, get) => ({
        finishedCourses: [],
        toggleFinishedCourse: (simpId) => {
          const setNew = new Set(get().finishedCourses);
          setNew.has(simpId) ? setNew.delete(simpId) : setNew.add(simpId);
          set({ finishedCourses: Array.from(setNew) });
        },
        fetchFinishedCourses: async () => {},
        clearFinished: () => set({ finishedCourses: [] }),
      }),
      {
        name: 'finishedCourses',
        storage: createJSONStorage(() => safeStorage as unknown as Storage),
      }
    )
  )
);

// --- Concrete ---
type ConcreteState = {
  concreteCourses: string[]; // simpId[]
  toggleConcreteCourse: (simpId: string) => void;
  fetchConcreteCourses: () => Promise<void>;
  clearConcrete: () => void;
};

export const useConcreteCoursesStore = create<ConcreteState>()(
  devtools(
    persist(
      (set, get) => ({
        concreteCourses: [],
        toggleConcreteCourse: (simpId) => {
          const setNew = new Set(get().concreteCourses);
          setNew.has(simpId) ? setNew.delete(simpId) : setNew.add(simpId);
          set({ concreteCourses: Array.from(setNew) });
        },
        fetchConcreteCourses: async () => {},
        clearConcrete: () => set({ concreteCourses: [] }),
      }),
      {
        name: 'concreteCourses',
        storage: createJSONStorage(() => safeStorage as unknown as Storage),
      }
    )
  )
);

// ===============================
//        UI КОМПОНЕНТ
// ===============================
const ORANGE = '#F97316';

function a11yProps(index: number) {
  return {
    id: `myworkouts-tab-${index}`,
    'aria-controls': `myworkouts-tabpanel-${index}`,
  };
}

const RowCard: React.FC<{
  item: Course;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
}> = ({ item, rightIcon, onClick }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      width: '100%',
      borderRadius: 2,
      p: 1,
      bgcolor: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Avatar
        variant="rounded"
        src={item.imgUrl}
        sx={{ width: 62, height: 62, borderRadius: 1.2 }}
      />
      <Stack spacing={0.5}>
        <Typography sx={{ fontWeight: 800, fontSize: 15.5, lineHeight: 1.2 }}>
          {item.courseName}
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: '#404B52' }}>
          {item.seasonNum ?? '—'} сезон
        </Typography>
      </Stack>
    </Stack>

    {rightIcon ?? (
      <CheckCircleRoundedIcon sx={{ color: ORANGE, flexShrink: 0 }} />
    )}
  </Paper>
);

const TabPanel: React.FC<{ value: number; index: number; children: React.ReactNode }> = ({ value, index, children }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`myworkouts-tabpanel-${index}`}
      aria-labelledby={`myworkouts-tab-${index}`}
      style={{ width: '100%' }}
    >
      {value === index && <Box sx={{ pt: 1 }}>{children}</Box>}
    </div>
  );
};

type Props = {
  /** можно сразу прокинуть список курсов; если не передашь — оставь пусто и заполни сто́р где-то ещё */
  initialCourses?: Course[];
  /** показать в шапке кнопки для быстрой демонстрации (добавить/очистить списки) */
  demoActions?: boolean;
};

const MyWorkoutsWeb: React.FC<Props> = ({ initialCourses, demoActions = false }) => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // курсы
  const courses = useMainCoursesStore((s) => s.courses);
  const setCourses = useMainCoursesStore((s) => s.setCourses);

  // сто́ры статусов
  const { likedCourses, fetchLikedCourses, toggleLikedCourse, clearLikes } = useLikedCoursesStore();
  const { finishedCourses, fetchFinishedCourses, toggleFinishedCourse, clearFinished } = useFinishedCoursesStore();
  const { availableCourses, fetchAvailableCourses, toggleAvailableCourse, clearAvailable } = useAvailableCoursesStore();
  const { concreteCourses, fetchConcreteCourses, toggleConcreteCourse, clearConcrete } = useConcreteCoursesStore();

  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // инициализируем курсы, если пришли через проп
  useEffect(() => {
    if (initialCourses?.length) setCourses(initialCourses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCourses]);

  // подгрузим persist-состояния
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchLikedCourses?.(),
          fetchFinishedCourses?.(),
          fetchAvailableCourses?.(),
          fetchConcreteCourses?.(),
        ]);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // списки
  const historyList = useMemo(() => {
    const ids = new Set<string>([...(availableCourses || []), ...(concreteCourses || [])]);
    return courses.filter((c) => ids.has(getSimp(c)));
  }, [availableCourses, concreteCourses, courses]);

  const favouritesList = useMemo(() => {
    const ids = new Set<string>(likedCourses || []);
    return courses.filter((c) => ids.has(getSimp(c)));
  }, [likedCourses, courses]);

  const finishedList = useMemo(() => {
    const ids = new Set<string>(finishedCourses || []);
    return courses.filter((c) => ids.has(getSimp(c)));
  }, [finishedCourses, courses]);

  const renderList = (items: Course[]) => {
    if (loading) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
          <CircularProgress />
          <Typography sx={{ mt: 1.5, color: 'text.secondary' }}>
            Загружаем…
          </Typography>
        </Stack>
      );
    }

    if (!items.length) {
      return (
        <Paper
        elevation={0}
        sx={{
            p: 2,
            borderRadius: 2,
            textAlign: 'center',
            color: '#64748B',
            fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
            fontWeight: 600,
            letterSpacing: 0.2,
        }}
        >
        Пока пусто.
        </Paper>

      );
    }

    return (
      <Stack spacing={1.25}>
        {items.map((item) => (
          <RowCard
            key={item.id}
            item={item}
            onClick={() => navigate(`/course/${getSimp(item)}`, { state: item })}
          />
        ))}
      </Stack>
    );
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh' }}>
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }, boxShadow: 1 }}
            >
              <ArrowBackIosNewRoundedIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                Мои курсы
            </Typography>

            <Box sx={{ width: 40, height: 40 }} />
          </Stack>

          {/* (опционально) демо-кнопки для быстрого наполнения списков */}
          {demoActions && (
            <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
              <Button size="small" variant="outlined" onClick={() => clearLikes()}>Очистить лайки</Button>
              <Button size="small" variant="outlined" onClick={() => clearFinished()}>Очистить завершённые</Button>
              <Button size="small" variant="outlined" onClick={() => clearAvailable()}>Очистить доступные</Button>
              <Button size="small" variant="outlined" onClick={() => clearConcrete()}>Очистить concrete</Button>
              {/* пример тумблеров над первым курсом */}
              {courses[0] && (
                <>
                  <Button size="small" onClick={() => toggleLikedCourse(getSimp(courses[0]))}>★ Лайк/Анлайк 1</Button>
                  <Button size="small" onClick={() => toggleFinishedCourse(getSimp(courses[0]))}>✓ Завершить/отменить 1</Button>
                  <Button size="small" onClick={() => toggleAvailableCourse(getSimp(courses[0]))}>✓ Доступный 1</Button>
                  <Button size="small" onClick={() => toggleConcreteCourse(getSimp(courses[0]))}>✓ Concrete 1</Button>
                </>
              )}
            </Stack>
          )}

          {/* Tabs */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              p: 0.5,
              bgcolor: '#fff',
              mb: 2,
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant={isSm ? 'fullWidth' : 'standard'}
              TabIndicatorProps={{ style: { display: 'none' } }}
              sx={{
                minHeight: 0,
                '& .MuiTab-root': {
                  minHeight: 0,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 0.5,
                },
              }}
            >
              {['История', 'Понравившиеся', 'Законченные'].map((label, i) => (
                <Tab
                  key={label}
                  label={
                    <Box
                      sx={{
                        bgcolor: tab === i ? ORANGE : '#fff',
                        color: tab === i ? '#fff' : 'gray',
                        width: 117,
                        height: 30,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {label}
                    </Box>
                  }
                  {...a11yProps(i)}
                />
              ))}
            </Tabs>
          </Paper>

          {/* Panels */}
          <TabPanel value={tab} index={0}>
            {renderList(historyList)}
          </TabPanel>
          <TabPanel value={tab} index={1}>
            {renderList(favouritesList)}
          </TabPanel>
          <TabPanel value={tab} index={2}>
            {renderList(finishedList)}
          </TabPanel>
        </Box>
      </Container>
    </Box>
  );
};

export default MyWorkoutsWeb;
