import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNowSafe } from '../utils/date';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../services/notificationService';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const { socket } = useSocket() || {};
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time socket listener for incoming notifications
  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (notification) => {
      if (notification) {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    };
    socket.on('new_notification', handleNewNotification);
    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const [countRes, notifRes] = await Promise.all([
        getUnreadCount(),
        getNotifications({ limit: 10 })
      ]);
      const count = countRes?.data?.count ?? countRes?.count ?? 0;
      const notifs = notifRes?.data?.notifications ?? notifRes?.notifications ?? (Array.isArray(notifRes?.data) ? notifRes.data : []);
      setUnreadCount(count);
      setNotifications(Array.isArray(notifs) ? notifs : []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-[#0b0f19] shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-32px)] bg-white/95 dark:bg-[#070b24]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-slate-200/80 dark:border-white/10 flex justify-between items-center bg-slate-50/80 dark:bg-white/5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                    className={`p-4 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${
                      !notif.isRead ? 'bg-primary-50/40 dark:bg-white/[0.02]' : ''
                    }`}
                  >
                    <div className="mt-1">
                      {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm mb-1 ${notif.isRead ? 'text-slate-600 dark:text-gray-300' : 'text-slate-900 dark:text-white font-medium'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mb-2 line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center text-xs text-slate-400 dark:text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNowSafe(notif.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 dark:text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-xs sm:text-sm">No new notifications</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 text-center">
              <Link
                to={user?.role === 'volunteer' ? '/volunteer/notifications' : (user?.role === 'ngo' ? '/ngo/dashboard' : '/admin/dashboard')}
                onClick={() => setIsOpen(false)}
                className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
