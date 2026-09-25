import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { getOpportunityImage } from '../utils/categoryImages';

const categoryColors = {
  Environment: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
  Education: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30',
  Health: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30',
  Community: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
  Animals: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
  Default: 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-500/20 dark:text-primary-300 dark:border-primary-500/30'
};

const OpportunityCard = ({ opportunity = {}, onApply, showNGOActions = false }) => {
  const navigate = useNavigate();

  const title = opportunity.title || 'Untitled Opportunity';
  const ngo = opportunity.ngo || opportunity.ngoId || opportunity.ngoProfileId;
  const ngoName = typeof ngo === 'object' ? (ngo?.name || ngo?.organizationName || 'Verified NGO') : (ngo || 'Verified NGO');
  const isVerified = typeof ngo === 'object' ? (ngo?.isVerified || ngo?.verificationStatus === 'approved') : false;
  
  const location = opportunity.location || {};
  const locationText = [location.city, location.state].filter(Boolean).join(', ') || location.address || 'Remote / TBA';
  
  const rawDate = opportunity.eventDate || opportunity.date;
  let formattedDate = 'TBA';
  if (rawDate) {
    try {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        formattedDate = format(parsed, 'MMM d, yyyy');
      }
    } catch {
      formattedDate = 'TBA';
    }
  }

  const category = opportunity.category || 'General';
  const skills = opportunity.requiredSkills || opportunity.skills || [];
  const registeredCount = opportunity.registeredVolunteers ?? opportunity.registeredCount ?? 0;
  const capacity = opportunity.volunteerCapacity ?? opportunity.capacity ?? 10;
  const image = getOpportunityImage(opportunity);

  const isFull = registeredCount >= capacity;
  const progress = Math.min(Math.round((registeredCount / Math.max(capacity, 1)) * 100), 100);
  const isNewsDerived = opportunity.source_type === 'news';
  const distanceKm = opportunity.distanceKm !== undefined && opportunity.distanceKm !== null ? opportunity.distanceKm : null;

  const handleAction = () => {
    if (onApply) {
      onApply(opportunity);
    } else if (opportunity._id) {
      navigate(`/opportunities/${opportunity._id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col hover:bg-white/95 dark:hover:bg-white/[0.08] hover:border-primary-300 dark:hover:border-white/20 shadow-sm hover:shadow-md dark:shadow-glass transition-all duration-300"
    >
      <div className="h-48 w-full relative">
        <img 
          src={image} 
          alt={title} 
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {category && (
            <Badge className={`${categoryColors[category] || categoryColors.Default} backdrop-blur-md`}>
              {category}
            </Badge>
          )}
          {isNewsDerived && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider backdrop-blur-md">
              News-Derived
            </span>
          )}
        </div>

        {distanceKm !== null && (
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{distanceKm < 1 ? '< 1 km away' : `${distanceKm.toFixed(1)} km away`}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs text-slate-500 dark:text-gray-400">
            {isNewsDerived ? `Reported via ${opportunity.source_name || 'Public News'}` : ngoName}
          </span>
          {isVerified && <CheckCircle className="w-3.5 h-3.5 text-accent-500 dark:text-emerald-400" />}
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 line-clamp-2">{title}</h3>
        
        <div className="space-y-2 mb-4 text-sm text-slate-500 dark:text-gray-400 flex-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0 text-slate-400 dark:text-gray-400" />
            <span className="truncate">{locationText}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0 text-slate-400 dark:text-gray-400" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {Array.isArray(skills) && skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.slice(0, 2).map((skill, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10">
                {skill}
              </span>
            ))}
            {skills.length > 2 && (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10">
                +{skills.length - 2} more
              </span>
            )}
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 mb-1">
            <span>{registeredCount} / {capacity} volunteers</span>
            <span>{isFull ? 'Full' : `${capacity - registeredCount} spots left`}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-400' : 'bg-primary-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-200/80 dark:border-white/10">
          {showNGOActions ? (
            <Button variant="outline" className="w-full" onClick={() => onApply?.(opportunity._id)}>
              Manage
            </Button>
          ) : (
            <Button 
              variant={isFull ? 'secondary' : 'primary'} 
              className="w-full" 
              disabled={isFull}
              onClick={handleAction}
            >
              {isFull ? 'Filled' : 'View Details'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OpportunityCard;
