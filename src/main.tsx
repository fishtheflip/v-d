// src/main.tsx (или ваш корневой файл)
// если это именно src/index.tsx, просто вставьте туда код ниже

import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import './index.css';
import { Route, Routes, Navigate, Outlet, useLocation, BrowserRouter } from 'react-router-dom';
import AppShell from './shell/AppShell';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import Loading from './ui/Loading';

const HomePageWeb = lazy(() => import('./pages/Home'));
const VideosPageWeb = lazy(() => import('./pages/VideoPage'));
const NotesPageWeb = lazy(() => import('./pages/NotesPage'));
const ProfilePageWeb = lazy(() => import('./pages/ProfilePage'));
const Login = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Register'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CoursePageWeb = lazy(() => import('./pages/CoursesPageWeb'));
const AuthorPageWeb = lazy(() => import('./pages/AuthorPage'));
const MyWorkoutsWeb = lazy(() => import('./pages/MyCourses'));
const CertificatesPageWeb = lazy(() => import('./pages/CertificatePage'));
const SupportPageWeb = lazy(() => import('./pages/SupportPageWeb'));
const NotFoundPageWeb = lazy(() => import('./pages/NotFoundPage'));
const VimeoPlayer = lazy(() => import('./pages/VimeoPlayer'));
const LinksPage = lazy(() => import('./pages/LinksPage'));
// 🔒 Гард защищённых роутов
function ProtectedRoute() {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null; // можно поставить спиннер/скелетон

  return user
    ? <Outlet />
    : <Navigate to={loc.pathname === '/profile' ? '/register' : '/landing'} replace state={{ from: loc.pathname }} />;
}

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <BrowserRouter>
      <Suspense fallback={<Loading label="Загружаем..." minHeight={320} />}>
        <Routes>
          {/* Общий layout */}
          <Route element={<AppShell />}>
            {/* Публичный каталог и все видео */}
            <Route path="/" element={<HomePageWeb />} />
            <Route path="/videos" element={<VideosPageWeb />} />
            <Route path="/notes" element={<NotesPageWeb />} />
            <Route path="/author/:authorSlug" element={<AuthorPageWeb />} />
            <Route path="/course/:simpId" element={<CoursePageWeb />} />
            <Route path="/course" element={<CoursePageWeb />} />
            <Route path="/support" element={<SupportPageWeb />} />
            <Route path="/video" element={<VimeoPlayer />} />
            <Route path="/video/:id" element={<VimeoPlayer />} />

            {/* Персональные страницы требуют аккаунт */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePageWeb />} />
              <Route path="/my-course" element={<MyWorkoutsWeb />} />
              <Route path="/my-cert" element={<CertificatesPageWeb />} />
            </Route>

            {/* Публичные страницы */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/links" element={<LinksPage />} />
            <Route path="*" element={<NotFoundPageWeb />} />

            {/* Fallback */}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </AuthProvider>
);
