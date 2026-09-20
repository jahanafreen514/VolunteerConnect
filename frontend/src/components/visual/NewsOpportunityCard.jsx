import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, MapPin, Clock, ExternalLink, ShieldCheck, AlertCircle, Building2, BellRing, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { locationService } from '../../services/locationService';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-3xl bg-[#0a0f28]/60 hover:bg-[#0a0f28]/80 backdrop-blur-2xl border border-amber-500/30 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)] hover:border-amber-400/60 transition-all flex flex-col justify-between group"
    >
      <div>
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Newspaper className="w-3.5 h-3.5" />
            <span>NEWS-DERIVED</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors leading-snug">
          {event.title}
        </h3>

        {/* Location & Distance */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 mb-4">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{event.location?.city || 'Local Region'}{event.location?.state ? `, ${event.location.state}` : ''}</span>
          {event.distanceKm !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 text-[11px]">
              📍 {event.distanceKm} km away
            </span>
          )}
        </div>

        {/* Summary Description */}
        <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed mb-5 line-clamp-3">
          {event.summary}
        </p>

        {/* Potential Activities */}
        {event.potential_activities && event.potential_activities.length > 0 && (
          <div className="mb-5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Potential Volunteer Support:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {event.potential_activities.map((act, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-gray-200 font-medium"
                >
                  • {act}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nearby NGOs Status or Missing Fallback */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 mb-5">
          {hasNearbyNGOs ? (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{event.nearbyNGOs.length} Registered NGO{event.nearbyNGOs.length > 1 ? 's' : ''} in Region</span>
              </div>
              <p className="text-xs text-gray-400">
                {event.nearbyNGOs.map(n => `${n.organizationName} (${n.distanceKm} km)`).join(' · ')}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>No active Volunteer Connect NGO found nearby</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">
                Recent reports indicate a community need in this area. Status: <span className="font-semibold text-gray-300">Needs local organization verification</span>.
              </p>

              <button
                type="button"
                onClick={handleRequestSupport}
                disabled={requesting || requested}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-all disabled:opacity-50"
              >
                {requested ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Support Requested ({event.supportRequestsCount + 1})</span>
                  </>
                ) : (
                  <>
                    <BellRing className="w-3.5 h-3.5" />
                    <span>Request NGO Support</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Source Transparency & Disclaimer */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <span>Source: <strong className="text-white">{event.source_name}</strong></span>
          <a
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 font-semibold hover:underline"
          >
            View Article <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <span className="text-[10px] text-gray-500 italic max-w-xs text-right">
          * Verify with coordinators before participating.
        </span>
      </div>
    </motion.div>
  );
};

export default NewsOpportunityCard;
