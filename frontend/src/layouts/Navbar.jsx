import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Menu, X, LogOut, User, Bell, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useScrollPosition } from '../hooks/useScrollPosition';
import Avatar from '../components/ui/Avatar';
import NotificationDropdown from '../components/NotificationDropdown';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const scrollY = useScrollPosition();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isScrolled = scrollY > 15;

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) {
      return [
        { label: 'Home', path: '/' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' },
      ];
    }
    switch (user.role) {
      case 'volunteer':
        return [
          { label: 'Dashboard', path: '/volunteer/dashboard' },
          { label: 'Opportunities', path: '/opportunities' },
          { label: 'Applications', path: '/volunteer/applications' },
          { label: 'Participation', path: '/volunteer/participation' },
          { label: 'Certificates', path: '/volunteer/certificates' },
        ];
      case 'ngo':
        return [
          { label: 'Dashboard', path: '/ngo/dashboard' },
          { label: 'Opportunities', path: '/ngo/opportunities' },
          { label: 'Applications', path: '/ngo/applications' },
          { label: 'Attendance', path: '/ngo/attendance' },
          { label: 'Organization Profile', path: '/ngo/profile' },
        ];
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'NGOs', path: '/admin/ngos' },
          { label: 'Users', path: '/admin/users' },
          { label: 'Opportunities', path: '/admin/opportunities' },
          { label: 'Reports', path: '/admin/reports' },
          { label: 'Analytics', path: '/admin/analytics' },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-2.5 shadow-soft-sm' 
          : 'py-3.5'
      }`}
      style={{
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(230, 232, 236, 0.85)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#BFD8C2] border border-[#AFCDB5] flex items-center justify-center shadow-soft-sm group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 text-[#26372B] fill-[#9fc2a6]" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#26372B]">
              Volunteer<span className="text-[#556e5a]">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1.5" aria-label="Main Navigation">
            {links.map((link) => {
              const isHash = link.path.includes('#');
              const isActive = !isHash && (location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path)));
              
              if (isHash) {
                return (
                  <a
                    key={link.label}
                    href={link.path}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#354052] hover:text-[#26372B] hover:bg-black/[0.04] transition-all"
                  >
                    {link.label}
                  </a>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#BFD8C2]/45 text-[#26372B] font-semibold border border-[#AFCDB5]/60 shadow-soft-sm' 
                      : 'text-[#354052] hover:text-[#26372B] hover:bg-black/[0.03]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <NotificationDropdown />
                
                {/* Profile menu */}
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-black/[0.04] border border-[#E6E8EC] transition-all focus:outline-none"
                    aria-label="User profile options"
                  >
                    <Avatar name={user.name} size="sm" />
                    <ChevronDown className={`w-3.5 h-3.5 text-[#667085] transition-transform mr-1 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-2xl border border-[#E6E8EC] rounded-2xl shadow-soft-lg py-2 z-50 overflow-hidden text-left"
                      >
                        <div className="px-4 py-3 border-b border-[#E6E8EC] bg-[#FFF8EF]/40">
                          <p className="text-sm font-bold text-[#26372B] truncate">{user.name}</p>
                          <p className="text-xs text-[#667085] truncate">{user.email}</p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3]">
                            {user.role}
                          </span>
                        </div>

                        <Link 
                          to={`/${user.role}/profile`} 
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-xs sm:text-sm text-[#354052] hover:bg-black/[0.03] hover:text-[#26372B] transition-colors"
                        >
                          <User className="w-4 h-4 mr-2.5 text-[#667085]" />
                          <span>My Profile</span>
                        </Link>

                        <div className="border-t border-[#E6E8EC] my-1"></div>

                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-xs sm:text-sm text-[#8C3B4A] hover:bg-[#F2D6DD]/40 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2.5" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#354052] hover:text-[#26372B] hover:bg-black/[0.04] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary-pastel inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {user && <NotificationDropdown />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white/80 border border-[#E6E8EC] text-[#354052] hover:text-[#26372B] focus:outline-none shadow-soft-sm"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-[#E6E8EC] px-4 pt-3 pb-6 space-y-3 overflow-hidden shadow-soft-lg"
          >
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FFF8EF]/50 border border-[#E6E8EC] mb-3">
                <Avatar name={user.name} size="md" />
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-[#26372B] truncate">{user.name}</p>
                  <p className="text-xs text-[#556e5a] capitalize font-medium">{user.role}</p>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {links.map((link) => {
                const isHash = link.path.includes('#');
                const isActive = !isHash && (location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path)));
                
                if (isHash) {
                  return (
                    <a
                      key={link.label}
                      href={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 rounded-xl text-sm font-medium text-[#354052] hover:text-[#26372B] hover:bg-black/[0.03]"
                    >
                      {link.label}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-xl text-sm font-medium ${
                      isActive 
                        ? 'bg-[#BFD8C2]/45 text-[#26372B] font-semibold border border-[#AFCDB5]/60' 
                        : 'text-[#354052] hover:text-[#26372B] hover:bg-black/[0.03]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {user && (
                <Link
                  to={`/${user.role}/profile`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-xl text-sm font-medium text-[#354052] hover:text-[#26372B] hover:bg-black/[0.03]"
                >
                  My Profile
                </Link>
              )}
            </div>

            <div className="pt-3 border-t border-[#E6E8EC]">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#8C3B4A] bg-[#F2D6DD]/40 hover:bg-[#F2D6DD]/70 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-[#354052] bg-white border border-[#E6E8EC] hover:bg-[#FFF8EF]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-primary-pastel flex items-center justify-center px-4 py-2.5 rounded-xl text-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
