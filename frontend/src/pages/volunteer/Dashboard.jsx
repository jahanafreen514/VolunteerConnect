import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, Timer, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { formatDateSafe } from '../../utils/date';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { applicationService } from '../../services/applicationService';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import VolunteerSidebar from '../../components/layouts/VolunteerSidebar';
import StatCard from '../../components/ui/StatCard';
import SkeletonStatCard from '../../components/ui/SkeletonStatCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';
import Card from '../../components/ui/Card';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, eventsData, appsData] = await Promise.all([
          userService.getVolunteerStats(),
          userService.getUpcomingEvents(),
          applicationService.getMyApplications({ limit: 5 })
        ]);
        setStats(statsData?.data || statsData);
        setEvents(Array.isArray(eventsData?.data) ? eventsData.data : (Array.isArray(eventsData) ? eventsData : []));
        setApplications(appsData?.data?.applications || appsData?.applications || (Array.isArray(appsData?.data) ? appsData.data : (Array.isArray(appsData) ? appsData : [])));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout sidebar={<VolunteerSidebar />}>
      <AnimatedBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name}! Ready to make an impact?</h1>
            <p className="text-gray-400 mt-1">Here's an overview of your volunteering journey.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/opportunities" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium text-sm">Find Opportunities</Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => <SkeletonStatCard key={i} />)
          ) : (
            <>
              <StatCard title="Upcoming Events" value={stats?.upcomingEvents || 0} icon={Calendar} color="blue" />
              <StatCard title="Pending Applications" value={stats?.pendingApplications || 0} icon={Clock} color="orange" />
              <StatCard title="Accepted" value={stats?.acceptedApplications || 0} icon={CheckCircle} color="green" />
              <StatCard title="Hours Volunteered" value={stats?.hoursVolunteered || 0} icon={Timer} color="purple" />
              <StatCard title="Certificates" value={stats?.certificates || 0} icon={Award} color="cyan" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-400" /> Upcoming Events
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : events?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {events.map((event) => {
                  const opp = event.opportunityId && typeof event.opportunityId === 'object' ? event.opportunityId : (event.opportunity || event);
                  const oppId = opp._id || (typeof event.opportunityId === 'string' ? event.opportunityId : event._id);
                  const title = opp.title || event.title || 'Volunteering Event';
                  const ngoName = opp.ngoId?.name || opp.ngo?.organizationName || event.ngoName || 'NGO Partner';
                  const eventDate = opp.eventDate || opp.date || event.date || event.createdAt;
                  const image = opp.image || event.image;

                  return (
                    <Card key={event._id} className="overflow-hidden hover:border-primary-500/50 transition-colors">
                      <div className="h-32 bg-gradient-to-br from-primary-900/50 to-purple-900/50 p-4 relative">
                        {image && <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-50" />}
                        <div className="relative z-10 flex flex-col justify-end h-full">
                          <h3 className="font-semibold text-white truncate text-lg">{title}</h3>
                          <p className="text-sm text-gray-300 truncate">{ngoName}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-900/50 flex justify-between items-center">
                        <span className="text-sm text-gray-400">{formatDateSafe(eventDate, 'MMM d, yyyy h:mm a')}</span>
                        {oppId && (
                          <Link to={`/opportunities/${oppId}`} className="text-primary-400 hover:text-primary-300 text-sm font-medium">View</Link>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="No upcoming events" description="You don't have any upcoming events scheduled." icon={Calendar} action={{ label: 'Find Events', onClick: () => navigate('/opportunities') }} />
            )}
          </div>

          {/* Recent Applications */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-400" /> Recent Applications
            </h2>
            {loading ? (
              <div className="space-y-3">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : applications?.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app) => {
                  const opp = app.opportunityId || app.opportunity || {};
                  const oppTitle = opp.title || 'Volunteer Opportunity';
                  const ngoName = opp.ngo?.organizationName || opp.ngoId?.name || opp.ngoName || 'NGO Partner';
                  const appDate = app.appliedAt || app.createdAt;
                  const status = app.status || 'pending';

                  return (
                    <Card key={app._id} className="p-4 hover:bg-white/[0.07] transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-white truncate pr-2">{oppTitle}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                          status === 'accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        }`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mb-2">{ngoName}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Applied {formatDateSafe(appDate, 'MMM d')}</span>
                        <Link to="/volunteer/applications" className="text-primary-400 hover:text-primary-300">Details</Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="No recent applications" description="You haven't applied to any opportunities recently." icon={Clock} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
