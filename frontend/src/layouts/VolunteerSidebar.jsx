import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Search, FileText, Award, Star, Bell, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';

const links = [
  { label: 'Dashboard', path: '/volunteer/dashboard', icon: LayoutDashboard },
  { label: 'Explore Opportunities', path: '/opportunities', icon: Search },
  { label: 'My Applications', path: '/volunteer/applications', icon: FileText },
  { label: 'Participation', path: '/volunteer/participation', icon: Award },
  { label: 'Certificates', path: '/volunteer/certificates', icon: Star },
  { label: 'Notifications', path: '/volunteer/notifications', icon: Bell },
  { label: 'My Profile', path: '/volunteer/profile', icon: User },
];

const VolunteerSidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <div className="h-full flex flex-col w-64 bg-gray-950/80 backdrop-blur-2xl border-r border-white/10">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} size="md" />
          <div className="overflow-hidden">
            <h3 className="text-white font-semibold text-sm truncate">{user?.name || 'Volunteer'}</h3>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-primary-500/20 text-primary-300 border border-primary-500/30">
              Volunteer
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={onNavigate}
            className={({ isActive }) => `
              flex items-center px-3.5 py-2.5 rounded-xl transition-all font-medium text-sm
              ${isActive 
                ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/10 text-white border-l-4 border-primary-500 shadow-glow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <link.icon className="w-4 h-4 mr-3 shrink-0" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center w-full px-3.5 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default VolunteerSidebar;
