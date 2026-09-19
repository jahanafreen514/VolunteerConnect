import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Search, FileText, Award, Star, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';

const links = [
  { label: 'Dashboard', path: '/volunteer/dashboard', icon: LayoutDashboard },
  { label: 'Profile', path: '/volunteer/profile', icon: User },
  { label: 'Opportunities', path: '/opportunities', icon: Search },
  { label: 'Applications', path: '/volunteer/applications', icon: FileText },
  { label: 'Participation', path: '/volunteer/participation', icon: Award },
  { label: 'Certificates', path: '/volunteer/certificates', icon: Star },
  { label: 'Notifications', path: '/volunteer/notifications', icon: Bell },
];

const VolunteerSidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <div className="h-full flex flex-col w-64 bg-gray-900/50 backdrop-blur-xl border-r border-white/10">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} size="md" />
          <div className="overflow-hidden">
            <h3 className="text-white font-medium truncate">{user?.name}</h3>
            <p className="text-xs text-gray-400 truncate">Volunteer</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={onNavigate}
            className={({ isActive }) => `
              flex items-center px-3 py-2.5 rounded-xl transition-all
              ${isActive 
                ? 'bg-white/10 text-white shadow-sm border-l-2 border-primary-500' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <link.icon className="w-5 h-5 mr-3 shrink-0" />
            <span className="font-medium text-sm">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default VolunteerSidebar;
