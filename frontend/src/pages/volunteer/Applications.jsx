import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Search, Filter, XCircle, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDateSafe } from '../../utils/date';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import VolunteerSidebar from '../../components/layouts/VolunteerSidebar';
import { applicationService } from '../../services/applicationService';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import SkeletonTable from '../../components/ui/SkeletonTable';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const VolunteerApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelDialog, setCancelDialog] = useState({ isOpen: false, id: null });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getMyApplications({ 
        status: filter !== 'all' ? filter : undefined,
        limit: 50 
      });
      const list = res?.data?.applications || res?.applications || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setApplications(list);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const handleCancel = async () => {
    try {
      await applicationService.updateApplicationStatus(cancelDialog.id, 'cancelled');
      toast.success('Application cancelled successfully');
      fetchApplications();
    } catch (error) {
      toast.error('Failed to cancel application');
    } finally {
      setCancelDialog({ isOpen: false, id: null });
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { color: 'warning', label: 'Pending' },
      accepted: { color: 'success', label: 'Accepted' },
      rejected: { color: 'error', label: 'Rejected' },
      completed: { color: 'primary', label: 'Completed' },
      cancelled: { color: 'default', label: 'Cancelled' }
    };
    const s = map[status] || map.pending;
    return <Badge variant={s.color}>{s.label}</Badge>;
  };

  const tabs = ['all', 'pending', 'accepted', 'rejected', 'completed', 'cancelled'];

  return (
    <DashboardLayout sidebar={<VolunteerSidebar />}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pastel-card p-6 border border-[#E6E8EC]">
          <div>
            <h1 className="text-2xl font-bold text-[#354052]">My Applications</h1>
            <p className="text-xs text-[#667085] mt-1">Track the status and timeline of your volunteer applications</p>
          </div>
          
          <div className="flex overflow-x-auto pb-2 sm:pb-0 hide-scrollbar gap-2 w-full sm:w-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === tab 
                    ? 'bg-[#BFD8C2]/60 text-[#26372B] border border-[#BFD8C2] shadow-soft-sm' 
                    : 'bg-white text-[#667085] hover:text-[#354052] hover:bg-[#F5F1FA] border border-[#E6E8EC]'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden border border-[#E6E8EC]">
          {loading ? (
            <div className="p-6"><SkeletonTable columns={5} rows={5} /></div>
          ) : applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#354052]">
                <thead className="bg-[#F5F1FA] text-[#667085] uppercase text-xs border-b border-[#E6E8EC]">
                  <tr>
                    <th className="px-6 py-4">Opportunity</th>
                    <th className="px-6 py-4">NGO</th>
                    <th className="px-6 py-4">Applied Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E8EC]">
                  {applications.map((app) => {
                    const opp = app.opportunity || app.opportunityId || {};
                    const ngoName = opp.ngo?.organizationName || opp.ngoId?.name || opp.ngoName || 'NGO Partner';
                    const oppId = opp._id || app.opportunityId;
                    const oppTitle = opp.title || 'Volunteer Opportunity';
                    const dateStr = app.appliedAt || app.createdAt;

                    return (
                      <tr key={app._id} className="hover:bg-[#FFF8EF]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {opp.image ? (
                              <img src={opp.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#D8EEE5] flex items-center justify-center text-[#5b7f63] font-bold">
                                {oppTitle.charAt(0)}
                              </div>
                            )}
                            <span className="font-semibold text-[#354052] line-clamp-1">{oppTitle}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#667085] truncate max-w-[150px]">{ngoName}</td>
                        <td className="px-6 py-4 text-xs text-[#667085] whitespace-nowrap">{formatDateSafe(dateStr, 'MMM d, yyyy', 'Recently')}</td>
                        <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                        <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                          {oppId && (
                            <Link to={`/opportunities/${oppId}`} className="inline-flex items-center gap-1 text-[#5b7f63] hover:text-[#426048] font-medium text-xs transition-colors">
                              <Eye className="w-3.5 h-3.5" /> View
                            </Link>
                          )}
                          {app.status === 'pending' && (
                            <button 
                              onClick={() => setCancelDialog({ isOpen: true, id: app._id })}
                              className="inline-flex items-center gap-1 text-[#9B5B65] hover:text-[#7f3e48] font-medium text-xs transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState 
                title="No applications found" 
                description={filter === 'all' ? "You haven't applied to any opportunities yet." : `No ${filter} applications found.`}
                action={{ label: 'Explore Opportunities', onClick: () => navigate('/opportunities') }}
              />
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        isOpen={cancelDialog.isOpen}
        title="Cancel Application"
        message="Are you sure you want to cancel this application? This action cannot be undone."
        confirmText="Yes, Cancel it"
        onConfirm={handleCancel}
        onCancel={() => setCancelDialog({ isOpen: false, id: null })}
        variant="danger"
      />
    </DashboardLayout>
  );
};

export default VolunteerApplications;
