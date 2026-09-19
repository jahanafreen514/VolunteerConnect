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
import SkeletonTable from '../../components/ui/SkeletonTable';
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Volunteer Applications</h1>
            <p className="text-gray-400 mt-1">Review and manage applications for your opportunities.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={selectedOpp}
              onChange={(e) => setSelectedOpp(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="" className="bg-gray-900">All Opportunities</option>
              {opportunities.map(opp => (
                <option key={opp._id} value={opp._id} className="bg-gray-900">{opp.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-2 sm:pb-0 hide-scrollbar gap-2 w-full">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-6"><SkeletonTable columns={5} rows={5} /></div>
          ) : applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Volunteer</th>
                    <th className="px-6 py-4">Opportunity</th>
                    <th className="px-6 py-4">Applied Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {applications.map((app) => {
                    const vol = app.volunteerId || app.user || {};
                    const opp = app.opportunityId || app.opportunity || {};
                    const volName = vol.name || 'Anonymous Volunteer';
                    const volEmail = vol.email || 'No email provided';
                    const oppTitle = opp.title || 'Volunteer Opportunity';
                    const dateStr = app.appliedAt || app.createdAt;
                    const message = app.message || app.coverMessage;

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
                        <td className="px-6 py-4">
                          <p className="font-medium text-white line-clamp-1">{oppTitle}</p>
                          {message && (
                            <div className="mt-1 text-xs text-gray-400 flex items-start gap-1 group relative cursor-help">
                              <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1">View message</span>
                              <div className="hidden group-hover:block absolute left-0 top-full mt-2 w-64 p-3 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-20 text-white whitespace-normal">
                                {message}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{dateStr ? format(new Date(dateStr), 'MMM d, yyyy') : 'Recent'}</td>
                        <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {app.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => setActionDialog({ isOpen: true, id: app._id, action: 'accepted' })}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => setActionDialog({ isOpen: true, id: app._id, action: 'rejected' })}>
                                <XCircle className="w-4 h-4" />
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
