import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
        opportunityService.getOpportunities({ isNgo: true, limit: 100 }),
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
    return <Badge variant={map[status] || 'default'} className="font-semibold text-xs">{status}</Badge>;
  };

  const isVerified = profile?.verificationStatus === 'approved';

  return (
    <DashboardLayout sidebar={<NGOSidebar />}>
      <div className="relative z-10 w-full px-2 sm:px-4 lg:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#354052] tracking-tight">Manage Opportunities</h1>
            <p className="text-sm text-[#667085] mt-1">Create, edit, and organize your volunteering events and civic initiatives.</p>
          </div>
          <Link to="/ngo/opportunities/create">
            <Button className="flex items-center gap-2 px-5 py-2.5 font-semibold text-sm !bg-[#AFCDB5] !text-[#26372B] hover:!bg-[#9EBEA4] shadow-soft-sm">
              <Plus className="w-4 h-4" /> Create Opportunity
            </Button>
          </Link>
        </div>

        <div className="pastel-card overflow-hidden">
          {loading ? (
            <div className="p-6"><SkeletonTable columns={6} rows={5} /></div>
          ) : opportunities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#354052]">
                <thead className="bg-[#F5F1FA]/80 text-[#667085] uppercase text-xs font-semibold border-b border-[#E6E8EC]">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Capacity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E8EC]">
                  {opportunities.map((opp) => (
                    <tr key={opp._id} className="hover:bg-[#F9FBF9] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#354052] line-clamp-1">{opp.title}</div>
                        <div className="text-xs text-[#667085] mt-0.5">{opp.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#667085]">
                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#28486D]"/> {formatDateSafe(opp.eventDate || opp.date, 'MMM d, yyyy')}</div>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[150px] text-[#667085]">
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#4D8256]"/> {opp.location?.city || 'Online'}</div>
                      </td>
                      <td className="px-6 py-4 text-[#28486D] font-semibold">
                        <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#4D3A7A]"/> {opp.applicationsCount || 0} / {opp.volunteerCapacity}</div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(opp.status)}</td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <Link to={`/opportunities/${opp._id}`}><Button size="icon" variant="ghost" className="!text-[#667085] hover:!text-[#354052] hover:!bg-[#F5F1FA]"><Eye className="w-4 h-4"/></Button></Link>
                        <Link to={`/ngo/opportunities/${opp._id}/edit`}><Button size="icon" variant="ghost" className="!text-[#28486D] hover:!bg-[#C9DDF2]/30"><Edit2 className="w-4 h-4"/></Button></Link>
                        <Button size="icon" variant="ghost" className="!text-[#9A3445] hover:!bg-[#F2D6DD]/30" onClick={() => setDeleteDialog({ isOpen: true, id: opp._id })}><Trash2 className="w-4 h-4"/></Button>
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
        </div>
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
