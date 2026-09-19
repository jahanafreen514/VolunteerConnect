import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Menu, X, LogOut, User, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useScrollPosition } from '../hooks/useScrollPosition';
import Button from '../components/ui/Button';
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
      ];
    }
    switch (user.role) {
      case 'volunteer':
        return [
          { label: 'Dashboard', path: '/volunteer/dashboard' },
          { label: 'Opportunities', path: '/opportunities' },
          { label: 'Applications', path: '/volunteer/applications' },
        ];
      case 'ngo':
        return [
          { label: 'Dashboard', path: '/ngo/dashboard' },
          { label: 'Opportunities', path: '/ngo/opportunities' },
          { label: 'Applications', path: '/ngo/applications' },
        ];
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'NGOs', path: '/admin/ngos' },
          { label: 'Users', path: '/admin/users' },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-purple-400">
              VolunteerConnect
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <NotificationDropdown />
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center focus:outline-none"
                  >
                    <Avatar name={user.name} size="sm" />
                  </button>
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl py-1 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-2 border-b border-white/10 mb-1">
                          <p className="text-sm font-medium text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <Link to={`/${user.role}/profile`} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">
                          <User className="w-4 h-4 mr-2" /> Profile
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-white/5">
                          <LogOut className="w-4 h-4 mr-2" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Button onClick={() => navigate('/register')} size="sm">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            {user && <NotificationDropdown />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-900 border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
              {!user ? (
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
                  <Button variant="secondary" onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="w-full">
                    Sign In
                  </Button>
                  <Button onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }} className="w-full">
                    Sign Up
                  </Button>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center px-3 mb-4">
                    <Avatar name={user.name} size="md" className="mr-3" />
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Link to={`/${user.role}/profile`} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-white/5">
                    Logout
                  </button>
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
