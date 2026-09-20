import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Search, FileText, Award, Star, Bell, LogOut, Heart, X } from 'lucide-react';
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

const VolunteerSidebar = ({ onNavigate, onClose }) => {
  const { user, logout } = useAuth();
  const handleClose = onClose || onNavigate;

  return (
    <div className="h-full flex flex-col w-56 sm:w-60 bg-[#050a1e]/85 backdrop-blur-2xl border-r border-white/10 shadow-2xl">
      <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Avatar name={user?.name} size="sm" />
          <div className="overflow-hidden">
            <h3 className="text-white font-semibold text-xs sm:text-sm truncate">{user?.name || 'Volunteer'}</h3>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-md bg-primary-500/20 text-primary-300 border border-primary-500/30">
              Volunteer
            </span>
          </div>
        </div>

        {handleClose && (
          <button
            onClick={handleClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 shrink-0 ml-1"
            aria-label="Close volunteer sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1 custom-scrollbar">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={onNavigate}
            className={({ isActive }) => `
              flex items-center px-3 py-2 rounded-xl transition-all font-medium text-xs sm:text-sm
              ${isActive 
                ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/10 text-white border-l-4 border-primary-500 shadow-glow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <link.icon className="w-4 h-4 mr-2.5 shrink-0" />
            <span className="truncate">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 shrink-0">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-xs sm:text-sm font-medium"
        >
          <LogOut className="w-4 h-4 mr-2.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default VolunteerSidebar;
