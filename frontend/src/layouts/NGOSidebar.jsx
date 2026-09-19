import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Briefcase, Users, ClipboardCheck, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../services/ngoService';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';

const links = [
  { label: 'Dashboard', path: '/ngo/dashboard', icon: LayoutDashboard },
  { label: 'Organization Profile', path: '/ngo/profile', icon: User },
  { label: 'Manage Opportunities', path: '/ngo/opportunities', icon: Briefcase },
  { label: 'Volunteer Applications', path: '/ngo/applications', icon: Users },
  { label: 'Attendance Management', path: '/ngo/attendance', icon: ClipboardCheck },
];

const NGOSidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [ngoData, setNgoData] = useState(null);

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
    <div className="h-full flex flex-col w-64 bg-gray-950/80 backdrop-blur-2xl border-r border-white/10">
      <div className="p-6 border-b border-white/10 flex flex-col items-center text-center">
        <Avatar src={ngoData?.logo} name={user?.name} size="lg" className="mb-3 ring-2 ring-primary-500/30" />
        <h3 className="text-white font-semibold text-sm w-full truncate">{user?.name || 'NGO Partner'}</h3>
        <div className="mt-2">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
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
                ? 'bg-gradient-to-r from-secondary-500/20 to-secondary-600/10 text-white border-l-4 border-secondary-500 shadow-glow-cyan' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <link.icon className="w-4 h-4 mr-3 shrink-0" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        {verificationStatus === 'approved' && (
          <NavLink
            to="/ngo/opportunities/create"
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Opportunity</span>
          </NavLink>
        )}

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

export default NGOSidebar;
