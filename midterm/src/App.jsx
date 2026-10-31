import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from './components/RootLayout';


const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const ItemsList = lazy(() => import('./pages/ItemsList'));
const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'items', element: <ItemsList /> },
      { path: 'items/:id', element: <ItemDetails /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'login', element: <Login /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], {
  // Динамический basename: локально пустая строка, для продакшна (GitHub Pages) — '/PC-Builder/'
  basename: import.meta.env.DEV ? '' : '/PC-Builder/'
});

export function App() {
  return (
    <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Loading page...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;