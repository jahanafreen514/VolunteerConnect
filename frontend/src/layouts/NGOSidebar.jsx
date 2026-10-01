import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Briefcase, Users, UserCheck, ClipboardCheck, PlusCircle, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
    <div className="h-full flex flex-col w-56 sm:w-60 bg-white/90 backdrop-blur-2xl border-r border-[#E6E8EC] shadow-soft-sm">
      <div className="p-4 border-b border-[#E6E8EC] relative flex flex-col items-center text-center shrink-0">
        {handleClose && (
          <button
            onClick={handleClose}
            className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg text-[#667085] hover:text-[#354052] hover:bg-[#F5F1FA]"
            aria-label="Close NGO sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <Avatar src={ngoData?.logo} name={user?.name} size="md" className="mb-2 ring-2 ring-[#DDD5F3]" />
        <h3 className="text-[#354052] font-semibold text-xs sm:text-sm w-full truncate">{user?.name || 'NGO Partner'}</h3>
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
                ? 'bg-[#DDD5F3]/35 text-[#30264A] font-semibold border-l-4 border-[#8e74d1] shadow-soft-sm' 
                : 'text-[#667085] hover:text-[#354052] hover:bg-[#F5F1FA]'}
            `}
          >
            <link.icon className="w-4 h-4 mr-2.5 shrink-0" />
            <span className="truncate">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-[#E6E8EC] space-y-2 shrink-0">
        <NavLink
          to="/ngo/opportunities/create"
          onClick={onNavigate}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl bg-[#AFCDB5] hover:bg-[#9ebfa5] text-[#26372B] text-xs font-semibold shadow-soft-sm transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Create Opportunity</span>
        </NavLink>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={logout}
            className="flex items-center flex-1 px-3 py-2 rounded-xl text-[#9B5B65] hover:bg-[#F2D6DD]/40 transition-colors text-xs sm:text-sm font-medium"
          >
            <LogOut className="w-4 h-4 mr-2.5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NGOSidebar;
