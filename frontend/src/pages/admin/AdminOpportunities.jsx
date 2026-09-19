import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SkeletonTable from '../../components/ui/SkeletonTable';
import EmptyState from '../../components/ui/EmptyState';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const CATEGORIES = [
  'Education', 'Environment', 'Healthcare', 'Animal Welfare', 
  'Community Service', 'Disaster Relief', 'Arts & Culture', 'Technology'
];

const AdminOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  
  const debouncedSearch = useDebounce(search, 500);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAdminOpportunities({ 
        search: debouncedSearch, 
        status, 
        category,
        limit: 50 
      });
      const list = res?.data?.opportunities || res?.opportunities || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setOpportunities(list);
    } catch (error) {
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [debouncedSearch, status, category]);

  const getStatusBadge = (status) => {
    const map = {
      draft: 'default',
      published: 'success',
      ongoing: 'primary',
      completed: 'purple',
      cancelled: 'error'
    };
    return <Badge variant={map[status] || 'default'}>{status}</Badge>;
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <AnimatedBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">All Opportunities</h1>
            <p className="text-gray-400 mt-1">Monitor platform activities and events.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="" className="bg-gray-900">All Statuses</option>
              <option value="published" className="bg-gray-900">Published</option>
              <option value="ongoing" className="bg-gray-900">Ongoing</option>
              <option value="completed" className="bg-gray-900">Completed</option>
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="" className="bg-gray-900">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
            </select>
          </div>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-6"><SkeletonTable columns={6} rows={8} /></div>
          ) : opportunities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Title & NGO</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Capacity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {opportunities.map((opp) => (
                    <tr key={opp._id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white line-clamp-1">{opp.title}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{opp.ngo?.organizationName}</div>
                      </td>
                      <td className="px-6 py-4"><Badge variant="default" className="text-xs">{opp.category}</Badge></td>
                      <td className="px-6 py-4 whitespace-nowrap">{format(new Date(opp.date), 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4 text-purple-400 font-medium">{opp.applicationsCount || 0} / {opp.volunteerCapacity}</td>
                      <td className="px-6 py-4">{getStatusBadge(opp.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/opportunities/${opp._id}`}>
                          <Button size="sm" variant="outline" className="flex items-center gap-1 ml-auto">
                            <Eye className="w-4 h-4" /> View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState 
                title="No opportunities found" 
                description="No results match your current filters." 
                icon={Briefcase} 
              />
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminOpportunities;
