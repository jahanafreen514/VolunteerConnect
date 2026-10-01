import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Users, CheckCircle, XCircle, Search, MessageSquare } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NGOSidebar from '../../components/layouts/NGOSidebar';
import { applicationService } from '../../services/applicationService';
import { opportunityService } from '../../services/opportunityService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { SkeletonTable } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const NGOApplications = () => {
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpp, setSelectedOpp] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState({ isOpen: false, id: null, action: null });

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const res = await opportunityService.getOpportunities({ isNgo: true, limit: 100 });
        const list = res?.data?.opportunities || res?.opportunities || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
        setOpportunities(list);
      } catch (error) {
        toast.error('Failed to load opportunities');
      }
    };
    fetchOpportunities();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getNGOApplications({
        opportunityId: selectedOpp || undefined,
        status: filter !== 'all' ? filter : undefined,
        limit: 100
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
  }, [selectedOpp, filter]);

  const handleAction = async () => {
    try {
      await applicationService.updateApplicationStatus(actionDialog.id, actionDialog.action);
      toast.success(`Application ${actionDialog.action} successfully`);
      fetchApplications();
    } catch (error) {
      toast.error('Failed to update application');
    } finally {
      setActionDialog({ isOpen: false, id: null, action: null });
    }
  };

  const tabs = ['all', 'pending', 'accepted', 'rejected', 'completed', 'cancelled'];

  const getStatusBadge = (status) => {
    const map = {
      pending: 'warning',
      accepted: 'success',
      rejected: 'error',
      completed: 'primary',
      cancelled: 'default'
    };
    return <Badge variant={map[status] || 'default'}>{status}</Badge>;
  };

  return (
    <DashboardLayout sidebar={<NGOSidebar />}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pastel-card p-6 border border-[#E6E8EC]">
          <div>
            <h1 className="text-2xl font-bold text-[#354052]">Volunteer Applications</h1>
            <p className="text-xs text-[#667085] mt-1">Review and manage volunteer registrations for your organization's initiatives.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={selectedOpp}
              onChange={(e) => setSelectedOpp(e.target.value)}
              className="bg-white border border-[#E6E8EC] rounded-xl px-4 py-2 text-xs font-semibold text-[#354052] focus:border-[#BFD8C2] outline-none shadow-soft-sm"
            >
              <option value="">All Opportunities</option>
              {opportunities.map(opp => (
                <option key={opp._id} value={opp._id}>{opp.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-2 sm:pb-0 hide-scrollbar gap-2 w-full">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filter === tab 
                  ? 'bg-[#DDD5F3]/50 text-[#30264A] border border-[#DDD5F3] shadow-soft-sm' 
                  : 'bg-white text-[#667085] hover:text-[#354052] hover:bg-[#F5F1FA] border border-[#E6E8EC]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <Card className="overflow-hidden border border-[#E6E8EC]">
          {loading ? (
            <div className="p-6"><SkeletonTable columns={5} rows={5} /></div>
          ) : applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#354052]">
                <thead className="bg-[#F5F1FA] text-[#667085] uppercase text-xs border-b border-[#E6E8EC]">
                  <tr>
                    <th className="px-6 py-4">Volunteer</th>
                    <th className="px-6 py-4">Opportunity</th>
                    <th className="px-6 py-4">Applied Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E8EC]">
                  {applications.map((app) => {
                    const vol = app.volunteerId || app.user || {};
                    const opp = app.opportunityId || app.opportunity || {};
                    const volName = vol.name || 'Anonymous Volunteer';
                    const volEmail = vol.email || 'No email provided';
                    const oppTitle = opp.title || 'Volunteer Opportunity';
                    const dateStr = app.appliedAt || app.createdAt;
                    const message = app.message || app.coverMessage;

                    return (
                      <tr key={app._id} className="hover:bg-[#FFF8EF]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={vol.profileImage} alt={volName} size="sm" />
                            <div>
                              <p className="font-semibold text-[#354052]">{volName}</p>
                              <p className="text-xs text-[#667085]">{volEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#354052] line-clamp-1">{oppTitle}</p>
                          {message && (
                            <div className="mt-1 text-xs text-[#667085] flex items-start gap-1 group relative cursor-help">
                              <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-[#5b7f63] flex-shrink-0" />
                              <span className="line-clamp-1">View message</span>
                              <div className="hidden group-hover:block absolute left-0 top-full mt-2 w-64 p-3 bg-white border border-[#E6E8EC] rounded-xl shadow-soft-hover z-20 text-[#354052] whitespace-normal text-xs leading-relaxed">
                                {message}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-[#667085]">{dateStr ? format(new Date(dateStr), 'MMM d, yyyy') : 'Recent'}</td>
                        <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {app.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" className="border-[#BFD8C2] bg-[#D8EEE5] text-[#26372B] hover:bg-[#BFD8C2]" onClick={() => setActionDialog({ isOpen: true, id: app._id, action: 'accepted' })}>
                                <CheckCircle className="w-4 h-4 text-[#5b7f63]" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-[#F2D6DD] bg-[#F2D6DD]/60 text-[#9B5B65] hover:bg-[#F2D6DD]" onClick={() => setActionDialog({ isOpen: true, id: app._id, action: 'rejected' })}>
                                <XCircle className="w-4 h-4 text-[#9B5B65]" />
                              </Button>
                            </>
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
                description={filter === 'all' ? "No one has applied to your opportunities yet." : `No ${filter} applications found.`}
                icon={Users}
              />
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        isOpen={actionDialog.isOpen}
        title={`${actionDialog.action === 'accepted' ? 'Accept' : 'Reject'} Application`}
        message={`Are you sure you want to ${actionDialog.action === 'accepted' ? 'accept' : 'reject'} this application?`}
        confirmText={`Yes, ${actionDialog.action === 'accepted' ? 'Accept' : 'Reject'}`}
        onConfirm={handleAction}
        onCancel={() => setActionDialog({ isOpen: false, id: null, action: null })}
        variant={actionDialog.action === 'accepted' ? 'success' : 'danger'}
      />
    </DashboardLayout>
  );
};

export default NGOApplications;
