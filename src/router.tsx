import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './layout/RootLayout';
// import AuthGuard from './layout/AuthGuard';
import Loading from './ui/Loading';
import { lazy, Suspense } from 'react';

const HomePage    = lazy(() => import('./features/HomePage'));


export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Suspense fallback={<Loading />}><HomePage/></Suspense> },
    ],
  },
]);
