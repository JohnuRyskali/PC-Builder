import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './components/RootLayout';
import { ProtectedRoute } from './components/ProtectedRoute';


const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const ItemsList = lazy(() => import('./pages/ItemsList'));
const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const BuildSummaryPage = lazy(() => import('./pages/BuildSummaryPage'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Profile = lazy(() => import('./pages/Profile'));

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
      { path: 'signup', element: <Signup /> },
      { 
        path: 'profile', 
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ) 
},
      { path: 'summary', element: <BuildSummaryPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], {
  basename: '/PC-Builder'
});

export function App() {
  return (
    <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Loading page...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;