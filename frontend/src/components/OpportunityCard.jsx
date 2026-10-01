import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { getOpportunityImage } from '../utils/categoryImages';

const categoryTagStyles = {
  Environment: 'bg-[#D8EEE5] text-[#244e44] border-[#bce1d3]',
  Education: 'bg-[#C9DDF2] text-[#24426b] border-[#a3c5eb]',
  Health: 'bg-[#F2D6DD] text-[#8C3B4A] border-[#e6b5c1]',
  Healthcare: 'bg-[#F2D6DD] text-[#8C3B4A] border-[#e6b5c1]',
  Community: 'bg-[#F6D8C5] text-[#7a4221] border-[#eebd9e]',
  Animals: 'bg-[#DDD5F3] text-[#4d387a] border-[#c5b8eb]',
  Default: 'bg-[#BFD8C2] text-[#26372B] border-[#AFCDB5]'
};

const OpportunityCard = ({ opportunity = {}, onApply, showNGOActions = false }) => {
  const navigate = useNavigate();

  const title = opportunity.title || 'Untitled Opportunity';
  const ngo = opportunity.ngo || opportunity.ngoId || opportunity.ngoProfileId;
  const ngoName = typeof ngo === 'object' ? (ngo?.name || ngo?.organizationName || 'Verified NGO') : (ngo || 'Verified NGO');
  const isVerified = typeof ngo === 'object' ? (ngo?.isVerified || ngo?.verificationStatus === 'approved') : false;
  
  const location = opportunity.location || {};
  const locationText = [location.city, location.state].filter(Boolean).join(', ') || location.address || 'Remote / Local';
  
  const rawDate = opportunity.eventDate || opportunity.date;
  let formattedDate = 'Upcoming';
  if (rawDate) {
    try {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        formattedDate = format(parsed, 'MMM d, yyyy');
      }
    } catch {
      formattedDate = 'Upcoming';
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

  const tagStyle = categoryTagStyles[category] || categoryTagStyles.Default;

  return (
    <div
      onClick={handleAction}
      className="glass-card group flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Real-world Photography Window */}
      <div className="h-44 w-full relative overflow-hidden bg-slate-100">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Category tag */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {category && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-md shadow-soft-sm ${tagStyle}`}>
              {category}
            </span>
          )}
          {isNewsDerived && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F6D8C5] text-[#7a4221] border border-[#eebd9e] backdrop-blur-md">
              Community Alert
            </span>
          )}
        </div>

        {distanceKm !== null && (
          <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 backdrop-blur-md text-[#244e44] border border-[#bce1d3] flex items-center gap-1 shadow-soft-sm">
            <MapPin className="w-3 h-3 text-[#54947f]" />
            <span>{distanceKm < 1 ? '< 1 km' : `${distanceKm.toFixed(1)} km`}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-xs font-medium text-[#667085] truncate">
            {isNewsDerived ? `Via ${opportunity.source_name || 'Public News'}` : ngoName}
          </span>
          {isVerified && <CheckCircle className="w-3.5 h-3.5 text-[#54947f] shrink-0" />}
        </div>
        
        <h3 className="text-base font-bold text-[#26372B] mb-2 line-clamp-2 leading-snug group-hover:text-[#556e5a] transition-colors">
          {title}
        </h3>
        
        <div className="space-y-1.5 mb-3 text-xs text-[#667085] flex-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#98A2B3]" />
            <span className="truncate">{locationText}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-[#98A2B3]" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {Array.isArray(skills) && skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {skills.slice(0, 2).map((skill, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-white text-[#354052] border border-[#E6E8EC]">
                {skill}
              </span>
            ))}
            {skills.length > 2 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white text-[#667085] border border-[#E6E8EC]">
                +{skills.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Spots progress */}
        <div className="mb-3.5">
          <div className="flex justify-between text-[11px] text-[#667085] mb-1">
            <span>{registeredCount} / {capacity} volunteers</span>
            <span className="font-medium text-[#26372B]">{isFull ? 'Filled' : `${capacity - registeredCount} spots left`}</span>
          </div>
          <div className="w-full h-1.5 bg-[#E6E8EC] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-[#d48ea0]' : 'bg-[#AFCDB5]'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto pt-3 border-t border-[#E6E8EC]">
          {showNGOActions ? (
            <Button variant="outline" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); onApply?.(opportunity._id); }}>
              Manage Opportunity
            </Button>
          ) : (
            <Button 
              variant={isFull ? 'secondary' : 'primary'} 
              size="sm"
              className="w-full" 
              disabled={isFull}
              onClick={(e) => { e.stopPropagation(); handleAction(); }}
            >
              {isFull ? 'Opportunity Filled' : 'View Opportunity'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
