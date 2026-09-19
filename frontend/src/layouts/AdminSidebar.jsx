import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Users, Briefcase, Flag, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'NGO Verification', path: '/admin/ngos', icon: ShieldCheck },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Opportunities', path: '/admin/opportunities', icon: Briefcase },
  { label: 'Reports', path: '/admin/reports', icon: Flag },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
];

const AdminSidebar = ({ onNavigate }) => {
  const { logout } = useAuth();

  return (
    <div className="h-full flex flex-col w-64 bg-gray-900/80 backdrop-blur-xl border-r border-white/10">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 uppercase tracking-wider">
          Admin Panel
        </h2>
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
                ? 'bg-red-500/10 text-white shadow-sm border-l-2 border-red-500' 
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

export default AdminSidebar;
