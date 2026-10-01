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
      const res = await adminService.getNGOs({ verificationStatus: filter, limit: 50 });
      const list = res?.data?.ngos || res?.ngos || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setNgos(list);
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
    return <Badge variant={map[status] || 'default'} className="uppercase font-semibold text-xs">{status}</Badge>;
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#354052]">NGO Verification</h1>
            <p className="text-[#667085] mt-1 text-sm">Review credentials, registered legal documents, and approve NGO accounts.</p>
          </div>
          
          <div className="flex bg-[#F5F1FA] border border-[#E6E8EC] rounded-xl p-1 shadow-soft-sm">
            {['pending', 'approved', 'rejected'].map(tab => (
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
          ) : ngos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#354052]">
                <thead className="bg-[#F5F1FA]/80 text-[#667085] uppercase text-xs font-semibold border-b border-[#E6E8EC]">
                  <tr>
                    <th className="px-6 py-4">Organization Name</th>
                    <th className="px-6 py-4">Registration No.</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E8EC]">
                  {ngos.map((ngo) => (
                    <tr key={ngo._id} className="hover:bg-[#F9FBF9] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#354052]">{ngo.organizationName}</td>
                      <td className="px-6 py-4 font-mono text-xs text-[#667085]">{ngo.registrationNumber}</td>
                      <td className="px-6 py-4 text-[#667085]">{ngo.address?.city}, {ngo.address?.country}</td>
                      <td className="px-6 py-4">{getStatusBadge(ngo.verificationStatus)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => { setSelectedNgo(ngo); setIsModalOpen(true); }}
                          className="flex items-center gap-1.5 ml-auto !border-[#E6E8EC] !text-[#354052] hover:!bg-[#F5F1FA]"
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
                title={`No ${filter} NGOs`} 
                description={`There are no NGOs with ${filter} status.`} 
                icon={ShieldCheck} 
              />
            </div>
          )}
        </div>
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
                <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Organization Name</p>
                <p className="text-[#354052] font-semibold text-base mt-0.5">{selectedNgo.organizationName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Registration Number</p>
                <p className="text-[#354052] font-mono text-sm mt-0.5">{selectedNgo.registrationNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Email</p>
                <p className="text-[#354052] text-sm mt-0.5">{selectedNgo.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Phone</p>
                <p className="text-[#354052] text-sm mt-0.5">{selectedNgo.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Address</p>
                <p className="text-[#354052] text-sm mt-0.5">{selectedNgo.address?.street}, {selectedNgo.address?.city}, {selectedNgo.address?.state}, {selectedNgo.address?.country} - {selectedNgo.address?.postalCode}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Description</p>
                <p className="text-[#354052] text-sm bg-[#F5F1FA]/60 border border-[#E6E8EC] p-3.5 rounded-xl mt-1.5 leading-relaxed">{selectedNgo.description}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#667085] uppercase tracking-wider mb-3 border-b border-[#E6E8EC] pb-2">Uploaded Documents</h3>
              {selectedNgo.documents?.length > 0 ? (
                <div className="space-y-2">
                  {selectedNgo.documents.map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white border border-[#E6E8EC] rounded-xl shadow-soft-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#4D8256]" />
                        <span className="text-sm text-[#354052] font-medium">{doc.name || `Document ${idx+1}`}</span>
                      </div>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[#3F6B8F] hover:text-[#28486D] flex items-center gap-1 text-xs font-semibold">
                        View <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#667085] italic">No documents uploaded.</p>
              )}
            </div>

            {selectedNgo.verificationStatus === 'pending' && (
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E6E8EC]">
                <Button 
                  variant="outline" 
                  className="!border-[#F2D6DD] !text-[#9A3445] hover:!bg-[#F2D6DD]/30" 
                  onClick={() => { setIsModalOpen(false); setIsRejectModalOpen(true); }}
                >
                  Reject
                </Button>
                <Button 
                  className="!bg-[#BFD8C2] !text-[#26372B] hover:!bg-[#AFCDB5] font-semibold shadow-soft-sm" 
                  onClick={() => handleVerify('approved')}
                >
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
          <p className="text-sm text-[#667085]">Please provide a reason for rejecting this NGO application. This will be visible to the NGO.</p>
          <Textarea 
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="E.g., Invalid registration document provided..."
            rows={4}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" className="!text-[#667085]" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button 
              variant="danger" 
              className="!bg-[#F2D6DD] !text-[#852E3E] hover:!bg-[#F2D6DD]/80 font-semibold"
              onClick={() => handleVerify('rejected', rejectReason)} 
              disabled={!rejectReason.trim()}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default NGOVerification;
