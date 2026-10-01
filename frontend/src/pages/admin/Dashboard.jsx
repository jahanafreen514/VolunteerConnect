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
        setStats(statsData?.data || statsData);
        setAnalytics(analyticsData?.data || analyticsData);
        setPendingNGOs(ngosData?.data?.ngos || ngosData?.ngos || (Array.isArray(ngosData?.data) ? ngosData.data : []));
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="flex justify-between items-center pastel-card p-6 border border-[#E6E8EC]">
          <div>
            <h1 className="text-2xl font-bold text-[#354052]">Admin Dashboard</h1>
            <p className="text-[#667085] mt-1 text-sm">Platform overview and management.</p>
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
            <Card className="p-6 border border-[#E6E8EC]">
              <h2 className="text-base font-semibold text-[#354052] mb-6">Opportunities by Category</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.opportunitiesByCategory || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EC" vertical={false} />
                    <XAxis dataKey="category" stroke="#667085" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#667085" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E8EC', borderRadius: '12px', color: '#354052', boxShadow: '0 4px 12px rgba(80,90,100,0.08)' }} />
                    <Bar dataKey="count" fill="#7faadc" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 border border-[#E6E8EC]">
              <h2 className="text-base font-semibold text-[#354052] mb-6">Applications (Last 6 Months)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.applicationsByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EC" vertical={false} />
                    <XAxis dataKey="month" stroke="#667085" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#667085" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E8EC', borderRadius: '12px', color: '#354052', boxShadow: '0 4px 12px rgba(80,90,100,0.08)' }} />
                    <Area type="monotone" dataKey="count" stroke="#8e74d1" fill="#DDD5F3" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-6 border border-[#E6E8EC]">
              <h2 className="text-base font-semibold text-[#354052] mb-6">Volunteer Growth</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.volunteerGrowthByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EC" vertical={false} />
                    <XAxis dataKey="month" stroke="#667085" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#667085" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E8EC', borderRadius: '12px', color: '#354052', boxShadow: '0 4px 12px rgba(80,90,100,0.08)' }} />
                    <Line type="monotone" dataKey="count" stroke="#5b7f63" strokeWidth={2.5} dot={{ r: 4, fill: '#8fad95' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 border border-[#E6E8EC]">
              <h2 className="text-base font-semibold text-[#354052] mb-6">Top NGOs (by completed events)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topNGOs || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EC" horizontal={false} />
                    <XAxis type="number" stroke="#667085" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#667085" fontSize={12} tickLine={false} axisLine={false} width={100} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E8EC', borderRadius: '12px', color: '#354052', boxShadow: '0 4px 12px rgba(80,90,100,0.08)' }} />
                    <Bar dataKey="events" fill="#95cbb7" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* Pending NGOs Table */}
        <Card className="overflow-hidden border border-[#E6E8EC]">
          <div className="p-6 border-b border-[#E6E8EC] flex justify-between items-center">
            <h2 className="text-base font-semibold text-[#354052] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#854D27]" /> Action Required: Pending NGOs
            </h2>
            <Link to="/admin/ngos" className="text-xs font-semibold text-[#5b7f63] hover:text-[#426048] flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="p-6 text-center text-[#667085]">Loading...</div>
          ) : pendingNGOs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#354052]">
                <thead className="bg-[#F5F1FA] text-[#667085] uppercase text-xs border-b border-[#E6E8EC]">
                  <tr>
                    <th className="px-6 py-4">Organization</th>
                    <th className="px-6 py-4">Reg. Number</th>
                    <th className="px-6 py-4">Date Applied</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E8EC]">
                  {pendingNGOs.map((ngo) => (
                    <tr key={ngo._id} className="hover:bg-[#FFF8EF]/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#354052]">{ngo.organizationName}</td>
                      <td className="px-6 py-4 text-[#667085] text-xs">{ngo.registrationNumber}</td>
                      <td className="px-6 py-4 text-[#667085] text-xs">{new Date(ngo.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" className="btn-primary-pastel text-xs font-semibold" onClick={() => handleApproveNGO(ngo._id)}>Quick Approve</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-[#667085] text-sm">No pending NGO verifications.</div>
          )}
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
