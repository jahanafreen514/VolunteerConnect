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
        className="relative p-2 text-[#667085] hover:text-[#354052] hover:bg-[#F5F1FA] rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#F2D6DD] text-[#9B5B65] text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-soft-sm">
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
            className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-32px)] bg-white/95 backdrop-blur-2xl border border-[#E6E8EC] rounded-2xl shadow-soft-hover overflow-hidden z-50"
          >
            <div className="p-4 border-b border-[#E6E8EC] flex justify-between items-center bg-[#F5F1FA]">
              <h3 className="font-semibold text-[#354052] text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-[#5b7f63] hover:text-[#426048] font-medium hover:underline flex items-center"
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
                    className={`p-4 border-b border-[#E6E8EC] last:border-0 hover:bg-[#FFF8EF]/50 transition-colors cursor-pointer flex gap-3 ${
                      !notif.isRead ? 'bg-[#D8EEE5]/20' : ''
                    }`}
                  >
                    <div className="mt-1">
                      {!notif.isRead && <div className="w-2 h-2 rounded-full bg-[#5b7f63]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm mb-1 ${notif.isRead ? 'text-[#667085]' : 'text-[#354052] font-semibold'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-[#667085] mb-2 line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center text-xs text-[#667085]">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNowSafe(notif.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[#667085]">
                  <Bell className="w-8 h-8 mx-auto mb-3 opacity-30 text-[#667085]" />
                  <p className="text-xs sm:text-sm">No new notifications</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[#E6E8EC] bg-[#F5F1FA] text-center">
              <Link
                to={user?.role === 'volunteer' ? '/volunteer/notifications' : (user?.role === 'ngo' ? '/ngo/dashboard' : '/admin/dashboard')}
                onClick={() => setIsOpen(false)}
                className="text-xs sm:text-sm text-[#5b7f63] hover:text-[#426048] hover:underline font-semibold"
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
