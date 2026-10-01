import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { opportunityService } from '../services/opportunityService';
import { applicationService } from '../services/applicationService';
import { 
  Calendar, Clock, MapPin, Users, ChevronLeft, ShieldCheck, 
  CheckCircle, XCircle, Navigation, ExternalLink, Newspaper, Lock, LogIn, UserPlus 
} from 'lucide-react';
import toast from 'react-hot-toast';
import PublicLayout from '../layouts/PublicLayout';
import SkeletonCard from '../components/ui/SkeletonCard';
import InteractiveMap from '../components/map/InteractiveMap';
import { formatDateSafe } from '../utils/date';
import { getOpportunityImage } from '../utils/categoryImages';

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  
  const [myApplication, setMyApplication] = useState(null);
  const [checkingApp, setCheckingApp] = useState(false);
  
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyNotes, setApplyNotes] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchDetail = async () => {
      try {
        const res = await opportunityService.getOpportunity(id);
        setOpportunity(res.data.opportunity || res.data);
      } catch (error) {
        console.error('Error fetching detail:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, user]);

  useEffect(() => {
    if (user && user.role === 'volunteer' && opportunity) {
      const checkApplication = async () => {
        setCheckingApp(true);
        try {
          const res = await applicationService.getMyApplications({ opportunity: id });
          if (res.data && res.data.applications && res.data.applications.length > 0) {
            setMyApplication(res.data.applications[0]);
          }
        } catch (error) {
          console.error('Error checking application:', error);
        } finally {
          setCheckingApp(false);
        }
      };
      checkApplication();
    }
  }, [user, opportunity, id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const res = await applicationService.applyForOpportunity(id, { notes: applyNotes });
      toast.success('Application submitted successfully!');
      setMyApplication(res.data.application || res.data);
      setIsApplyModalOpen(false);
      
      setOpportunity(prev => ({
        ...prev,
        registeredCount: (prev.registeredCount || 0) + 1
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!myApplication || !window.confirm('Are you sure you want to cancel your application?')) return;
    try {
      await applicationService.updateApplicationStatus(myApplication._id, 'cancelled');
      toast.success('Application cancelled');
      setMyApplication(prev => ({ ...prev, status: 'cancelled' }));
    } catch (error) {
      toast.error('Failed to cancel application');
    }
  };

  if (authLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-20 min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#BFD8C2] border-t-transparent rounded-full animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  if (!user) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full glass-card p-6 sm:p-8 border border-[#E6E8EC] rounded-3xl text-center space-y-4 shadow-soft-lg">
            <div className="w-14 h-14 rounded-2xl bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3] flex items-center justify-center mx-auto shadow-soft-sm">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#26372B] mb-1.5">Sign In Required</h2>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                Please sign in to view opportunity details and submit volunteer applications.
              </p>
            </div>
            <div className="space-y-2.5 pt-2">
              <Link
                to={`/login?redirect=/opportunities/${id}`}
                className="btn-primary-pastel flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to View Opportunity</span>
              </Link>
              <div className="flex gap-2">
                <Link
                  to="/register?role=volunteer"
                  className="btn-secondary-pastel flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl text-xs font-semibold"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#556e5a]" />
                  <span>Volunteer</span>
                </Link>
                <Link
                  to="/register?role=ngo"
                  className="btn-secondary-pastel flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl text-xs font-semibold"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#54947f]" />
                  <span>NGO Partner</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 min-h-[60vh]">
          <SkeletonCard />
        </div>
      </PublicLayout>
    );
  }

  if (notFound || !opportunity) {
    return (
      <PublicLayout>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-24 text-center min-h-[60vh] space-y-4">
          <h2 className="text-2xl font-bold text-[#26372B]">Opportunity Not Found</h2>
          <p className="text-xs sm:text-sm text-[#667085]">The opportunity you are looking for does not exist or has been removed.</p>
          <Link to="/opportunities" className="btn-primary-pastel inline-flex px-5 py-2.5 rounded-xl text-xs sm:text-sm">
            Back to Opportunities
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const isFull = opportunity.registeredCount >= opportunity.capacity;
  const isCompleted = opportunity.status === 'completed';
  const isCancelled = opportunity.status === 'cancelled';
  const isOngoing = opportunity.status === 'ongoing';

  const locationObj = typeof opportunity.location === 'object' ? (opportunity.location || {}) : {};
  const addressText = locationObj.address || (typeof opportunity.location === 'string' ? opportunity.location : '');
  const cityText = locationObj.city || opportunity.city || '';
  const stateText = locationObj.state || opportunity.state || '';
  const pincodeText = locationObj.pincode || '';
  const fullAddress = [addressText, cityText, stateText, pincodeText].filter(Boolean).join(', ') || 'Location details provided upon registration';

  const latitude = locationObj.latitude || opportunity.latitude;
  const longitude = locationObj.longitude || opportunity.longitude;

  let distanceKm = null;
  if (userCoords && latitude && longitude) {
    const R = 6371;
    const dLat = (latitude - userCoords.lat) * (Math.PI / 180);
    const dLng = (longitude - userCoords.lng) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(userCoords.lat * (Math.PI / 180)) * Math.cos(latitude * (Math.PI / 180)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distanceKm = Math.round(R * c * 10) / 10;
  }

  return (
    <PublicLayout>
      <div className="min-h-screen pb-16 bg-transparent text-[#354052]">
        
        {/* Banner with Real Image */}
        <div className="h-56 sm:h-72 w-full relative overflow-hidden bg-slate-100 border-b border-[#E6E8EC]">
          <img 
            src={getOpportunityImage(opportunity)} 
            alt={opportunity.title} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-xs font-semibold text-[#26372B] hover:text-black mb-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E6E8EC] shadow-soft-sm w-fit transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back to opportunities
          </button>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Details */}
            <div className="lg:w-2/3 space-y-6">
              <div className="glass-card p-6 sm:p-8 border border-[#E6E8EC]">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-block px-3 py-1 bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3] rounded-full text-xs font-semibold uppercase tracking-wider">
                    {opportunity.category?.replace('-', ' ')}
                  </span>
                  {opportunity.source_type === 'news' && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F6D8C5] text-[#7a4221] border border-[#eebd9e] uppercase tracking-wider">
                      COMMUNITY ALERT
                    </span>
                  )}
                  {distanceKm !== null && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-[#54947f] border border-[#bce1d3] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#54947f]" />
                      {distanceKm} km away
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#26372B] mb-5 leading-snug">{opportunity.title}</h1>
                
                {/* News Attribution if News-Derived */}
                {opportunity.source_type === 'news' && (
                  <div className="p-4 bg-[#FFF8EF] border border-[#E6E8EC] rounded-2xl mb-6 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#7a4221] font-semibold text-xs sm:text-sm">
                      <Newspaper className="w-4 h-4 text-[#7a4221]" />
                      <span>Community Alert Derived from Public Reports</span>
                    </div>
                    <p className="text-xs text-[#667085] leading-relaxed">
                      This initiative was surfaced from local reports regarding community needs. Verify details with the organizers before participating.
                    </p>
                    {opportunity.source_name && (
                      <div className="flex items-center gap-3 pt-1 text-xs">
                        <span className="text-[#667085]">Source: <strong className="text-[#26372B]">{opportunity.source_name}</strong></span>
                        {opportunity.source_url && (
                          <a href={opportunity.source_url} target="_blank" rel="noopener noreferrer" className="text-[#466c9c] hover:underline inline-flex items-center gap-1 font-medium">
                            <span>View Original Article</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Organizer NGO Card */}
                <div className="flex items-center p-3.5 bg-white rounded-2xl border border-[#E6E8EC] mb-6 shadow-soft-sm">
                  <div className="w-10 h-10 bg-[#BFD8C2] text-[#26372B] border border-[#AFCDB5] rounded-xl flex items-center justify-center text-lg font-bold mr-3.5 shrink-0">
                    {opportunity.ngo?.organizationName?.charAt(0) || opportunity.ngoProfileId?.organizationName?.charAt(0) || 'N'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#26372B] flex items-center">
                      {opportunity.ngo?.organizationName || opportunity.ngoProfileId?.organizationName || (opportunity.source_type === 'news' ? 'Public Community Initiative' : 'Verified NGO')}
                      {(opportunity.ngo?.isVerified || opportunity.ngoProfileId?.isVerified) && (
                        <ShieldCheck className="w-4 h-4 text-[#54947f] ml-1.5" title="Verified NGO on VolunteerConnect" />
                      )}
                    </h3>
                    <p className="text-xs text-[#667085]">
                      {opportunity.source_type === 'news' ? 'Community Need / Public Alert' : 'Verified Organizer'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <h3 className="text-base font-bold text-[#26372B]">About this opportunity</h3>
                  <p className="text-xs sm:text-sm text-[#667085] leading-relaxed whitespace-pre-wrap">{opportunity.description}</p>
                </div>

                {opportunity.skills && opportunity.skills.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#26372B] mb-2.5">Required Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {opportunity.skills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-white text-[#354052] rounded-lg text-xs font-medium border border-[#E6E8EC]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Event Details Grid */}
              <div className="glass-card p-6 sm:p-7 border border-[#E6E8EC]">
                <h3 className="text-base font-bold text-[#26372B] mb-5">Event Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
                  <div className="flex items-start">
                    <Calendar className="w-4 h-4 text-[#556e5a] mt-0.5 mr-2.5 shrink-0" />
                    <div>
                      <p className="text-xs text-[#667085]">Date</p>
                      <p className="text-[#26372B] font-semibold">{formatDateSafe(opportunity.eventDate || opportunity.date, 'MMMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="w-4 h-4 text-[#7a4221] mt-0.5 mr-2.5 shrink-0" />
                    <div>
                      <p className="text-xs text-[#667085]">Time Schedule</p>
                      <p className="text-[#26372B] font-semibold">{opportunity.time || 'Flexible / Full day'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-[#54947f] mt-0.5 mr-2.5 shrink-0" />
                    <div>
                      <p className="text-xs text-[#667085]">Location</p>
                      <p className="text-[#26372B] font-semibold">{fullAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="w-4 h-4 text-[#7556bf] mt-0.5 mr-2.5 shrink-0" />
                    <div>
                      <p className="text-xs text-[#667085]">Capacity</p>
                      <p className="text-[#26372B] font-semibold">{opportunity.registeredCount || 0} / {opportunity.capacity || 20} volunteers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map & Venue Navigation */}
              <div className="glass-card p-6 sm:p-7 border border-[#E6E8EC] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#26372B] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#54947f]" />
                      Venue & Navigation Map
                    </h3>
                    <p className="text-xs text-[#667085] mt-0.5">{fullAddress}</p>
                  </div>

                  {latitude && longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary-pastel inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs shrink-0"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {latitude && longitude ? (
                  <div className="rounded-2xl overflow-hidden border border-[#E6E8EC]">
                    <InteractiveMap
                      opportunities={[opportunity]}
                      userLocation={userCoords}
                      height="280px"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-[#E6E8EC] text-xs text-[#667085]">
                    Standard location address: {fullAddress}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Sticky Action Box */}
            <div className="lg:w-1/3">
              <div className="sticky top-20 glass-card p-6 border border-[#E6E8EC] space-y-5">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {isCompleted && <span className="px-2.5 py-0.5 bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3] rounded-full text-xs font-semibold">Completed</span>}
                  {isCancelled && <span className="px-2.5 py-0.5 bg-[#F2D6DD] text-[#8C3B4A] border border-[#e6b5c1] rounded-full text-xs font-semibold">Cancelled</span>}
                  {isOngoing && <span className="px-2.5 py-0.5 bg-[#C9DDF2] text-[#24426b] border border-[#a3c5eb] rounded-full text-xs font-semibold">Ongoing</span>}
                  {!isCompleted && !isCancelled && !isOngoing && <span className="px-2.5 py-0.5 bg-[#BFD8C2] text-[#26372B] border border-[#AFCDB5] rounded-full text-xs font-semibold">Published</span>}
                </div>

                {/* Capacity Progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5 text-[#667085]">
                    <span>Volunteer Capacity</span>
                    <span className="text-[#26372B] font-bold">{opportunity.registeredCount || 0} / {opportunity.capacity}</span>
                  </div>
                  <div className="w-full bg-[#E6E8EC] rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full ${isFull ? 'bg-[#d48ea0]' : 'bg-[#AFCDB5]'}`} 
                      style={{ width: `${Math.min(((opportunity.registeredCount || 0) / opportunity.capacity) * 100, 100)}%` }}
                    />
                  </div>
                  {isFull && <p className="text-[#8C3B4A] text-xs mt-1.5 text-center font-medium">Opportunity is currently full</p>}
                </div>

                {/* Application State & Action */}
                <div className="space-y-3 pt-2">
                  {user.role === 'ngo' ? (
                    user._id === opportunity.ngo?._id ? (
                      <Link to={`/ngo/opportunities/${opportunity._id}/edit`} className="btn-secondary-pastel block w-full py-2.5 text-center rounded-xl text-xs font-semibold">
                        Edit / Manage Opportunity
                      </Link>
                    ) : null
                  ) : user.role === 'volunteer' ? (
                    checkingApp ? (
                      <div className="w-full py-2.5 text-center text-xs text-[#667085]">Checking application status...</div>
                    ) : myApplication ? (
                      <div className="space-y-2">
                        {myApplication.status === 'pending' && (
                          <>
                            <div className="p-3 bg-[#FFF8EF] border border-[#E6E8EC] rounded-xl flex items-center text-xs text-[#7a4221] font-semibold">
                              <Clock className="w-4 h-4 mr-2" /> Application Pending Review
                            </div>
                            <button onClick={handleCancelApplication} className="w-full py-2 text-xs text-[#8C3B4A] hover:underline font-medium">
                              Cancel Application
                            </button>
                          </>
                        )}
                        {myApplication.status === 'accepted' && (
                          <div className="p-3 bg-[#D8EEE5] border border-[#bce1d3] rounded-xl flex items-center text-xs text-[#244e44] font-semibold">
                            <CheckCircle className="w-4 h-4 mr-2 text-[#54947f]" /> Application Accepted!
                          </div>
                        )}
                        {myApplication.status === 'rejected' && (
                          <div className="p-3 bg-[#F2D6DD] border border-[#e6b5c1] rounded-xl flex items-center text-xs text-[#8C3B4A] font-semibold">
                            <XCircle className="w-4 h-4 mr-2" /> Application Not Accepted
                          </div>
                        )}
                        {myApplication.status === 'cancelled' && (
                          <div className="p-3 bg-white border border-[#E6E8EC] rounded-xl text-xs text-[#667085] text-center">
                            You cancelled this application
                          </div>
                        )}
                      </div>
                    ) : isCompleted || isCancelled ? (
                      <div className="w-full py-2.5 bg-white border border-[#E6E8EC] text-[#98A2B3] text-center rounded-xl text-xs font-medium cursor-not-allowed">
                        Opportunity Closed
                      </div>
                    ) : isFull ? (
                      <div className="w-full py-2.5 bg-white border border-[#E6E8EC] text-[#98A2B3] text-center rounded-xl text-xs font-medium cursor-not-allowed">
                        Opportunity Full
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsApplyModalOpen(true)}
                        className="btn-primary-pastel w-full py-3 rounded-xl text-xs sm:text-sm font-semibold"
                      >
                        Apply Now
                      </button>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-sm">
            <div className="bg-white/95 backdrop-blur-2xl border border-[#E6E8EC] rounded-3xl p-6 w-full max-w-md shadow-soft-lg">
              <h3 className="text-lg font-bold text-[#26372B] mb-2">Apply for {opportunity.title}</h3>
              <p className="text-xs text-[#667085] mb-4">Your profile will be shared with the organizer for review.</p>
              
              <form onSubmit={handleApply}>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#354052] mb-1.5">Note to Organizer (Optional)</label>
                  <textarea
                    rows={4}
                    value={applyNotes}
                    onChange={(e) => setApplyNotes(e.target.value)}
                    placeholder="Briefly describe your interest or relevant experience..."
                    className="w-full bg-white border border-[#E6E8EC] rounded-xl p-3 text-xs sm:text-sm text-[#354052] placeholder-[#98A2B3] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40 outline-none resize-none transition-all shadow-soft-sm"
                  />
                </div>
                <div className="flex justify-end gap-2.5">
                  <button 
                    type="button" 
                    onClick={() => setIsApplyModalOpen(false)}
                    className="btn-secondary-pastel px-4 py-2 rounded-xl text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={applying}
                    className="btn-primary-pastel px-5 py-2 rounded-xl text-xs font-semibold"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default OpportunityDetail;
