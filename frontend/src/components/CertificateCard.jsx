import React from 'react';
import { formatDateSafe } from '../utils/date';
import { Download, Share2, Award } from 'lucide-react';
import Button from './ui/Button';

const CertificateCard = ({ certificate }) => {
  const { volunteer, opportunity, hoursAwarded, issueDate, certificateUrl, _id } = certificate;
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pastel-card border-2 border-[#BFD8C2] rounded-3xl overflow-hidden relative group shadow-soft-md bg-white">
      {/* Subtle decorative inner border */}
      <div className="absolute inset-2 border border-[#E6E8EC] rounded-2xl pointer-events-none" />
      
      <div className="relative z-10 p-8 sm:p-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-[#D8EEE5] border-2 border-[#BFD8C2] rounded-full flex items-center justify-center mb-6 shadow-soft-sm">
          <Award className="w-8 h-8 text-[#5b7f63]" />
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-[#354052] mb-1 font-serif tracking-tight">
          Certificate of Participation
        </h2>
        <p className="text-[#667085] mb-8 uppercase tracking-widest text-xs font-semibold">VolunteerConnect Community Impact</p>
        
        <p className="text-[#667085] mb-2 text-sm italic">This is proudly presented to</p>
        <h3 className="text-2xl sm:text-3xl font-bold text-[#26372B] mb-6 border-b-2 border-[#BFD8C2] pb-2 px-8 inline-block">
          {volunteer?.name || 'Volunteer Name'}
        </h3>
        
        <p className="text-[#354052] max-w-lg mb-8 leading-relaxed text-sm">
          for dedicated service and completing <span className="font-bold text-[#5b7f63] bg-[#D8EEE5] px-2 py-0.5 rounded-md">{hoursAwarded || 0} hours</span> of community support for{' '}
          <span className="font-semibold text-[#26372B]">{opportunity?.title || 'Civic Event'}</span> organized by{' '}
          <span className="font-semibold text-[#26372B]">{opportunity?.ngo?.name || 'NGO Partner'}</span>.
        </p>
        
        <div className="w-full flex justify-between items-end mt-4 pt-6 border-t border-[#E6E8EC]">
          <div className="text-left">
            <p className="text-xs text-[#667085] mb-0.5 font-medium">Issue Date</p>
            <p className="text-[#354052] font-semibold text-sm">{formatDateSafe(issueDate, 'MMMM do, yyyy')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#667085] mb-0.5 font-medium">Certificate Verification ID</p>
            <p className="text-[#667085] font-mono text-[11px]">{_id}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons (hidden when printing) */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity print:hidden z-20">
        <Button variant="secondary" size="sm" onClick={handlePrint} className="btn-secondary-pastel text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Download
        </Button>
        {certificateUrl && (
          <Button variant="secondary" size="sm" className="btn-secondary-pastel text-xs">
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
};

export default CertificateCard;
