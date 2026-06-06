// src/shell/AppShell.tsx
import { Outlet, useLocation, useNavigate, matchPath } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import React from 'react'; 
import { useAuth } from '../auth/AuthProvider';

const ORANGE   = '#F97316';
const BASE_ICON = '#334155';    // базовый цвет остальных иконок (вместо серого)

type Tab = {
  label: string;
  icon: React.ReactNode;
  path: string;
  selectedColor?: string;
  baseColor?: string;
};

const tabs: Tab[] = [
  { label: 'Главная', icon: <HomeRoundedIcon />, path: '/',        baseColor: BASE_ICON },
  { label: 'Видео',   icon: <PlayCircleOutlineRoundedIcon />, path: '/videos', baseColor: BASE_ICON },
  { label: 'Авторы',  icon: <EditNoteRoundedIcon />, path: '/notes',  baseColor: BASE_ICON },
  { label: 'Профиль', icon: <PersonOutlineRoundedIcon />, path: '/profile', baseColor: BASE_ICON },
];

const HIDE_NAV_ON = [
  '/forgot-password', '/landing',
  '/my-course', '/my-cert', '/support', '/links'
];

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const hideNav = HIDE_NAV_ON.some((p) => matchPath(p, location.pathname));
  const authPage = location.pathname === '/login' || location.pathname === '/register';
  const value = authPage
    ? tabs.findIndex((t) => t.path === '/profile')
    : Math.max(0, tabs.findIndex((t) => t.path === location.pathname));

  return (
    <>
      {!hideNav && (
        <Paper elevation={8} sx={{ position: 'sticky', top: 0, zIndex: 1200 }}>
          <BottomNavigation
            showLabels
            value={value}
            onChange={(_, v) => {
              const path = tabs[v].path;
              navigate(path === '/profile' && !user ? '/register' : path);
            }}
          >
            {tabs.map((t) => (
              <BottomNavigationAction
                key={t.path}
                icon={t.icon}
                label={t.label}
                sx={{
                  // базовый (невыбранный) цвет более контрастный
                  color: t.baseColor ?? BASE_ICON,
                  '& .MuiSvgIcon-root': { color: 'inherit' },
                  '&.Mui-selected': {
                    color: t.selectedColor ?? ORANGE,
                    bgcolor: (t.selectedColor
                      ? `${t.selectedColor}1A` // ~10% подложка для премиум
                      : `${ORANGE}14`          // ~8% подложка для остальных
                    ),
                    borderRadius: 2,
                  },
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}

      <Outlet />
    </>
  );
}
