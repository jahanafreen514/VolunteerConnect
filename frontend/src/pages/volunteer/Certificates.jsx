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
import SkeletonCard from '../../components/ui/SkeletonCard';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

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
      <AnimatedBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">My Certificates</h1>
            <p className="text-gray-400">View and download your earned certificates.</p>
          </div>
          {certificates.length > 0 && (
            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
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
                <Card key={cert._id} className="relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button size="icon" variant="primary" onClick={handlePrint} title="Print">
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="p-8 text-center border-b border-white/5 bg-gradient-to-br from-primary-900/20 to-purple-900/20">
                    <Award className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                    <h3 className="text-xl font-serif text-white mb-1">Certificate of Participation</h3>
                    <p className="text-sm text-gray-400">This certifies that</p>
                    <p className="text-lg font-bold text-primary-400 mt-2">{volunteerName}</p>
                  </div>
                  
                  <div className="p-6 space-y-4 text-center">
                    <p className="text-sm text-gray-300">has successfully completed</p>
                    <div>
                      <p className="font-semibold text-white">{oppTitle}</p>
                      <p className="text-sm text-gray-400">with {ngoName}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
                      <span>{formatDateSafe(issueDate, 'MMM d, yyyy', 'Recent')}</span>
                      <span>{hours} Hours</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2 font-mono">
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
            description="Complete volunteer opportunities to earn certificates." 
            icon={Award}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Certificates;
