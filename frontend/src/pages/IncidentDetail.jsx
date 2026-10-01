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
  NEWS_DETECTED: { label: 'News-Derived / Detected', variant: 'amber', bg: 'bg-[#F6D8C5]/50 text-[#854D27] border-[#F6D8C5]' },
  NEEDS_VERIFICATION: { label: 'Needs Local Verification', variant: 'amber', bg: 'bg-[#FFF8EF] text-[#854D27] border-[#F6D8C5]' },
  COMMUNITY_REPORTED: { label: 'Community Reported', variant: 'blue', bg: 'bg-[#C9DDF2]/50 text-[#28486D] border-[#C9DDF2]' },
  NGO_CONFIRMED: { label: 'NGO Confirmed', variant: 'emerald', bg: 'bg-[#D8EEE5] text-[#26372B] border-[#BFD8C2]' },
  ACTIVE: { label: 'Active Response', variant: 'cyan', bg: 'bg-[#C9DDF2]/60 text-[#28486D] border-[#C9DDF2]' },
  RESOLVED: { label: 'Resolved / Concluded', variant: 'gray', bg: 'bg-[#DDD5F3]/50 text-[#4D3A7A] border-[#DDD5F3]' },
  EXPIRED: { label: 'Archived / Expired', variant: 'gray', bg: 'bg-gray-100 text-gray-600 border-gray-200' },
  // Lowercase fallbacks
  news_detected: { label: 'News-Derived', variant: 'amber', bg: 'bg-[#F6D8C5]/50 text-[#854D27] border-[#F6D8C5]' },
  needs_verification: { label: 'Needs Verification', variant: 'amber', bg: 'bg-[#FFF8EF] text-[#854D27] border-[#F6D8C5]' },
  confirmed: { label: 'NGO Confirmed', variant: 'emerald', bg: 'bg-[#D8EEE5] text-[#26372B] border-[#BFD8C2]' },
  active: { label: 'Active', variant: 'cyan', bg: 'bg-[#C9DDF2]/60 text-[#28486D] border-[#C9DDF2]' }
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
            <div className="w-10 h-10 border-2 border-[#BFD8C2] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#667085]">Loading incident and community stream...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (errorState || !incident) {
    return (
      <PublicLayout>
        <div className="min-h-screen container mx-auto px-4 py-20 text-center">
          <AlertTriangle className="w-12 h-12 text-[#B87033] mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-[#354052] mb-2">Incident Record Not Found</h2>
          <p className="text-xs sm:text-sm text-[#667085] mb-6">
            The requested news-derived event may have expired or is no longer accessible.
          </p>
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#AFCDB5] text-[#26372B] text-xs font-semibold hover:bg-[#9EBEA4] transition-all shadow-soft-sm"
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
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-100 border-b border-[#E6E8EC]">
          <img
            src={getOpportunityImage(incident)}
            alt={incident.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FFF8EF] via-[#FFF8EF]/80 to-transparent" />

          <div className="container mx-auto px-4 sm:px-6 h-full flex flex-col justify-end pb-6 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs font-semibold text-[#354052] border border-[#E6E8EC] transition-all backdrop-blur-md shadow-soft-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs text-[#354052] font-semibold border border-[#E6E8EC] transition-all shadow-soft-sm"
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
          <div className="pastel-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusInfo.bg}`}>
                {statusInfo.label}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F1FA] text-[#4D3A7A] border border-[#DDD5F3] uppercase tracking-wider">
                {incident.event_type?.replace('_', ' ') || incident.category || 'Humanitarian'}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF8EF] text-[#854D27] border border-[#F6D8C5] flex items-center gap-1">
                <Newspaper className="w-3 h-3 text-[#B87033]" />
                NEWS-DERIVED INCIDENT
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#354052] mb-3 leading-tight">
              {incident.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#667085]">
              <span className="flex items-center gap-1.5 font-medium text-[#354052]">
                <MapPin className="w-4 h-4 text-[#A84A5B] shrink-0" />
                {cityState}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-[#28486D] shrink-0" />
                Reported {formatDateSafe(incident.published_at, 'MMM d, yyyy · h:mm a')}
              </span>
              {incident.source_name && (
                <span className="flex items-center gap-1.5">
                  Source: <strong className="text-[#354052]">{incident.source_name}</strong>
                  {incident.source_url && (
                    <a
                      href={incident.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#28486D] hover:underline inline-flex items-center gap-0.5 ml-1 font-semibold"
                    >
                      View Source <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Official Travel Guidance Warning */}
          <div className="p-4 rounded-2xl bg-[#FFF8EF] border border-[#F6D8C5] flex items-start gap-3 text-xs sm:text-sm text-[#854D27] leading-relaxed shadow-soft-sm">
            <AlertTriangle className="w-5 h-5 text-[#B87033] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#854D27] block mb-0.5 font-bold">Official Travel & Safety Advisory</strong>
              <span>
                Please check current official guidance and road conditions before travelling to an affected area. 
                Do not self-deploy to emergency flood, fire, or disaster zones without coordination with authoritative emergency teams.
              </span>
            </div>
          </div>

          {/* Two-Column Grid: Map + Key Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Interactive Map */}
            <div className="pastel-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#354052] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#4D8256]" />
                    Incident Location on Map
                  </h3>
                  <p className="text-xs text-[#667085] mt-0.5">{fullAddress}</p>
                </div>

                {latitude && longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#AFCDB5] hover:bg-[#9EBEA4] text-[#26372B] text-xs font-semibold transition-all shadow-soft-sm shrink-0"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Directions</span>
                  </a>
                )}
              </div>

              {latitude && longitude ? (
                <div className="rounded-2xl overflow-hidden border border-[#E6E8EC] h-64 sm:h-72 shadow-soft-sm">
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
                <div className="p-8 rounded-2xl bg-[#F5F1FA]/50 border border-dashed border-[#E6E8EC] text-center text-xs text-[#667085]">
                  Approximate coordinates: {cityState}
                </div>
              )}
            </div>

            {/* Right: What is Known Card */}
            <div className="pastel-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#354052] mb-3">
                  What is Known & Reported
                </h3>
                <p className="text-xs sm:text-sm text-[#354052] leading-relaxed whitespace-pre-wrap mb-4">
                  {incident.summary || incident.description}
                </p>

                {incident.potential_activities && incident.potential_activities.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
                      Potential Community Support Activities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {incident.potential_activities.map((act, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-xl bg-[#D8EEE5]/50 border border-[#BFD8C2] text-xs text-[#26372B] font-medium"
                        >
                          • {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#E6E8EC] text-xs text-[#667085] flex items-center justify-between">
                <span>Article title: <strong className="text-[#354052]">{incident.article_title || incident.title}</strong></span>
                {incident.source_url && (
                  <a
                    href={incident.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#28486D] hover:underline font-semibold inline-flex items-center gap-1 shrink-0 ml-2"
                  >
                    <span>Read Article</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Section 2 & 23: Organization Information Card */}
          <div className="pastel-card p-5 sm:p-6">
            {org ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#D8EEE5] text-[#26372B] border border-[#BFD8C2] flex items-center justify-center font-bold text-xl shrink-0">
                      {org.organizationName?.charAt(0) || 'N'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-[#354052]">
                          {org.organizationName}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D8EEE5] text-[#26372B] border border-[#BFD8C2] text-[10px] font-bold uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3 text-[#4D8256]" />
                          Verified Non-Profit
                        </span>
                      </div>
                      <p className="text-xs text-[#667085] mt-0.5">
                        Identified partner organization associated with this regional response.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  {org.phone && (
                    <div className="p-3 rounded-xl bg-white border border-[#E6E8EC] flex items-center gap-2 text-[#354052] shadow-soft-sm">
                      <Phone className="w-4 h-4 text-[#4D8256] shrink-0" />
                      <span>{org.phone}</span>
                    </div>
                  )}
                  {org.email && (
                    <div className="p-3 rounded-xl bg-white border border-[#E6E8EC] flex items-center gap-2 text-[#354052] shadow-soft-sm">
                      <Mail className="w-4 h-4 text-[#28486D] shrink-0" />
                      <a href={`mailto:${org.email}`} className="truncate hover:underline">{org.email}</a>
                    </div>
                  )}
                  {org.website && (
                    <div className="p-3 rounded-xl bg-white border border-[#E6E8EC] flex items-center gap-2 text-[#354052] shadow-soft-sm">
                      <Globe className="w-4 h-4 text-[#28486D] shrink-0" />
                      <a href={org.website} target="_blank" rel="noopener noreferrer" className="truncate hover:underline text-[#28486D]">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#B87033] font-bold text-sm sm:text-base">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>No registered VolunteerConnect NGO has been identified near this incident</span>
                </div>
                <p className="text-xs text-[#667085] leading-relaxed max-w-2xl">
                  This report originated from authorized public news feeds. There is currently no registered partner non-profit active in this immediate sector on VolunteerConnect.
                </p>

                {contact && (contact.phone || contact.email || contact.website || contact.organization_name) ? (
                  <div className="mt-4 p-4 rounded-2xl bg-[#F5F1FA]/60 border border-[#E6E8EC] space-y-2">
                    <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
                      Available Public / Official Contact Information:
                    </span>
                    <div className="flex flex-wrap gap-4 text-xs text-[#354052]">
                      {contact.organization_name && <span>Agency: <strong>{contact.organization_name}</strong></span>}
                      {contact.contact_name && <span>Contact: <strong>{contact.contact_name}</strong></span>}
                      {contact.phone && <span>Phone: <strong>{contact.phone}</strong></span>}
                      {contact.email && <span>Email: <strong>{contact.email}</strong></span>}
                      {contact.website && (
                        <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-[#28486D] hover:underline">
                          Official Web Portal
                        </a>
                      )}
                    </div>
                    {contact.source_url && (
                      <p className="text-[10px] text-[#667085] italic pt-1">
                        Source: {contact.source_url}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#667085] italic">
                    Please verify the situation and local infrastructure before travelling to the location.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 25: Potential Opportunity Link */}
          {adoptedOpp && (
            <div className="pastel-card p-5 sm:p-6 border border-[#BFD8C2] bg-[#D8EEE5]/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D8EEE5] text-[#26372B] text-xs font-bold uppercase tracking-wider mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4D8256]" />
                    <span>Official Volunteer Opportunity Available</span>
                  </div>
                  <h4 className="text-lg font-bold text-[#354052] mb-1">
                    {adoptedOpp.title || incident.title}
                  </h4>
                  <p className="text-xs text-[#667085]">
                    A registered organizer has established an active volunteering opportunity for this incident.
                  </p>
                </div>

                <Link
                  to={`/opportunities/${adoptedOpp._id}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#AFCDB5] hover:bg-[#9EBEA4] text-[#26372B] text-xs font-semibold shadow-soft-sm transition-all shrink-0"
                >
                  <span>View & Apply</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Community Verification */}
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
