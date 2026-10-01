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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pastel-card p-6 border border-[#E6E8EC]"
        >
          <div>
            <h1 className="text-2xl font-bold text-[#354052]">Welcome back, {user?.name}! Ready to make an impact?</h1>
            <p className="text-[#667085] mt-1 text-sm">Here's an overview of your volunteering journey and upcoming contributions.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/opportunities" className="btn-primary-pastel text-xs font-semibold px-4 py-2.5">
              Find Opportunities
            </Link>
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
            <h2 className="text-lg font-semibold text-[#354052] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#5b7f63]" /> Upcoming Events
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
                    <Card key={event._id} className="overflow-hidden hover:border-[#BFD8C2] transition-all">
                      <div className="h-32 bg-gradient-to-br from-[#D8EEE5] to-[#C9DDF2] p-4 relative overflow-hidden">
                        {image && <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                        <div className="relative z-10 flex flex-col justify-end h-full">
                          <h3 className="font-semibold text-[#26372B] truncate text-base bg-white/70 backdrop-blur-xs px-2.5 py-1 rounded-lg inline-block w-fit max-w-full">{title}</h3>
                          <p className="text-xs text-[#354052] font-medium truncate mt-1 bg-white/70 backdrop-blur-xs px-2 py-0.5 rounded-md inline-block w-fit">{ngoName}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-white/60 border-t border-[#E6E8EC] flex justify-between items-center">
                        <span className="text-xs text-[#667085]">{formatDateSafe(eventDate, 'MMM d, yyyy h:mm a')}</span>
                        {oppId && (
                          <Link to={`/opportunities/${oppId}`} className="text-[#5b7f63] hover:text-[#426048] text-xs font-semibold">View Details</Link>
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
            <h2 className="text-lg font-semibold text-[#354052] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#5b7f63]" /> Recent Applications
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
                    <Card key={app._id} className="p-4 hover:border-[#BFD8C2] transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-[#354052] text-sm truncate pr-2">{oppTitle}</h3>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                          status === 'accepted' ? 'bg-[#D8EEE5] text-[#26372B] border border-[#BFD8C2]' :
                          status === 'rejected' ? 'bg-[#F2D6DD] text-[#9B5B65] border border-[#F2D6DD]' :
                          'bg-[#FFF8EF] text-[#854D27] border border-[#F6D8C5]'
                        }`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-[#667085] truncate mb-2">{ngoName}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#667085]">Applied {formatDateSafe(appDate, 'MMM d')}</span>
                        <Link to="/volunteer/applications" className="text-[#5b7f63] hover:text-[#426048] font-medium">Details</Link>
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
