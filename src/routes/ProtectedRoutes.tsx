import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import Spinner from '../components/ui/Spinner';

export default function ProtectedRoutes() {
  const { authUser, loading } = useAuth();

  if (loading) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        <Spinner />
      </div>
    );
  }

  return authUser ? <Outlet /> : <Navigate to='/login' replace />;
}
