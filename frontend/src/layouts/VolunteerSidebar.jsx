import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Search, FileText, Award, Star, Bell, LogOut, X, HeartHandshake } from 'lucide-react';
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
    <div className="h-full flex flex-col w-56 sm:w-60 bg-white/90 backdrop-blur-2xl border-r border-[#E6E8EC] shadow-soft-sm">
      <div className="p-4 border-b border-[#E6E8EC] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Avatar name={user?.name} size="sm" />
          <div className="overflow-hidden">
            <h3 className="text-[#354052] font-semibold text-xs sm:text-sm truncate">{user?.name || 'Volunteer'}</h3>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-md bg-[#BFD8C2]/40 text-[#26372B] border border-[#BFD8C2]">
              Volunteer
            </span>
          </div>
        </div>

        {handleClose && (
          <button
            onClick={handleClose}
            className="lg:hidden p-1.5 rounded-lg text-[#667085] hover:text-[#354052] hover:bg-[#F5F1FA] shrink-0 ml-1"
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
                ? 'bg-[#BFD8C2]/35 text-[#26372B] font-semibold border-l-4 border-[#8fad95] shadow-soft-sm' 
                : 'text-[#667085] hover:text-[#354052] hover:bg-[#F5F1FA]'}
            `}
          >
            <link.icon className="w-4 h-4 mr-2.5 shrink-0" />
            <span className="truncate">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-[#E6E8EC] shrink-0 flex items-center justify-between gap-2">
        <button
          onClick={logout}
          className="flex items-center flex-1 px-3 py-2 rounded-xl text-[#9B5B65] hover:bg-[#F2D6DD]/40 transition-colors text-xs sm:text-sm font-medium"
        >
          <LogOut className="w-4 h-4 mr-2.5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default VolunteerSidebar;
