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
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-white/8 transition-colors">
      <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-primary-600/30 to-purple-600/30">
        {opp.image ? (
          <img src={opp.image} alt={opp.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary-400 font-semibold text-xs">
            {opp.category || 'Event'}
          </div>
        )}
      </div>

      <div className="flex-1">
        <h4 className="text-lg font-semibold text-white mb-1 line-clamp-1">{opp.title || 'Volunteer Opportunity'}</h4>
        <p className="text-sm text-gray-400 mb-2">{ngoName}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
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
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;
