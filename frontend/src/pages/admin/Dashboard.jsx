import React, { useEffect, useState } from 'react';
import { Users, Building, ShieldAlert, Briefcase, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { adminService } from '../../services/adminService';
import StatCard from '../../components/ui/StatCard';
import SkeletonStatCard from '../../components/ui/SkeletonStatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pendingNGOs, setPendingNGOs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, analyticsData, ngosData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getAnalytics(),
          adminService.getNGOs({ verificationStatus: 'pending', limit: 5 })
        ]);
        setStats(statsData);
        setAnalytics(analyticsData);
        setPendingNGOs(ngosData.ngos || ngosData);
      } catch (error) {
        toast.error('Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApproveNGO = async (id) => {
    try {
      await adminService.verifyNGO(id, { status: 'approved' });
      toast.success('NGO Approved');
      setPendingNGOs(prev => prev.filter(ngo => ngo._id !== id));
    } catch (error) {
      toast.error('Failed to approve NGO');
    }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <AnimatedBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Platform overview and management.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading ? (
            Array(6).fill(0).map((_, i) => <SkeletonStatCard key={i} />)
          ) : (
            <>
              <StatCard title="Total Volunteers" value={stats?.totalVolunteers || 0} icon={Users} color="blue" />
              <StatCard title="Total NGOs" value={stats?.totalNGOs || 0} icon={Building} color="purple" />
              <StatCard title="Pending NGOs" value={stats?.pendingNGOs || 0} icon={ShieldAlert} color="orange" />
              <StatCard title="Active Opportunities" value={stats?.activeOpportunities || 0} icon={Briefcase} color="green" />
              <StatCard title="Total Applications" value={stats?.totalApplications || 0} icon={FileText} color="cyan" />
              <StatCard title="Completed Events" value={stats?.completedEvents || 0} icon={CheckCircle} color="blue" />
            </>
          )}
        </div>

        {/* Charts Section */}
        {!loading && analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Opportunities by Category</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.opportunitiesByCategory || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="category" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Applications (Last 6 Months)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.applicationsByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Area type="monotone" dataKey="count" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Volunteer Growth</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.volunteerGrowthByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: '#10B981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Top NGOs (by completed events)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topNGOs || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                    <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} width={100} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="events" fill="#06B6D4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* Pending NGOs Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-400" /> Action Required: Pending NGOs
            </h2>
            <Link to="/admin/ngos" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="p-6 text-center text-gray-400">Loading...</div>
          ) : pendingNGOs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Organization</th>
                    <th className="px-6 py-4">Reg. Number</th>
                    <th className="px-6 py-4">Date Applied</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pendingNGOs.map((ngo) => (
                    <tr key={ngo._id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 font-medium text-white">{ngo.organizationName}</td>
                      <td className="px-6 py-4">{ngo.registrationNumber}</td>
                      <td className="px-6 py-4">{new Date(ngo.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" onClick={() => handleApproveNGO(ngo._id)}>Quick Approve</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-400">No pending NGO verifications.</div>
          )}
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
