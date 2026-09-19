import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import VolunteerSidebar from '../../components/layouts/VolunteerSidebar';
import { notificationService } from '../../services/notificationService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

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
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  return (
    <DashboardLayout sidebar={<VolunteerSidebar />}>
      <AnimatedBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Notifications {unreadCount > 0 && <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>}
            </h1>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm" className="flex items-center gap-2">
              <Check className="w-4 h-4" /> Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />)}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <Card 
                key={notif._id} 
                className={`p-4 flex gap-4 cursor-pointer transition-all ${!notif.isRead ? 'bg-primary-900/10 border-primary-500/30' : 'hover:bg-white/[0.02]'}`}
                onClick={() => !notif.isRead && markAsRead(notif._id)}
              >
                <div className="mt-1 flex-shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${!notif.isRead ? 'text-white' : 'text-gray-300'}`}>{notif.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                )}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="All caught up!" 
            description="You don't have any notifications right now." 
            icon={Bell}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
