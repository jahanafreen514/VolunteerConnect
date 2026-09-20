import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, Users, Briefcase, CheckCircle, Award, AlertTriangle, 
  UserCheck, XCircle, MapPin, Newspaper, ExternalLink, Sparkles, Navigation, ArrowRight 
} from 'lucide-react';
import { format } from 'date-fns';
import { formatDateSafe } from '../../utils/date';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NGOSidebar from '../../components/layouts/NGOSidebar';
import { ngoService } from '../../services/ngoService';
import { applicationService } from '../../services/applicationService';
import { locationService } from '../../services/locationService';
import StatCard from '../../components/ui/StatCard';
import SkeletonStatCard from '../../components/ui/SkeletonStatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const NGODashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [newsEvents, setNewsEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adoptingId, setAdoptingId] = useState(null);
  const [actionDialog, setActionDialog] = useState({ isOpen: false, id: null, action: null });

  const fetchData = async () => {
    try {
      const [statsData, profileData, appsData] = await Promise.all([
        ngoService.getNGOStats(),
        ngoService.getMyProfile(),
        applicationService.getNGOApplications({ limit: 5, status: 'pending' })
      ]);
      const prof = profileData?.data || profileData;
      setStats(statsData?.data || statsData);
      setProfile(prof);
      setRecentApps(appsData?.data?.applications || appsData?.applications || (Array.isArray(appsData?.data) ? appsData.data : []));

      // Fetch nearby real-world news events
      try {
        const newsRes = await locationService.getNewsEvents(prof?.latitude, prof?.longitude);
        setNewsEvents(newsRes?.data || []);
      } catch (err) {
        console.warn('News events in dashboard:', err);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmEvent = async (event) => {
    setAdoptingId(event._id);
    try {
      await locationService.adoptEvent(event._id);
      toast.success(`Event confirmed! You have officially adopted this initiative.`);
      fetchData();
    } catch (err) {
      toast.error('Failed to adopt event');
    } finally {
      setAdoptingId(null);
    }
  };

  const handleDismissEvent = (eventId) => {
    setNewsEvents(prev => prev.filter(e => e._id !== eventId));
    toast.success('Event dismissed from your immediate dashboard feed.');
  };

  const handleApplicationAction = async () => {
    try {
      await applicationService.updateApplicationStatus(actionDialog.id, actionDialog.action);
      toast.success(`Application ${actionDialog.action} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setActionDialog({ isOpen: false, id: null, action: null });
    }
  };

  return (
    <DashboardLayout sidebar={<NGOSidebar />}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {profile?.verificationStatus === 'pending' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <h3 className="text-amber-500 font-medium text-sm">Verification Pending</h3>
              <p className="text-amber-500/80 text-xs mt-1">Your NGO profile is currently under review by administrators. Some features like creating opportunities may be restricted until verified.</p>
            </div>
            <Link to="/ngo/profile">
              <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10">View Profile</Button>
            </Link>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
            <p className="text-gray-400 mt-1">{profile?.organizationName || 'Welcome to your NGO dashboard'}</p>
          </div>
          {profile?.verificationStatus === 'approved' && (
            <Link to="/ngo/opportunities/create">
              <Button className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Create Opportunity</Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => <SkeletonStatCard key={i} />)
          ) : (
            <>
              <StatCard title="Active Opportunities" value={stats?.activeOpportunities || 0} icon={Briefcase} color="blue" />
              <StatCard title="Total Applications" value={stats?.totalApplications || 0} icon={Users} color="purple" />
              <StatCard title="Upcoming Events" value={stats?.upcomingEvents || 0} icon={Calendar} color="orange" />
              <StatCard title="Accepted Volunteers" value={stats?.acceptedVolunteers || 0} icon={UserCheck} color="green" />
              <StatCard title="Completed Events" value={stats?.completedEvents || 0} icon={CheckCircle} color="cyan" />
            </>
          )}
        </div>

        {/* Section 19: Nearby Real-World Events & Potential Opportunities */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary-400" />
                Nearby Real-World Events & Community Needs
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Real-time humanitarian reports and local situations detected in your region. Lead volunteer action or confirm community needs.
              </p>
            </div>
            <span className="text-xs text-gray-400">
              {newsEvents.length} event{newsEvents.length !== 1 ? 's' : ''} detected
            </span>
          </div>

          {newsEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {newsEvents.slice(0, 4).map((ev) => {
                const isConfirmed = ev.status === 'confirmed';
                return (
                  <div
                    key={ev._id}
                    className="p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
                          {ev.event_type?.replace('_', ' ') || 'Emergency Alert'}
                        </span>
                        {ev.distanceKm !== undefined && (
                          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <Navigation className="w-3 h-3" />
                            {ev.distanceKm < 1 ? '< 1 km from you' : `${ev.distanceKm.toFixed(1)} km from your organization`}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-white mb-1.5">{ev.title}</h3>
                      <p className="text-xs text-gray-300 line-clamp-2 mb-3">{ev.summary}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-3">
                        <span className="flex items-center gap-1 text-gray-300">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {[ev.location?.city, ev.location?.state].filter(Boolean).join(', ') || 'Local Region'}
                        </span>
                        {ev.source_name && (
                          <a
                            href={ev.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary-400 hover:text-primary-300 underline"
                          >
                            <span>{ev.source_name}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {ev.potential_activities && ev.potential_activities.length > 0 && (
                        <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 text-xs text-gray-300">
                          <strong className="text-gray-200 block mb-1">Potential volunteer support:</strong>
                          <div className="flex flex-wrap gap-1.5">
                            {ev.potential_activities.map((act, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/10 text-[11px]">
                                {act}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        {isConfirmed ? (
                          <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Confirmed / Adopted
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConfirmEvent(ev)}
                            disabled={adoptingId === ev._id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-all"
                          >
                            {adoptingId === ev._id ? 'Confirming...' : 'Confirm Need'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDismissEvent(ev._id)}
                          className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>

                      <button
                        onClick={() => navigate(`/ngo/opportunities/create?adoptEvent=${ev._id}&title=${encodeURIComponent(ev.title)}&description=${encodeURIComponent(ev.summary)}&category=Disaster Relief&city=${encodeURIComponent(ev.location?.city || '')}&lat=${ev.location?.latitude || ''}&lng=${ev.location?.longitude || ''}`)}
                        className="px-3.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-glow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Create Opportunity</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="p-6 text-center text-gray-400 text-xs">
              No immediate disaster or community alerts within your organization's proximity. We automatically scan public feeds every 30 minutes.
            </Card>
          )}
        </div>

        {/* Recent Pending Applications */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-400" /> Pending Applications
            </h2>
            <Link to="/ngo/applications" className="text-sm text-primary-400 hover:text-primary-300">View All</Link>
          </div>
          
          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : recentApps.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Volunteer</th>
                      <th className="px-6 py-4">Opportunity</th>
                      <th className="px-6 py-4">Applied</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentApps.map((app) => {
                      const vol = app.volunteerId || app.user || {};
                      const opp = app.opportunityId || app.opportunity || {};
                      const volName = vol.name || 'Volunteer';
                      const volEmail = vol.email || '';
                      const oppTitle = opp.title || 'Volunteer Opportunity';
                      const appDate = app.appliedAt || app.createdAt;

                      return (
                        <tr key={app._id} className="hover:bg-white/[0.02]">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={vol.profileImage} alt={volName} size="sm" />
                              <div>
                                <p className="font-medium text-white">{volName}</p>
                                <p className="text-xs text-gray-500">{volEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-white font-medium">{oppTitle}</td>
                          <td className="px-6 py-4 text-gray-400">{formatDateSafe(appDate, 'MMM d, yyyy')}</td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => setActionDialog({ isOpen: true, id: app._id, action: 'accepted' })}>
                              <CheckCircle className="w-4 h-4 mr-1" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => setActionDialog({ isOpen: true, id: app._id, action: 'rejected' })}>
                              <XCircle className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No pending applications" description="You don't have any pending applications to review right now." icon={CheckCircle} />
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={actionDialog.isOpen}
        title={`${actionDialog.action === 'accepted' ? 'Accept' : 'Reject'} Application`}
        message={`Are you sure you want to ${actionDialog.action === 'accepted' ? 'accept' : 'reject'} this application?`}
        confirmText={`Yes, ${actionDialog.action === 'accepted' ? 'Accept' : 'Reject'}`}
        onConfirm={handleApplicationAction}
        onCancel={() => setActionDialog({ isOpen: false, id: null, action: null })}
        variant={actionDialog.action === 'accepted' ? 'success' : 'danger'}
      />
    </DashboardLayout>
  );
};

export default NGODashboard;
