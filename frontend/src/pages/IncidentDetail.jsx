import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, MapPin, Calendar, Clock, Newspaper, ExternalLink, 
  ShieldCheck, ShieldAlert, AlertTriangle, Building2, Phone, Mail, 
  Globe, Navigation, Share2, Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import PublicLayout from '../layouts/PublicLayout';
import InteractiveMap from '../components/map/InteractiveMap';
import CommunityVerification from '../components/incidents/CommunityVerification';
import CommunityComments from '../components/incidents/CommunityComments';
import CommunityChat from '../components/incidents/CommunityChat';
import { formatDateSafe } from '../utils/date';
import { getOpportunityImage } from '../utils/categoryImages';

const statusConfigMap = {
  NEWS_DETECTED: { label: 'News-Derived / Detected', variant: 'amber', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  NEEDS_VERIFICATION: { label: 'Needs Local Verification', variant: 'amber', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  COMMUNITY_REPORTED: { label: 'Community Reported', variant: 'blue', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  NGO_CONFIRMED: { label: 'NGO Confirmed', variant: 'emerald', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  ACTIVE: { label: 'Active Response', variant: 'cyan', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  RESOLVED: { label: 'Resolved / Concluded', variant: 'gray', bg: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  EXPIRED: { label: 'Archived / Expired', variant: 'gray', bg: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  // Lowercase fallbacks
  news_detected: { label: 'News-Derived', variant: 'amber', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  needs_verification: { label: 'Needs Verification', variant: 'amber', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  confirmed: { label: 'NGO Confirmed', variant: 'emerald', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  active: { label: 'Active', variant: 'cyan', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' }
};

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  const fetchIncident = async () => {
    try {
      const res = await eventService.getEvent(id);
      setIncident(res?.data || null);
    } catch (err) {
      console.error('Error fetching incident:', err);
      setErrorState(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400">Loading incident and community stream...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (errorState || !incident) {
    return (
      <PublicLayout>
        <div className="min-h-screen container mx-auto px-4 py-20 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white mb-2">Incident Record Not Found</h2>
          <p className="text-xs sm:text-sm text-gray-400 mb-6">
            The requested news-derived event may have expired or is no longer accessible.
          </p>
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Opportunities</span>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const statusInfo = statusConfigMap[incident.status] || statusConfigMap.NEEDS_VERIFICATION;
  const locationObj = incident.location || {};
  const cityState = [locationObj.city, locationObj.state].filter(Boolean).join(', ') || 'Regional Area';
  const fullAddress = locationObj.address || cityState;
  const latitude = locationObj.latitude;
  const longitude = locationObj.longitude;
  const org = incident.identifiedOrganization;
  const contact = incident.contact_information;
  const adoptedOpp = incident.adoptedOpportunityId;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Incident link copied to clipboard!');
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen pb-16 bg-transparent">
        {/* Banner with Subtle Gradient and Context Image */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-950 border-b border-white/10">
          <img
            src={getOpportunityImage(incident)}
            alt={incident.title}
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/70 to-black/50" />

          <div className="container mx-auto px-4 sm:px-6 h-full flex flex-col justify-end pb-6 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/15 transition-all backdrop-blur-md"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white border border-white/15 transition-all"
                  title="Share Incident"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto px-4 sm:px-6 mt-6 relative z-10 space-y-6">
          
          {/* Header Title & Status Bar */}
          <div className="glass-card p-5 sm:p-7 border border-white/10 rounded-3xl bg-white/[0.03]">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusInfo.bg}`}>
                {statusInfo.label}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.06] text-gray-300 border border-white/10 uppercase tracking-wider">
                {incident.event_type?.replace('_', ' ') || incident.category || 'Humanitarian'}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Newspaper className="w-3 h-3" />
                NEWS-DERIVED INCIDENT
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-tight">
              {incident.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-gray-300">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                {cityState}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-primary-400 shrink-0" />
                Reported {formatDateSafe(incident.published_at, 'MMM d, yyyy · h:mm a')}
              </span>
              {incident.source_name && (
                <span className="flex items-center gap-1.5 text-gray-400">
                  Source: <strong className="text-white">{incident.source_name}</strong>
                  {incident.source_url && (
                    <a
                      href={incident.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 underline inline-flex items-center gap-0.5 ml-1 font-semibold"
                    >
                      View Source <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Official Travel Guidance Warning (Prompt Section 24) */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs sm:text-sm text-amber-200/90 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200 block mb-0.5">Official Travel & Safety Advisory</strong>
              <span>
                Please check current official guidance and road conditions before travelling to an affected area. 
                Do not self-deploy to emergency flood, fire, or disaster zones without coordination with authoritative emergency teams.
              </span>
            </div>
          </div>

          {/* Two-Column Grid: Map + Key Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Interactive Map */}
            <div className="glass-card p-5 sm:p-6 border border-white/10 rounded-3xl bg-white/[0.03] flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Incident Location on Map
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{fullAddress}</p>
                </div>

                {latitude && longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold transition-all shadow-sm shrink-0"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Directions</span>
                  </a>
                )}
              </div>

              {latitude && longitude ? (
                <div className="rounded-2xl overflow-hidden border border-white/10 h-64 sm:h-72">
                  <InteractiveMap
                    opportunities={[{
                      _id: incident._id,
                      title: incident.title,
                      category: incident.category || 'Community',
                      location: incident.location
                    }]}
                    userLocation={userCoords}
                    height="100%"
                  />
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-gray-400">
                  Approximate coordinates: {cityState}
                </div>
              )}
            </div>

            {/* Right: What is Known Card */}
            <div className="glass-card p-5 sm:p-6 border border-white/10 rounded-3xl bg-white/[0.03] space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-3">
                  What is Known & Reported
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mb-4">
                  {incident.summary || incident.description}
                </p>

                {incident.potential_activities && incident.potential_activities.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      Potential Community Support Activities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {incident.potential_activities.map((act, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-gray-200 font-medium"
                        >
                          • {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 text-xs text-gray-400 flex items-center justify-between">
                <span>Article title: <strong className="text-gray-300">{incident.article_title || incident.title}</strong></span>
                {incident.source_url && (
                  <a
                    href={incident.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 font-semibold inline-flex items-center gap-1 shrink-0 ml-2"
                  >
                    <span>Read Article</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Section 2 & 23: Organization Information Card */}
          <div className="glass-card p-5 sm:p-6 border border-white/10 rounded-3xl bg-white/[0.03]">
            {org ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                      {org.organizationName?.charAt(0) || 'N'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {org.organizationName}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3" />
                          Verified Non-Profit
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Identified partner organization associated with this regional response.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  {org.phone && (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-gray-200">
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{org.phone}</span>
                    </div>
                  )}
                  {org.email && (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-gray-200">
                      <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                      <a href={`mailto:${org.email}`} className="truncate hover:underline">{org.email}</a>
                    </div>
                  )}
                  {org.website && (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-gray-200">
                      <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                      <a href={org.website} target="_blank" rel="noopener noreferrer" className="truncate hover:underline text-cyan-300">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>No registered Virtual Connect NGO has been identified near this incident</span>
                </div>
                <p className="text-xs text-gray-300/90 leading-relaxed max-w-2xl">
                  This report originated from authorized public news feeds. There is currently no registered partner non-profit active in this immediate sector on Virtual Connect.
                </p>

                {contact && (contact.phone || contact.email || contact.website || contact.organization_name) ? (
                  <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      Available Public / Official Contact Information:
                    </span>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-200">
                      {contact.organization_name && <span>Agency: <strong>{contact.organization_name}</strong></span>}
                      {contact.contact_name && <span>Contact: <strong>{contact.contact_name}</strong></span>}
                      {contact.phone && <span>Phone: <strong>{contact.phone}</strong></span>}
                      {contact.email && <span>Email: <strong>{contact.email}</strong></span>}
                      {contact.website && (
                        <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
                          Official Web Portal
                        </a>
                      )}
                    </div>
                    {contact.source_url && (
                      <p className="text-[10px] text-gray-500 italic pt-1">
                        Source: {contact.source_url}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Please verify the situation and local infrastructure before travelling to the location.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 25: Potential Opportunity Link (if adopted/created) */}
          {adoptedOpp && (
            <div className="glass-card p-5 sm:p-6 border border-emerald-500/30 rounded-3xl bg-emerald-950/15">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Official Volunteer Opportunity Available</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1">
                    {adoptedOpp.title || incident.title}
                  </h4>
                  <p className="text-xs text-emerald-200/80">
                    A registered organizer has established an active volunteering opportunity for this incident.
                  </p>
                </div>

                <Link
                  to={`/opportunities/${adoptedOpp._id}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all shrink-0"
                >
                  <span>View & Apply</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Community Verification ("Is this true?") */}
          <CommunityVerification
            eventId={incident._id}
            verificationData={incident.community_verification}
            status={incident.status}
            onUpdated={(updated) => {
              if (updated?.community_verification) {
                setIncident(prev => ({
                  ...prev,
                  community_verification: updated.community_verification,
                  status: updated.status || prev.status
                }));
              }
            }}
            isAuthenticated={Boolean(user)}
          />

          {/* Community Comments Thread */}
          <CommunityComments
            eventId={incident._id}
            currentUser={user}
          />

          {/* Community Live Chat */}
          <CommunityChat
            eventId={incident._id}
            eventTitle={incident.title}
            currentUser={user}
          />

        </div>
      </div>
    </PublicLayout>
  );
};

export default IncidentDetail;
