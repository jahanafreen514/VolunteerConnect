import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Briefcase, Users, ClipboardCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../services/ngoService';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';

const links = [
  { label: 'Dashboard', path: '/ngo/dashboard', icon: LayoutDashboard },
  { label: 'Profile', path: '/ngo/profile', icon: User },
  { label: 'Opportunities', path: '/ngo/opportunities', icon: Briefcase },
  { label: 'Applications', path: '/ngo/applications', icon: Users },
  { label: 'Attendance', path: '/ngo/attendance', icon: ClipboardCheck },
];

const NGOSidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [ngoData, setNgoData] = useState(null);

  useEffect(() => {
    getMyProfile().then(data => setNgoData(data)).catch(() => {});
  }, []);

  const verificationStatus = ngoData?.verificationStatus || 'pending';
  const badgeConfig = {
    pending: { variant: 'warning', label: 'Pending Verification' },
    approved: { variant: 'success', label: 'Verified NGO' },
    rejected: { variant: 'error', label: 'Verification Rejected' }
  };
  const statusConfig = badgeConfig[verificationStatus] || badgeConfig.pending;

  return (
    <div className="h-full flex flex-col w-64 bg-gray-900/50 backdrop-blur-xl border-r border-white/10">
      <div className="p-6 border-b border-white/10 flex flex-col items-center text-center">
        <Avatar src={ngoData?.logo} name={user?.name} size="lg" className="mb-3" />
        <h3 className="text-white font-medium w-full truncate">{user?.name}</h3>
        <div className="mt-2">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
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

export default NGOSidebar;
