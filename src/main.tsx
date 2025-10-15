// src/main.tsx (или ваш корневой файл)
// если это именно src/index.tsx, просто вставьте туда код ниже

import { createRoot } from 'react-dom/client';
import './index.css';
import HomePageWeb from './pages/Home';
import VideosPageWeb from './pages/VideoPage';
import NotesPageWeb from './pages/NotesPage';
import ProfilePageWeb from './pages/ProfilePage';
import Login from './pages/LoginPage';
import RegisterPage from './pages/Register';
import LandingPage from './pages/LandingPage';
import CoursePageWeb from './pages/CoursesPageWeb';
import { Route, Routes, Navigate, Outlet, useLocation, BrowserRouter } from 'react-router-dom';
import AppShell from './shell/AppShell';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import AuthorPageWeb from './pages/AuthorPage';
import MyWorkoutsWeb from './pages/MyCourses'
import CertificatesPageWeb from './pages/CertificatePage'
import SupportPageWeb from './pages/SupportPageWeb';
import PremiumPageWeb from './pages/PremiumPageWeb';
import NotFoundPageWeb from './pages/NotFoundPage';
import VimeoPlayer from './pages/VimeoPlayer'
import LinksPage from './pages/LinksPage'
// 🔒 Гард защищённых роутов
function ProtectedRoute() {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null; // можно поставить спиннер/скелетон

  return user
    ? <Outlet />
    : <Navigate to="/landing" replace state={{ from: loc.pathname }} />;
}

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Общий layout */}
        <Route element={<AppShell />}>
          {/* Защищённые страницы */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePageWeb />} />
            <Route path="/videos" element={<VideosPageWeb />} />
            <Route path="/notes" element={<NotesPageWeb />} />
            <Route path="/profile" element={<ProfilePageWeb />} />
            <Route path="/author/:authorSlug" element={<AuthorPageWeb />} />
            <Route path="/course/:simpId" element={<CoursePageWeb />} />
            <Route path="/course" element={<CoursePageWeb />} />
            <Route path="/my-course" element={<MyWorkoutsWeb />} />
            <Route path="/my-cert" element={<CertificatesPageWeb />} />
            <Route path="/support" element={<SupportPageWeb />} />
            <Route path="/premium" element={<PremiumPageWeb />} />
            <Route path="/video" element={<VimeoPlayer />} />
            <Route path="/video/:id" element={<VimeoPlayer />} />
            <Route path="*" element={<NotFoundPageWeb />} />
          </Route>

          {/* Публичные страницы */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/links" element={<LinksPage />} />

          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
