import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Menu, X, LogOut, User, Lock, Bell, Sparkles, ChevronDown } from 'lucide-react';
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

  const isScrolled = scrollY > 20;

  // Close menus on route change
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
        { label: 'Opportunities', path: '/opportunities' },
        { label: 'How It Works', path: '/#how-it-works' },
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
    <nav 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-950/85 backdrop-blur-xl border-b border-white/10 py-3 shadow-glass' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-primary-600 via-secondary-500 to-accent-400 shadow-glow-sm group-hover:scale-105 transition-all">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center">
              Volunteer<span className="gradient-text">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {links.map((link) => {
              const isHash = link.path.includes('#');
              const isActive = !isHash && (location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path)));
              
              if (isHash) {
                return (
                  <a
                    key={link.label}
                    href={link.path}
                    className="px-3.5 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {link.label}
                  </a>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-primary-500/15 text-primary-300 border border-primary-500/30' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <NotificationDropdown />
                
                {/* Profile dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/5 border border-white/10 transition-all focus:outline-none"
                  >
                    <Avatar name={user.name} size="sm" />
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-primary-500/20 text-primary-300 border border-primary-500/30">
                            {user.role}
                          </span>
                        </div>

                        <Link 
                          to={`/${user.role}/profile`} 
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <User className="w-4 h-4 mr-2.5 text-gray-400" />
                          <span>My Profile</span>
                        </Link>

                        {user.role === 'volunteer' && (
                          <Link 
                            to="/volunteer/notifications" 
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <Bell className="w-4 h-4 mr-2.5 text-gray-400" />
                            <span>Notifications</span>
                          </Link>
                        )}

                        <div className="border-t border-white/10 my-1"></div>

                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 hover:opacity-95 shadow-glow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
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
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            className="lg:hidden bg-gray-950/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-6 space-y-3 overflow-hidden"
          >
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-3">
                <Avatar name={user.name} size="md" />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-primary-400 capitalize">{user.role}</p>
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
                      className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5"
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
                    className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${
                      isActive 
                        ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' 
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
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
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5"
                >
                  My Profile
                </Link>
              )}
            </div>

            <div className="pt-3 border-t border-white/10">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
