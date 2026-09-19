import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Briefcase, CheckCircle, Award, AlertTriangle, UserCheck, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NGOSidebar from '../../components/layouts/NGOSidebar';
import { ngoService } from '../../services/ngoService';
import { applicationService } from '../../services/applicationService';
import StatCard from '../../components/ui/StatCard';
import SkeletonStatCard from '../../components/ui/SkeletonStatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

const NGODashboard = () => {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState({ isOpen: false, id: null, action: null });

  const fetchData = async () => {
    try {
      const [statsData, profileData, appsData] = await Promise.all([
        ngoService.getNGOStats(),
        ngoService.getMyProfile(),
        applicationService.getNGOApplications({ limit: 5, status: 'pending' })
      ]);
      setStats(statsData?.data || statsData);
      setProfile(profileData?.data || profileData);
      setRecentApps(appsData?.data?.applications || appsData?.applications || (Array.isArray(appsData?.data) ? appsData.data : []));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      <AnimatedBackground />
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
                    {recentApps.map((app) => (
                      <tr key={app._id} className="hover:bg-white/[0.02]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={app.user?.profileImage} alt={app.user?.name} size="sm" />
                            <div>
                              <p className="font-medium text-white">{app.user?.name}</p>
                              <p className="text-xs text-gray-500">{app.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{app.opportunity?.title}</td>
                        <td className="px-6 py-4">{format(new Date(app.createdAt), 'MMM d, yyyy')}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => setActionDialog({ isOpen: true, id: app._id, action: 'accepted' })}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => setActionDialog({ isOpen: true, id: app._id, action: 'rejected' })}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
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
