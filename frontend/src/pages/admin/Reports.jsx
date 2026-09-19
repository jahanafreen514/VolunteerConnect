import React, { useEffect, useState } from 'react';
import { Flag, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
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
    return <Badge variant={map[status] || 'default'} className="uppercase">{status}</Badge>;
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <p className="text-gray-400 mt-1">Manage user reports and content flags.</p>
          </div>
          
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
            {['pending', 'resolved', 'dismissed'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-6"><SkeletonTable columns={5} rows={5} /></div>
          ) : reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Reporter</th>
                    <th className="px-6 py-4">Target Type</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{report.reporter?.name}</div>
                        <div className="text-xs text-gray-500">{report.reporter?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="default" className="uppercase text-xs">{report.targetType}</Badge>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[200px]">{report.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">{formatDateSafe(report.createdAt, 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => { 
                            setSelectedReport(report); 
                            setAdminNote(report.adminNote || '');
                            setIsModalOpen(true); 
                          }}
                          className="flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-4 h-4" /> Review
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
        </Card>
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
                <p className="text-sm text-gray-400">Target Type</p>
                <p className="text-white font-medium capitalize">{selectedReport.targetType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                {getStatusBadge(selectedReport.status)}
              </div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Reason for reporting</p>
              <p className="text-white">{selectedReport.reason}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">Admin Notes</label>
              <Textarea 
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add notes about how this was handled..."
                rows={3}
                disabled={selectedReport.status !== 'pending'}
              />
            </div>

            {selectedReport.status === 'pending' && (
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={() => handleUpdateStatus('dismissed')}>Dismiss Report</Button>
                <Button variant="primary" onClick={() => handleUpdateStatus('resolved')}>Mark Resolved</Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default Reports;
