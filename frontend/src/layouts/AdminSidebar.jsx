import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Users, Briefcase, Flag, BarChart3, LogOut, Shield, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'NGO Verifications', path: '/admin/ngos', icon: ShieldCheck },
  { label: 'User Directory', path: '/admin/users', icon: Users },
  { label: 'Manage Opportunities', path: '/admin/opportunities', icon: Briefcase },
  { label: 'Inquiry & Reports', path: '/admin/reports', icon: Flag },
  { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
];

const AdminSidebar = ({ onNavigate, onClose }) => {
  const { user, logout } = useAuth();
  const handleClose = onClose || onNavigate;

  return (
    <div className="h-full flex flex-col w-56 sm:w-60 bg-[#050a1e]/85 backdrop-blur-2xl border-r border-white/10 shadow-2xl">
      <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase truncate">
              Admin Console
            </h2>
            <p className="text-[10px] text-gray-400 truncate">{user?.name || 'Administrator'}</p>
          </div>
        </div>

        {handleClose && (
          <button
            onClick={handleClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 shrink-0 ml-1"
            aria-label="Close admin sidebar"
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
                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border-l-4 border-amber-500 shadow-sm' 
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

export default AdminSidebar;
