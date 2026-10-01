import React from 'react';
import { formatDateSafe } from '../utils/date';
import { Trash2 } from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';

const statusConfig = {
  pending: { variant: 'warning', label: 'Pending' },
  accepted: { variant: 'success', label: 'Accepted' },
  rejected: { variant: 'error', label: 'Rejected' },
  cancelled: { variant: 'neutral', label: 'Cancelled' },
  completed: { variant: 'info', label: 'Completed' }
};

const ApplicationCard = ({ application, onCancel }) => {
  const opp = application?.opportunity || application?.opportunityId || {};
  const ngoName = opp?.ngo?.name || opp?.ngo?.organizationName || opp?.ngoId?.name || 'NGO Partner';
  const status = statusConfig[application?.status] || statusConfig.pending;

  return (
    <div className="pastel-card border border-[#E6E8EC] p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:border-[#BFD8C2] transition-all">
      <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-[#D8EEE5] to-[#C9DDF2]">
        {opp.image ? (
          <img src={opp.image} alt={opp.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#5b7f63] font-semibold text-xs text-center p-2">
            {opp.category || 'Event'}
          </div>
        )}
      </div>

      <div className="flex-1">
        <h4 className="text-base font-bold text-[#354052] mb-1 line-clamp-1">{opp.title || 'Volunteer Opportunity'}</h4>
        <p className="text-xs text-[#667085] mb-2">{ngoName}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#667085]">
          <span>Applied: {formatDateSafe(application?.appliedAt || application?.createdAt, 'MMM d, yyyy')}</span>
          <span>Event: {formatDateSafe(opp.eventDate || opp.date, 'MMM d, yyyy')}</span>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0">
        <Badge variant={status.variant}>{status.label}</Badge>
        {application.status === 'pending' && onCancel && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onCancel(application._id)}
            className="text-[#9B5B65] hover:text-[#7f3e48] hover:bg-[#F2D6DD]/40 px-2 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;
