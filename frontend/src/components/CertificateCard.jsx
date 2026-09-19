import React from 'react';
import { formatDateSafe } from '../utils/date';
import { Download, Share2 } from 'lucide-react';
import Button from './ui/Button';

const CertificateCard = ({ certificate }) => {
  const { volunteer, opportunity, hoursAwarded, issueDate, certificateUrl, _id } = certificate;
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden relative group">
      {/* Decorative gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-accent-500/20 z-0 pointer-events-none" />
      
      <div className="relative z-10 p-8 sm:p-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
          <span className="text-white text-2xl font-bold">VC</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400 mb-2 font-serif">
          Certificate of Participation
        </h2>
        <p className="text-gray-400 mb-8 uppercase tracking-widest text-sm">Volunteer Connect</p>
        
        <p className="text-gray-300 mb-2">This is to certify that</p>
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 border-b border-white/20 pb-2 px-8 inline-block">
          {volunteer?.name || 'Volunteer Name'}
        </h3>
        
        <p className="text-gray-300 max-w-lg mb-8 leading-relaxed">
          has successfully dedicated <span className="font-bold text-primary-400">{hoursAwarded || 0} hours</span> of their valuable time 
          volunteering for <span className="font-bold text-white">{opportunity?.title || 'Event Name'}</span> 
          organized by <span className="font-bold text-white">{opportunity?.ngo?.name || 'NGO Name'}</span>.
        </p>
        
        <div className="w-full flex justify-between items-end mt-4 pt-8 border-t border-white/10">
          <div className="text-left">
            <p className="text-sm text-gray-400 mb-1">Date</p>
            <p className="text-white font-medium">{formatDateSafe(issueDate, 'MMMM do, yyyy')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-1">Certificate ID</p>
            <p className="text-gray-500 font-mono text-xs">{_id}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons (hidden when printing) */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity print:hidden z-20">
        <Button variant="secondary" size="sm" onClick={handlePrint}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        {certificateUrl && (
          <Button variant="secondary" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
};

export default CertificateCard;
