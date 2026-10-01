import React, { useEffect, useState } from 'react';
import { formatDistanceToNowSafe } from '../../utils/date';
import { Bell, Check, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import VolunteerSidebar from '../../components/layouts/VolunteerSidebar';
import { notificationService } from '../../services/notificationService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications({ limit: 50 });
      const list = res?.data?.notifications || res?.notifications || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setNotifications(list);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => (Array.isArray(prev) ? prev.map(n => n._id === id ? { ...n, isRead: true } : n) : []));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => (Array.isArray(prev) ? prev.map(n => ({ ...n, isRead: true })) : []));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-[#4D8256]" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-[#B87033]" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-[#9A3445]" />;
      default: return <Info className="w-5 h-5 text-[#28486D]" />;
    }
  };

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  return (
    <DashboardLayout sidebar={<VolunteerSidebar />}>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#354052] flex items-center gap-2.5">
              Notifications 
              {unreadCount > 0 && (
                <span className="bg-[#BFD8C2] text-[#26372B] text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-[#667085] mt-1 text-sm">Stay up to date with opportunity approvals, event schedules, and announcements.</p>
          </div>
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1.5 !border-[#E6E8EC] !text-[#354052] hover:!bg-[#F5F1FA] text-xs font-semibold shadow-soft-sm"
            >
              <Check className="w-4 h-4 text-[#4D8256]" /> Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-white/60 animate-pulse rounded-2xl border border-[#E6E8EC]" />)}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3.5">
            {notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`pastel-card p-4 flex gap-4 cursor-pointer transition-all ${
                  !notif.isRead 
                    ? '!bg-[#D8EEE5]/30 !border-[#BFD8C2] shadow-soft-sm' 
                    : 'bg-white/80 hover:bg-white border-[#E6E8EC] opacity-90 hover:opacity-100'
                }`}
                onClick={() => !notif.isRead && markAsRead(notif._id)}
              >
                <div className="mt-1 flex-shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm ${!notif.isRead ? 'font-bold text-[#354052]' : 'font-medium text-[#354052]'}`}>
                    {notif.title}
                  </h3>
                  <p className="text-sm text-[#667085] mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-[#667085] mt-2 font-medium">{formatDistanceToNowSafe(notif.createdAt)}</p>
                </div>
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4D8256] mt-2 flex-shrink-0 shadow-sm" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="pastel-card p-12 text-center">
            <EmptyState 
              title="All caught up!" 
              description="You don't have any notifications right now." 
              icon={Bell}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
