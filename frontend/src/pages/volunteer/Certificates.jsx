import React, { useEffect, useState } from 'react';
import { Download, Award, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDateSafe } from '../../utils/date';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import VolunteerSidebar from '../../components/layouts/VolunteerSidebar';
import { certificateService } from '../../services/certificateService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await certificateService.getMyCertificates();
        const list = res?.data?.certificates || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
        setCertificates(list);
      } catch (error) {
        toast.error('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout sidebar={<VolunteerSidebar />}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pastel-card p-6 border border-[#E6E8EC]">
          <div>
            <h1 className="text-2xl font-bold text-[#354052]">My Certificates</h1>
            <p className="text-xs text-[#667085] mt-1">View, download, and verify your official earned certificates of participation.</p>
          </div>
          {certificates.length > 0 && (
            <Button onClick={handlePrint} variant="outline" className="btn-secondary-pastel flex items-center gap-2 text-xs">
              <Printer className="w-4 h-4" /> Print View
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => {
              const opp = cert.opportunityId || cert.opportunity || {};
              const volunteerName = cert.volunteerId?.name || cert.user?.name || 'Valued Volunteer';
              const oppTitle = opp.title || 'Community Service Activity';
              const ngoName = cert.ngoId?.name || opp.ngo?.organizationName || opp.ngoName || 'NGO Partner';
              const hours = cert.hours || cert.hoursLogged || 0;
              const issueDate = cert.issuedAt || cert.issueDate || cert.createdAt;
              const certId = cert.certificateNumber || (cert._id ? cert._id.substring(0, 8).toUpperCase() : 'CERT');

              return (
                <Card key={cert._id} className="relative overflow-hidden group border-2 border-[#BFD8C2] rounded-3xl pastel-card">
                  <div className="absolute top-3 right-3 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button size="icon" variant="primary" onClick={handlePrint} title="Print" className="btn-primary-pastel w-8 h-8 rounded-lg">
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="p-6 text-center border-b border-[#E6E8EC] bg-[#D8EEE5]/40">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-[#BFD8C2] shadow-soft-sm">
                      <Award className="w-6 h-6 text-[#5b7f63]" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#354052] mb-1">Certificate of Participation</h3>
                    <p className="text-xs text-[#667085]">This certifies that</p>
                    <p className="text-base font-bold text-[#26372B] mt-1">{volunteerName}</p>
                  </div>
                  
                  <div className="p-6 space-y-3 text-center">
                    <p className="text-xs text-[#667085]">has successfully completed</p>
                    <div>
                      <p className="font-semibold text-sm text-[#354052]">{oppTitle}</p>
                      <p className="text-xs text-[#667085]">with {ngoName}</p>
                    </div>
                    
                    <div className="pt-3 border-t border-[#E6E8EC] flex justify-between items-center text-xs text-[#667085]">
                      <span>{formatDateSafe(issueDate, 'MMM d, yyyy', 'Recent')}</span>
                      <span className="font-semibold text-[#5b7f63] bg-[#D8EEE5] px-2 py-0.5 rounded-md">{hours} Hours</span>
                    </div>
                    <div className="text-[11px] text-[#667085] mt-2 font-mono">
                      ID: {certId}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState 
            title="No certificates yet" 
            description="Complete volunteer opportunities to earn official certificates of contribution." 
            icon={Award}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Certificates;
