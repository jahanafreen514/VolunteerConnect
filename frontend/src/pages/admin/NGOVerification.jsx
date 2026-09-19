import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, FileText, CheckCircle, XCircle, Eye, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import SkeletonTable from '../../components/ui/SkeletonTable';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

const NGOVerification = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchNGOs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getNGOs({ verificationStatus: filter, limit: 50 });
      setNgos(data.ngos || data);
    } catch (error) {
      toast.error('Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNGOs();
  }, [filter]);

  const handleVerify = async (status, reason = '') => {
    try {
      await adminService.verifyNGO(selectedNgo._id, { status, adminNote: reason });
      toast.success(`NGO ${status} successfully`);
      setIsModalOpen(false);
      setIsRejectModalOpen(false);
      setRejectReason('');
      fetchNGOs();
    } catch (error) {
      toast.error(`Failed to ${status} NGO`);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error'
    };
    return <Badge variant={map[status] || 'default'} className="uppercase">{status}</Badge>;
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <AnimatedBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">NGO Verification</h1>
            <p className="text-gray-400 mt-1">Review and approve NGO accounts.</p>
          </div>
          
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
            {['pending', 'approved', 'rejected'].map(tab => (
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
          ) : ngos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Organization Name</th>
                    <th className="px-6 py-4">Registration No.</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ngos.map((ngo) => (
                    <tr key={ngo._id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 font-medium text-white">{ngo.organizationName}</td>
                      <td className="px-6 py-4 font-mono text-xs">{ngo.registrationNumber}</td>
                      <td className="px-6 py-4">{ngo.address?.city}, {ngo.address?.country}</td>
                      <td className="px-6 py-4">{getStatusBadge(ngo.verificationStatus)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => { setSelectedNgo(ngo); setIsModalOpen(true); }}
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
                title={`No ${filter} NGOs`} 
                description={`There are no NGOs with ${filter} status.`} 
                icon={ShieldCheck} 
              />
            </div>
          )}
        </Card>
      </div>

      {/* Details Modal */}
      {selectedNgo && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="NGO Verification Details"
          size="2xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Organization Name</p>
                <p className="text-white font-medium">{selectedNgo.organizationName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Registration Number</p>
                <p className="text-white font-mono">{selectedNgo.registrationNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{selectedNgo.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-white">{selectedNgo.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400">Address</p>
                <p className="text-white">{selectedNgo.address?.street}, {selectedNgo.address?.city}, {selectedNgo.address?.state}, {selectedNgo.address?.country} - {selectedNgo.address?.postalCode}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400">Description</p>
                <p className="text-white text-sm bg-white/5 p-3 rounded-lg mt-1">{selectedNgo.description}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3 border-b border-white/10 pb-2">Uploaded Documents</h3>
              {selectedNgo.documents?.length > 0 ? (
                <div className="space-y-2">
                  {selectedNgo.documents.map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary-400" />
                        <span className="text-sm text-white">{doc.name || `Document ${idx+1}`}</span>
                      </div>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm">
                        View <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No documents uploaded.</p>
              )}
            </div>

            {selectedNgo.verificationStatus === 'pending' && (
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => { setIsModalOpen(false); setIsRejectModalOpen(true); }}>
                  Reject
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleVerify('approved')}>
                  Approve NGO
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject NGO"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">Please provide a reason for rejecting this NGO application. This will be visible to the NGO.</p>
          <Textarea 
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="E.g., Invalid registration document provided..."
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => handleVerify('rejected', rejectReason)} disabled={!rejectReason.trim()}>Confirm Rejection</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default NGOVerification;
