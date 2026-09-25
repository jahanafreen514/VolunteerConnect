import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Briefcase, Users, UserCheck, ClipboardCheck, PlusCircle, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../context/ThemeContext';
import { getMyProfile } from '../services/ngoService';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';

const links = [
  { label: 'Dashboard', path: '/ngo/dashboard', icon: LayoutDashboard },
  { label: 'Active Volunteers', path: '/ngo/volunteers', icon: UserCheck },
  { label: 'Volunteer Applications', path: '/ngo/applications', icon: Users },
  { label: 'Manage Opportunities', path: '/ngo/opportunities', icon: Briefcase },
  { label: 'Attendance Management', path: '/ngo/attendance', icon: ClipboardCheck },
  { label: 'Organization Profile', path: '/ngo/profile', icon: User },
];

const NGOSidebar = ({ onNavigate, onClose }) => {
  const { user, logout } = useAuth();
  const [ngoData, setNgoData] = useState(null);
  const handleClose = onClose || onNavigate;

  useEffect(() => {
    getMyProfile().then(res => {
      const data = res?.data !== undefined ? res.data : res;
      setNgoData(data);
    }).catch(() => {});
  }, []);

  const verificationStatus = ngoData?.verificationStatus || 'pending';
  const badgeConfig = {
    pending: { variant: 'warning', label: 'Pending Review' },
    approved: { variant: 'success', label: 'Verified NGO' },
    rejected: { variant: 'error', label: 'Review Rejected' }
  };
  const statusConfig = badgeConfig[verificationStatus] || badgeConfig.pending;

  return (
    <div className="h-full flex flex-col w-56 sm:w-60 bg-white/90 dark:bg-[#0a0f20]/90 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/10 shadow-lg dark:shadow-2xl">
      <div className="p-4 border-b border-slate-200/80 dark:border-white/10 relative flex flex-col items-center text-center shrink-0">
        {handleClose && (
          <button
            onClick={handleClose}
            className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
            aria-label="Close NGO sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <Avatar src={ngoData?.logo} name={user?.name} size="md" className="mb-2 ring-2 ring-primary-300 dark:ring-primary-500/30" />
        <h3 className="text-slate-900 dark:text-white font-semibold text-xs sm:text-sm w-full truncate">{user?.name || 'NGO Partner'}</h3>
        <div className="mt-1.5">
          <Badge variant={statusConfig.variant} className="text-[10px] px-2 py-0.5">{statusConfig.label}</Badge>
        </div>
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
                ? 'bg-secondary-50 dark:bg-gradient-to-r dark:from-secondary-500/20 dark:to-secondary-600/10 text-secondary-700 dark:text-white border-l-4 border-secondary-500 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'}
            `}
          >
            <link.icon className="w-4 h-4 mr-2.5 shrink-0" />
            <span className="truncate">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200/80 dark:border-white/10 space-y-2 shrink-0">
        <NavLink
          to="/ngo/opportunities/create"
          onClick={onNavigate}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-xs font-semibold shadow-glow-sm transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Create Opportunity</span>
        </NavLink>

        <div className="flex items-center justify-between gap-2 pt-1">
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
    </div>
  );
};

export default NGOSidebar;
