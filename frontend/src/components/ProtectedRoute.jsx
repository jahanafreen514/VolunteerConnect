import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ role }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && user.role !== role) {
    const map = { volunteer: '/volunteer/dashboard', ngo: '/ngo/dashboard', admin: '/admin/dashboard' };
    return <Navigate to={map[user.role] || '/'} replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
