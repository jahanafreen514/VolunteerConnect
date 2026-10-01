import React, { useEffect, useState } from 'react';
import { Flag, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDateSafe } from '../../utils/date';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import SkeletonTable from '../../components/ui/SkeletonTable';
import EmptyState from '../../components/ui/EmptyState';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReports({ status: filter, limit: 50 });
      const list = res?.data?.reports || res?.reports || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setReports(list);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleUpdateStatus = async (status) => {
    try {
      await adminService.updateReportStatus(selectedReport._id, { status, adminNote });
      toast.success(`Report marked as ${status}`);
      setIsModalOpen(false);
      setAdminNote('');
      fetchReports();
    } catch (error) {
      toast.error('Failed to update report');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'warning',
      resolved: 'success',
      dismissed: 'default'
    };
    return <Badge variant={map[status] || 'default'} className="uppercase font-semibold text-xs">{status}</Badge>;
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#354052]">Reports & Moderation</h1>
            <p className="text-[#667085] mt-1 text-sm">Review community feedback, content flags, and resolution notes.</p>
          </div>
          
          <div className="flex bg-[#F5F1FA] border border-[#E6E8EC] rounded-xl p-1 shadow-soft-sm">
            {['pending', 'resolved', 'dismissed'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab 
                    ? 'bg-white text-[#354052] shadow-soft-sm' 
                    : 'text-[#667085] hover:text-[#354052]'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="pastel-card overflow-hidden">
          {loading ? (
            <div className="p-6"><SkeletonTable columns={5} rows={5} /></div>
          ) : reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#354052]">
                <thead className="bg-[#F5F1FA]/80 text-[#667085] uppercase text-xs font-semibold border-b border-[#E6E8EC]">
                  <tr>
                    <th className="px-6 py-4">Reporter</th>
                    <th className="px-6 py-4">Target Type</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E8EC]">
                  {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-[#F9FBF9] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#354052]">{report.reporter?.name || 'Anonymous User'}</div>
                        <div className="text-xs text-[#667085]">{report.reporter?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="default" className="uppercase text-xs font-semibold">{report.targetType}</Badge>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[240px] text-[#354052]">{report.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#667085]">{formatDateSafe(report.createdAt, 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => { 
                            setSelectedReport(report); 
                            setAdminNote(report.adminNote || '');
                            setIsModalOpen(true); 
                          }}
                          className="flex items-center gap-1.5 ml-auto !border-[#E6E8EC] !text-[#354052] hover:!bg-[#F5F1FA] text-xs"
                        >
                          <Eye className="w-4 h-4 text-[#667085]" /> Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState 
                title={`No ${filter} reports`} 
                description={`There are no reports with ${filter} status.`} 
                icon={Flag} 
              />
            </div>
          )}
        </div>
      </div>

      {selectedReport && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Review Report"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Target Type</p>
                <p className="text-[#354052] font-semibold text-base capitalize mt-0.5">{selectedReport.targetType}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider mb-1">Status</p>
                {getStatusBadge(selectedReport.status)}
              </div>
            </div>
            
            <div className="bg-[#F5F1FA]/60 p-4 rounded-xl border border-[#E6E8EC]">
              <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider mb-1">Reason for reporting</p>
              <p className="text-[#354052] text-sm leading-relaxed">{selectedReport.reason}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Admin Notes</label>
              <Textarea 
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add notes about how this was handled..."
                rows={3}
                disabled={selectedReport.status !== 'pending'}
              />
            </div>

            {selectedReport.status === 'pending' && (
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E6E8EC]">
                <Button 
                  variant="outline" 
                  className="!border-[#E6E8EC] !text-[#667085] hover:!bg-[#F5F1FA]" 
                  onClick={() => handleUpdateStatus('dismissed')}
                >
                  Dismiss Report
                </Button>
                <Button 
                  variant="primary" 
                  className="!bg-[#BFD8C2] !text-[#26372B] hover:!bg-[#AFCDB5] font-semibold shadow-soft-sm" 
                  onClick={() => handleUpdateStatus('resolved')}
                >
                  Mark Resolved
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default Reports;
