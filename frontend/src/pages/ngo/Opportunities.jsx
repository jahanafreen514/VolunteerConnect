import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { formatDateSafe } from '../../utils/date';
import { Plus, Edit2, Trash2, Eye, Calendar, Users, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NGOSidebar from '../../components/layouts/NGOSidebar';
import { opportunityService } from '../../services/opportunityService';
import { ngoService } from '../../services/ngoService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import SkeletonTable from '../../components/ui/SkeletonTable';

const NGOOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oppsData, profileData] = await Promise.all([
        opportunityService.getOpportunities({ isNgo: true, limit: 100 }), // Assuming API returns my opps if auth'd as NGO
        ngoService.getMyProfile()
      ]);
      const oppList = oppsData?.data?.opportunities || oppsData?.opportunities || (Array.isArray(oppsData?.data) ? oppsData.data : (Array.isArray(oppsData) ? oppsData : []));
      setOpportunities(oppList);
      setProfile(profileData?.data || profileData);
    } catch (error) {
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    try {
      await opportunityService.deleteOpportunity(deleteDialog.id);
      toast.success('Opportunity deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete opportunity');
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

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

  const isVerified = profile?.verificationStatus === 'approved';

  return (
    <DashboardLayout sidebar={<NGOSidebar />}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Opportunities</h1>
            <p className="text-gray-400 mt-1">Create and manage your volunteering events.</p>
          </div>
          <Link to="/ngo/opportunities/create">
            <Button disabled={!isVerified} title={!isVerified ? 'Your NGO must be verified to create opportunities' : ''} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Opportunity
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-6"><SkeletonTable columns={6} rows={5} /></div>
          ) : opportunities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Capacity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {opportunities.map((opp) => (
                    <tr key={opp._id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white line-clamp-1">{opp.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{opp.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary-400"/> {formatDateSafe(opp.eventDate || opp.date, 'MMM d, yyyy')}</div>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[150px]">
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400"/> {opp.location?.city || 'Online'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-purple-400"/> {opp.applicationsCount || 0} / {opp.volunteerCapacity}</div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(opp.status)}</td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <Link to={`/opportunities/${opp._id}`}><Button size="icon" variant="ghost" className="text-gray-400 hover:text-white"><Eye className="w-4 h-4"/></Button></Link>
                        <Link to={`/ngo/opportunities/${opp._id}/edit`}><Button size="icon" variant="ghost" className="text-blue-400 hover:text-blue-300"><Edit2 className="w-4 h-4"/></Button></Link>
                        <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => setDeleteDialog({ isOpen: true, id: opp._id })}><Trash2 className="w-4 h-4"/></Button>
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
                description="You haven't created any volunteering opportunities yet."
                action={isVerified ? { label: 'Create First Opportunity', onClick: () => window.location.href = '/ngo/opportunities/create' } : undefined}
              />
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Opportunity"
        message="Are you sure you want to delete this opportunity? This will also cancel all pending applications for it."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
        variant="danger"
      />
    </DashboardLayout>
  );
};

export default NGOOpportunities;
