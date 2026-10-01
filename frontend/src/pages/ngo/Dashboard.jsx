import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, Users, Briefcase, CheckCircle, Award, AlertTriangle, 
  UserCheck, XCircle, MapPin, Newspaper, ExternalLink, Sparkles, Navigation, ArrowRight,
  Eye, Send, Clock, Heart, Shield, X
} from 'lucide-react';
import { format } from 'date-fns';
import { formatDateSafe } from '../../utils/date';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NGOSidebar from '../../components/layouts/NGOSidebar';
import { ngoService } from '../../services/ngoService';
import { applicationService } from '../../services/applicationService';
import { locationService } from '../../services/locationService';
import StatCard from '../../components/ui/StatCard';
import SkeletonStatCard from '../../components/ui/SkeletonStatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const NGODashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [activeVolunteers, setActiveVolunteers] = useState([]);
  const [suggestedVolunteers, setSuggestedVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [invitedIds, setInvitedIds] = useState(new Set());
  const [newsEvents, setNewsEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adoptingId, setAdoptingId] = useState(null);
  const [actionDialog, setActionDialog] = useState({ isOpen: false, id: null, action: null });

  const fetchData = async () => {
    try {
      const [statsData, profileData, appsData, activeVolData, suggestedVolData] = await Promise.allSettled([
        ngoService.getNGOStats(),
        ngoService.getMyProfile(),
        applicationService.getNGOApplications({ limit: 5, status: 'pending' }),
        ngoService.getActiveVolunteers(),
        ngoService.getSuggestedVolunteers()
      ]);

      if (profileData.status === 'fulfilled') {
        const prof = profileData.value?.data || profileData.value;
        setProfile(prof);
        try {
          const newsRes = await locationService.getNewsEvents(prof?.latitude, prof?.longitude);
          setNewsEvents(newsRes?.data || []);
        } catch (err) {
          console.warn('News events in dashboard:', err);
        }
      }

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value?.data || statsData.value);
      }

      if (appsData.status === 'fulfilled') {
        setRecentApps(appsData.value?.data?.applications || appsData.value?.applications || (Array.isArray(appsData.value?.data) ? appsData.value.data : []));
      }

      if (activeVolData.status === 'fulfilled') {
        const list = activeVolData.value?.data || activeVolData.value || [];
        setActiveVolunteers(Array.isArray(list) ? list : []);
      }

      if (suggestedVolData.status === 'fulfilled') {
        const list = suggestedVolData.value?.data || suggestedVolData.value || [];
        setSuggestedVolunteers(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmEvent = async (event) => {
    setAdoptingId(event._id);
    try {
      await locationService.adoptEvent(event._id);
      toast.success(`Event confirmed! You have officially adopted this initiative.`);
      fetchData();
    } catch (err) {
      toast.error('Failed to adopt event');
    } finally {
      setAdoptingId(null);
    }
  };

  const handleDismissEvent = (eventId) => {
    setNewsEvents(prev => prev.filter(e => e._id !== eventId));
    toast.success('Event dismissed from your immediate dashboard feed.');
  };

  const handleApplicationAction = async () => {
    try {
      await applicationService.updateApplicationStatus(actionDialog.id, actionDialog.action);
      toast.success(`Application ${actionDialog.action} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setActionDialog({ isOpen: false, id: null, action: null });
    }
  };

  return (
    <DashboardLayout sidebar={<NGOSidebar />}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {profile?.verificationStatus === 'pending' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FFF8EF] border border-[#F6D8C5] rounded-2xl p-4 flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#854D27] flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <h3 className="text-[#854D27] font-semibold text-sm">Verification Pending</h3>
              <p className="text-[#854D27]/80 text-xs mt-1">Your NGO profile is currently under review by administrators. Some features like creating opportunities may be restricted until verified.</p>
            </div>
            <Link to="/ngo/profile">
              <Button size="sm" variant="outline" className="border-[#F6D8C5] text-[#854D27] hover:bg-[#FFF8EF]">View Profile</Button>
            </Link>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pastel-card p-6 border border-[#E6E8EC]">
          <div>
            <h1 className="text-2xl font-bold text-[#354052]">Dashboard Overview</h1>
            <p className="text-[#667085] mt-1 text-sm">{profile?.organizationName || 'Welcome to your NGO dashboard'}</p>
          </div>
          {profile?.verificationStatus === 'approved' && (
            <Link to="/ngo/opportunities/create">
              <Button className="flex items-center gap-2 btn-primary-pastel"><Briefcase className="w-4 h-4" /> Create Opportunity</Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => <SkeletonStatCard key={i} />)
          ) : (
            <>
              <StatCard title="Active Opportunities" value={stats?.activeOpportunities || 0} icon={Briefcase} color="blue" />
              <StatCard title="Total Applications" value={stats?.totalApplications || 0} icon={Users} color="purple" />
              <StatCard title="Upcoming Events" value={stats?.upcomingEvents || 0} icon={Calendar} color="orange" />
              <StatCard title="Accepted Volunteers" value={stats?.acceptedVolunteers || 0} icon={UserCheck} color="green" />
              <StatCard title="Completed Events" value={stats?.completedEvents || 0} icon={CheckCircle} color="cyan" />
            </>
          )}
        </div>

        {/* Section 19: Nearby Real-World Events & Potential Opportunities */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-[#354052] flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#8e74d1]" />
                Nearby Real-World Events & Community Needs
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Real-time humanitarian reports and local situations detected in your region. Lead volunteer action or confirm community needs.
              </p>
            </div>
            <span className="text-xs text-[#667085]">
              {newsEvents.length} event{newsEvents.length !== 1 ? 's' : ''} detected
            </span>
          </div>

          {newsEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {newsEvents.slice(0, 4).map((ev) => {
                const isConfirmed = ev.status === 'confirmed';
                return (
                  <div
                    key={ev._id}
                    className="p-5 pastel-card border border-[#E6E8EC] flex flex-col justify-between hover:border-[#DDD5F3] transition-all space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F2D6DD] text-[#9B5B65] border border-[#F2D6DD] uppercase tracking-wider">
                          {ev.event_type?.replace('_', ' ') || 'Emergency Alert'}
                        </span>
                        {ev.distanceKm !== undefined && (
                          <span className="text-xs text-[#26372B] font-medium flex items-center gap-1 bg-[#D8EEE5] px-2.5 py-0.5 rounded-full border border-[#BFD8C2]">
                            <Navigation className="w-3 h-3 text-[#5b7f63]" />
                            {ev.distanceKm < 1 ? '< 1 km from you' : `${ev.distanceKm.toFixed(1)} km from your organization`}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-[#354052] mb-1.5">{ev.title}</h3>
                      <p className="text-xs text-[#667085] line-clamp-2 mb-3 leading-relaxed">{ev.summary}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#667085] mb-3">
                        <span className="flex items-center gap-1 text-[#354052]">
                          <MapPin className="w-3.5 h-3.5 text-[#5b7f63]" />
                          {[ev.location?.city, ev.location?.state].filter(Boolean).join(', ') || 'Local Region'}
                        </span>
                        {ev.source_name && (
                          <a
                            href={ev.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[#5b7f63] hover:text-[#426048] underline font-medium"
                          >
                            <span>{ev.source_name}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {ev.potential_activities && ev.potential_activities.length > 0 && (
                        <div className="p-3 bg-[#F5F1FA] rounded-xl border border-[#E6E8EC] text-xs text-[#354052]">
                          <strong className="text-[#354052] block mb-1">Potential volunteer support:</strong>
                          <div className="flex flex-wrap gap-1.5">
                            {ev.potential_activities.map((act, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-white text-[#354052] border border-[#E6E8EC] text-[11px]">
                                {act}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E6E8EC]">
                      <div className="flex items-center gap-2">
                        {isConfirmed ? (
                          <span className="text-xs text-[#26372B] bg-[#D8EEE5] px-2.5 py-1 rounded-lg border border-[#BFD8C2] flex items-center gap-1 font-medium">
                            <CheckCircle className="w-3.5 h-3.5 text-[#5b7f63]" /> Confirmed / Adopted
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConfirmEvent(ev)}
                            disabled={adoptingId === ev._id}
                            className="px-3 py-1.5 rounded-lg bg-[#D8EEE5] hover:bg-[#BFD8C2] text-[#26372B] border border-[#BFD8C2] text-xs font-medium transition-all"
                          >
                            {adoptingId === ev._id ? 'Confirming...' : 'Confirm Need'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDismissEvent(ev._id)}
                          className="px-2.5 py-1.5 text-xs text-[#667085] hover:text-[#354052] transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>

                      <button
                        onClick={() => navigate(`/ngo/opportunities/create?adoptEvent=${ev._id}&title=${encodeURIComponent(ev.title)}&description=${encodeURIComponent(ev.summary)}&category=Disaster Relief&city=${encodeURIComponent(ev.location?.city || '')}&lat=${ev.location?.latitude || ''}&lng=${ev.location?.longitude || ''}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#AFCDB5] hover:bg-[#9ebfa5] text-[#26372B] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-soft-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Create Opportunity</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="p-6 text-center text-[#667085] text-xs">
              No immediate disaster or community alerts within your organization's proximity. We automatically scan public feeds every 30 minutes.
            </Card>
          )}
        </div>

        {/* Recent Pending Applications */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#354052] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8e74d1]" /> Pending Applications
            </h2>
            <Link to="/ngo/applications" className="text-xs font-semibold text-[#5b7f63] hover:text-[#426048]">View All</Link>
          </div>
          
          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[#667085]">Loading...</div>
            ) : recentApps.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#354052]">
                  <thead className="bg-[#F5F1FA] text-[#667085] uppercase text-xs border-b border-[#E6E8EC]">
                    <tr>
                      <th className="px-6 py-4">Volunteer</th>
                      <th className="px-6 py-4">Opportunity</th>
                      <th className="px-6 py-4">Applied</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E8EC]">
                    {recentApps.map((app) => {
                      const vol = app.volunteerId || app.user || {};
                      const opp = app.opportunityId || app.opportunity || {};
                      const volName = vol.name || 'Volunteer';
                      const volEmail = vol.email || '';
                      const oppTitle = opp.title || 'Volunteer Opportunity';
                      const appDate = app.appliedAt || app.createdAt;

                      return (
                        <tr key={app._id} className="hover:bg-[#FFF8EF]/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={vol.profileImage} alt={volName} size="sm" />
                              <div>
                                <p className="font-semibold text-[#354052]">{volName}</p>
                                <p className="text-xs text-[#667085]">{volEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#354052] font-medium">{oppTitle}</td>
                          <td className="px-6 py-4 text-[#667085] text-xs">{formatDateSafe(appDate, 'MMM d, yyyy')}</td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <Button size="sm" variant="outline" className="border-[#BFD8C2] bg-[#D8EEE5] text-[#26372B] hover:bg-[#BFD8C2]" onClick={() => setActionDialog({ isOpen: true, id: app._id, action: 'accepted' })}>
                              <CheckCircle className="w-4 h-4 mr-1 text-[#5b7f63]" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" className="border-[#F2D6DD] bg-[#F2D6DD]/60 text-[#9B5B65] hover:bg-[#F2D6DD]" onClick={() => setActionDialog({ isOpen: true, id: app._id, action: 'rejected' })}>
                              <XCircle className="w-4 h-4 mr-1 text-[#9B5B65]" /> Reject
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No pending applications" description="You don't have any pending applications to review right now." icon={CheckCircle} />
            )}
          </Card>
        </div>

        {/* Active & Registered Volunteers */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-[#354052] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#5b7f63]" /> Active & Registered Volunteers
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">Volunteers who registered for your initiatives</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D8EEE5] text-[#26372B] border border-[#BFD8C2]">
              {activeVolunteers.length} Active
            </span>
          </div>

          <Card className="overflow-hidden">
            {activeVolunteers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#354052]">
                  <thead className="bg-[#F5F1FA] text-[#667085] uppercase text-xs border-b border-[#E6E8EC]">
                    <tr>
                      <th className="px-6 py-4">Volunteer</th>
                      <th className="px-6 py-4">Opportunity & Category</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E8EC]">
                    {activeVolunteers.map((vol) => (
                      <tr key={vol.applicationId || vol.volunteerId} className="hover:bg-[#FFF8EF]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={vol.profileImage} alt={vol.name} size="sm" />
                            <div>
                              <p className="font-semibold text-[#354052]">{vol.name}</p>
                              <p className="text-xs text-[#667085]">{vol.availability || 'Available'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#354052] font-medium">{vol.opportunityTitle}</p>
                          <span className="inline-block text-[11px] px-2 py-0.5 mt-0.5 rounded-full bg-[#DDD5F3] text-[#30264A] border border-[#DDD5F3] capitalize">
                            {vol.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#667085]">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#5b7f63] shrink-0" />
                            <span>{vol.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={vol.status === 'Registered' ? 'success' : 'primary'}>
                            {vol.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-[#E6E8EC] text-[#354052] hover:bg-[#F5F1FA]"
                            onClick={() => setSelectedVolunteer(vol)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-[#5b7f63]" /> View Profile
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState 
                title="No active volunteers yet" 
                description="When volunteers register for your opportunities, their profiles and contact details will appear here." 
                icon={Users} 
              />
            )}
          </Card>
        </div>

        {/* Suggested Volunteers for NGOs */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-[#354052] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#854D27]" /> Suggested Volunteers
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">Matched based on proximity, cause categories, skills, and availability</p>
            </div>
          </div>

          {suggestedVolunteers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {suggestedVolunteers.map((vol) => {
                const isInvited = invitedIds.has(vol._id);
                return (
                  <div 
                    key={vol._id} 
                    className="p-5 rounded-2xl pastel-card border border-[#E6E8EC] hover:border-[#DDD5F3] transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={vol.profileImage} alt={vol.name} size="md" />
                          <div>
                            <h4 className="text-base font-bold text-[#354052] group-hover:text-[#5b7f63] transition-colors">{vol.name}</h4>
                            <p className="text-xs text-[#667085] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#5b7f63]" />
                              <span>{vol.location}</span>
                            </p>
                          </div>
                        </div>
                        {vol.matchScore > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#D8EEE5] text-[#26372B] border border-[#BFD8C2] shrink-0">
                            {vol.matchScore}% Match
                          </span>
                        )}
                      </div>

                      {/* Match reason notice */}
                      {vol.matchReasons && vol.matchReasons.length > 0 && (
                        <p className="text-[11px] text-[#854D27] mb-3 bg-[#FFF8EF] px-2.5 py-1 rounded-lg border border-[#F6D8C5]">
                          {vol.matchReasons[0]}
                        </p>
                      )}

                      {/* Skills & Availability */}
                      <div className="space-y-2 mb-4">
                        {vol.skills && vol.skills.length > 0 && (
                          <div>
                            <span className="text-[11px] text-[#667085] uppercase tracking-wider block mb-1 font-semibold">Skills:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {vol.skills.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md bg-[#F5F1FA] text-[#354052] border border-[#E6E8EC] text-xs">
                                  {skill}
                                </span>
                              ))}
                              {vol.skills.length > 3 && (
                                <span className="px-2 py-0.5 text-xs text-[#667085]">+{vol.skills.length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {vol.availability && (
                          <p className="text-xs text-[#667085]">
                            <span className="text-[#667085]">Availability:</span> <strong className="text-[#354052] font-semibold">{vol.availability}</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-[#E6E8EC]">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs border-[#E6E8EC] text-[#354052] hover:bg-[#F5F1FA]" 
                        onClick={() => setSelectedVolunteer(vol)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-[#5b7f63]" /> View Profile
                      </Button>
                      <Button 
                        size="sm" 
                        variant={isInvited ? "secondary" : "primary"}
                        disabled={isInvited}
                        className="flex-1 text-xs"
                        onClick={() => {
                          setInvitedIds(prev => new Set([...prev, vol._id]));
                          toast.success(`Invitation sent to ${vol.name}!`);
                        }}
                      >
                        {isInvited ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 mr-1 text-[#5b7f63]" /> Invited
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 mr-1" /> Invite
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="p-6 text-center text-[#667085] text-xs">
              Complete your organization's causes in profile to see personalized volunteer recommendations.
            </Card>
          )}
        </div>
      </div>

      {/* Volunteer Profile Modal */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#354052]/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E6E8EC] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-soft-hover relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedVolunteer(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-[#667085] hover:text-[#354052] hover:bg-[#F5F1FA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <Avatar src={selectedVolunteer.profileImage} alt={selectedVolunteer.name} size="lg" />
              <div>
                <h3 className="text-xl font-bold text-[#354052]">{selectedVolunteer.name}</h3>
                <p className="text-xs text-[#5b7f63] flex items-center gap-1 mt-0.5 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedVolunteer.location || 'Location upon participation'}</span>
                </p>
                <p className="text-xs text-[#667085] mt-0.5">
                  Availability: <strong className="text-[#354052]">{selectedVolunteer.availability || 'Weekends'}</strong>
                </p>
              </div>
            </div>

            {selectedVolunteer.bio && (
              <div className="mb-5 p-3.5 rounded-2xl bg-[#F5F1FA] border border-[#E6E8EC] text-xs text-[#667085] leading-relaxed">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#354052] mb-1">About the Volunteer</span>
                {selectedVolunteer.bio}
              </div>
            )}

            <div className="space-y-4 text-xs">
              {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] block mb-1.5">Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVolunteer.skills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#D8EEE5] text-[#26372B] border border-[#BFD8C2]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedVolunteer.interests && selectedVolunteer.interests.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] block mb-1.5">Interests & Causes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVolunteer.interests.map((intr, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#DDD5F3] text-[#30264A] border border-[#DDD5F3]">
                        {intr}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-[#E6E8EC] flex justify-end gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedVolunteer(null)}
                className="border-[#E6E8EC] text-[#354052] hover:bg-[#F5F1FA]"
              >
                Close
              </Button>
              {selectedVolunteer.email && (
                <a 
                  href={`mailto:${selectedVolunteer.email}`} 
                  className="btn-primary-pastel inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-soft-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Contact Volunteer</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={actionDialog.isOpen}
        title={`${actionDialog.action === 'accepted' ? 'Accept' : 'Reject'} Application`}
        message={`Are you sure you want to ${actionDialog.action === 'accepted' ? 'accept' : 'reject'} this application?`}
        confirmText={`Yes, ${actionDialog.action === 'accepted' ? 'Accept' : 'Reject'}`}
        onConfirm={handleApplicationAction}
        onCancel={() => setActionDialog({ isOpen: false, id: null, action: null })}
        variant={actionDialog.action === 'accepted' ? 'success' : 'danger'}
      />
    </DashboardLayout>
  );
};

export default NGODashboard;
