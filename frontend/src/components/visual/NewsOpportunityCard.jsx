import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper, MapPin, Clock, ExternalLink, ShieldCheck, AlertCircle, Building2, BellRing, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { locationService } from '../../services/locationService';
import { getOpportunityImage } from '../../utils/categoryImages';
import toast from 'react-hot-toast';

const NewsOpportunityCard = ({
  event,
  userLocation,
  onAdopted
}) => {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const hasNearbyNGOs = event.nearbyNGOs && event.nearbyNGOs.length > 0;
  const timeAgo = event.published_at 
    ? formatDistanceToNow(new Date(event.published_at), { addSuffix: true }) 
    : 'Recently';

  const handleRequestSupport = async () => {
    setRequesting(true);
    try {
      await locationService.requestSupport(event._id);
      setRequested(true);
      toast.success('Support alert recorded! Nearby non-profits will be notified.');
    } catch (err) {
      toast.error('Failed to register support request. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="glass-card p-5 flex flex-col justify-between group overflow-hidden border border-[#E6E8EC]">
      <div>
        {/* Category Image Banner with Subtle Gradient */}
        <div className="relative h-40 -mx-5 -mt-5 mb-4 overflow-hidden bg-slate-100 border-b border-[#E6E8EC]">
          <img
            src={getOpportunityImage(event)}
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Top Header Overlay Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F6D8C5] text-[#7a4221] border border-[#eebd9e] text-xs font-semibold backdrop-blur-md shadow-soft-sm">
              <Newspaper className="w-3.5 h-3.5" />
              <span>Community Alert</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-white font-medium px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md">
              <Clock className="w-3 h-3 text-[#F6D8C5]" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#26372B] mb-1.5 group-hover:text-[#556e5a] transition-colors leading-snug">
          {event.title}
        </h3>

        {/* Location & Distance */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#667085] mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#54947f] shrink-0" />
          <span>{event.location?.city || 'Local Region'}{event.location?.state ? `, ${event.location.state}` : ''}</span>
          {event.distanceKm !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-[#D8EEE5] text-[#244e44] text-[11px]">
              {event.distanceKm < 1 ? '< 1 km' : `${event.distanceKm.toFixed(1)} km`}
            </span>
          )}
        </div>

        {/* Summary Description */}
        <p className="text-xs text-[#667085] leading-relaxed mb-4 line-clamp-2">
          {event.summary}
        </p>

        {/* Potential Activities */}
        {event.potential_activities && event.potential_activities.length > 0 && (
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-[#354052] block mb-1.5">
              Identified Needs:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {event.potential_activities.slice(0, 3).map((act, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-white border border-[#E6E8EC] text-[11px] text-[#354052] font-medium"
                >
                  {act}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-[#E6E8EC] flex items-center justify-between gap-2">
        {event.source_url ? (
          <a
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#466c9c] hover:underline inline-flex items-center gap-1"
          >
            <span>Read Report</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-xs text-[#667085]">Verified by Community</span>
        )}

        <button
          onClick={handleRequestSupport}
          disabled={requesting || requested}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            requested
              ? 'bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3]'
              : 'btn-primary-pastel'
          }`}
        >
          {requested ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#54947f]" />
              <span>Support Flagged</span>
            </>
          ) : (
            <>
              <BellRing className="w-3.5 h-3.5" />
              <span>Flag for NGOs</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NewsOpportunityCard;
