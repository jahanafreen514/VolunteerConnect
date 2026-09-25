import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Search, FileText, Award, Star, Bell, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../context/ThemeContext';
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
    <div className="h-full flex flex-col w-56 sm:w-60 bg-white/90 dark:bg-[#0a0f20]/90 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/10 shadow-lg dark:shadow-2xl">
      <div className="p-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Avatar name={user?.name} size="sm" />
          <div className="overflow-hidden">
            <h3 className="text-slate-900 dark:text-white font-semibold text-xs sm:text-sm truncate">{user?.name || 'Volunteer'}</h3>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-md bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-500/30">
              Volunteer
            </span>
          </div>
        </div>

        {handleClose && (
          <button
            onClick={handleClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 shrink-0 ml-1"
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
                ? 'bg-primary-50 dark:bg-gradient-to-r dark:from-primary-500/20 dark:to-primary-600/10 text-primary-700 dark:text-white border-l-4 border-primary-500 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'}
            `}
          >
            <link.icon className="w-4 h-4 mr-2.5 shrink-0" />
            <span className="truncate">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200/80 dark:border-white/10 shrink-0 flex items-center justify-between gap-2">
        <button
          onClick={logout}
          className="flex items-center flex-1 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-xs sm:text-sm font-medium"
        >
          <LogOut className="w-4 h-4 mr-2.5 shrink-0" />
          <span>Sign Out</span>
        </button>
        <ThemeToggle size="sm" />
      </div>
    </div>
  );
};

export default VolunteerSidebar;
