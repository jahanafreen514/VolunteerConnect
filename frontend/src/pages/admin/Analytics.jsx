import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, Legend
} from 'recharts';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminService.getAnalytics();
        const data = res?.data || res || {};

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const formatMonthData = (arr) => {
          if (!Array.isArray(arr)) return [];
          return arr.map(item => {
            const m = item._id?.month || item.month;
            const y = item._id?.year || item.year;
            const label = m ? `${monthNames[m - 1] || m} ${y ? `'${String(y).slice(-2)}` : ''}` : (item.month || 'Month');
            return {
              ...item,
              month: label,
              count: item.count || 0
            };
          });
        };

        const formattedOppsByCategory = Array.isArray(data.opportunitiesByCategory)
          ? data.opportunitiesByCategory.map(item => ({
              ...item,
              category: item.category || item._id || 'Uncategorized',
              count: item.count || 0
            }))
          : [];

        const formattedTopNgos = Array.isArray(data.topNGOs)
          ? data.topNGOs.map(item => ({
              name: item.name || 'NGO Partner',
              events: item.events !== undefined ? item.events : (item.count || 0)
            }))
          : [];

        setAnalytics({
          ...data,
          volunteerGrowthByMonth: formatMonthData(data.volunteerGrowthByMonth),
          applicationsByMonth: formatMonthData(data.applicationsByMonth),
          opportunitiesByCategory: formattedOppsByCategory,
          topNGOs: formattedTopNgos
        });
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex justify-center items-center h-full">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      </DashboardLayout>
    );
  }

  const tooltipStyle = { backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
          <p className="text-gray-400 mt-1">Detailed insights into platform growth and usage.</p>
        </div>

        <div className="space-y-6">
          
          {/* Volunteer Growth Full Width */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Volunteer Growth Trend</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.volunteerGrowthByMonth || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="count" name="New Volunteers" stroke="#10B981" fillOpacity={1} fill="url(#colorGrowth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Applications by Month Full Width */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Application Volume</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.applicationsByMonth || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="count" name="Applications Submitted" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Opportunities by Category */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Opportunities by Category</h2>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.opportunitiesByCategory || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="category" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={tooltipStyle} cursor={{fill: '#374151', opacity: 0.4}} />
                    <Bar dataKey="count" name="Total Opportunities" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Top NGOs */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Top NGOs (by impact)</h2>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.topNGOs || []} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                    <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} width={120} />
                    <RechartsTooltip contentStyle={tooltipStyle} cursor={{fill: '#374151', opacity: 0.4}} />
                    <Bar dataKey="events" name="Completed Events" fill="#06B6D4" radius={[0, 4, 4, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
