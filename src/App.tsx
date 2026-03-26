import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy } from 'react';

const Explore = lazy(() => import('./pages/Explore'));
const Camera = lazy(() => import('./pages/Camera'));
const Quests = lazy(() => import('./pages/Quests'));
const Map = lazy(() => import('./pages/Map'));
const Profile = lazy(() => import('./pages/Profile'));
import Layout from './layouts/Layout';
import Login from './pages/login';
import Register from './pages/Register.tsx';
import ProtectedRoutes from './routes/ProtectedRoutes.tsx';
import ErrorPage from './pages/ErrorPage';
import AuthProvider from './contexts/AuthContext/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const router = createBrowserRouter([
  { 
    path: '/', 
    element:  <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <ProtectedRoutes />,
        children: [
          { index: true, element: <Explore /> },
          { path: 'map', element: <Map /> },
          { path: 'camera', element: <Camera /> },
          { path: 'quests', element: <Quests /> },
          { path: 'profile', element: <Profile /> },
          { path: 'explore', element: <Explore /> },
        ]
      }
    ]
  },
  { path: '/login', element: <Login />},
  { path: '/register', element: <Register/>}
]);


const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router}/>
      </AuthProvider>
    </QueryClientProvider>
  );
}