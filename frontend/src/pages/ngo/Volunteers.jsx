import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserCheck, MapPin, Mail, Phone, Calendar, Search, Filter, 
  Sparkles, Eye, X, CheckCircle, Award, Heart, ArrowUpRight 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NGOSidebar from '../../components/layouts/NGOSidebar';
import { ngoService } from '../../services/ngoService';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const NGOVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [suggestedVolunteers, setSuggestedVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'registered', 'network'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [invitedIds, setInvitedIds] = useState(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [activeRes, suggestedRes] = await Promise.allSettled([
        ngoService.getActiveVolunteers(),
        ngoService.getSuggestedVolunteers()
      ]);

      if (activeRes.status === 'fulfilled') {
        const list = activeRes.value?.data || activeRes.value || [];
        setVolunteers(Array.isArray(list) ? list : []);
      }

      if (suggestedRes.status === 'fulfilled') {
        const list = suggestedRes.value?.data || suggestedRes.value || [];
        setSuggestedVolunteers(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      toast.error('Failed to load volunteer directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvite = (vol) => {
    setInvitedIds(prev => new Set(prev).add(vol._id || vol.volunteerId));
    toast.success(`Invitation sent to ${vol.name}! They will be notified.`);
  };

  // Filter volunteers
  const filteredVolunteers = volunteers.filter(vol => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      (vol.name && vol.name.toLowerCase().includes(q)) ||
      (vol.email && vol.email.toLowerCase().includes(q)) ||
      (vol.opportunityTitle && vol.opportunityTitle.toLowerCase().includes(q)) ||
      (vol.skills && vol.skills.some(s => s.toLowerCase().includes(q)));

    const matchesTab = activeTab === 'all' ||
      (activeTab === 'registered' && vol.type === 'registered') ||
      (activeTab === 'network' && vol.type === 'network');

    const matchesCategory = selectedCategory === 'all' || 
      (vol.category && vol.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesTab && matchesCategory;
  });

  const categories = Array.from(
    new Set(volunteers.map(v => v.category).filter(Boolean))
  );

  const registeredCount = volunteers.filter(v => v.type === 'registered').length;
  const networkCount = volunteers.filter(v => v.type === 'network').length;

  return (
    <DashboardLayout sidebar={<NGOSidebar />}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-glow-sm">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Active Volunteers</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Direct directory of registered volunteers, active civic champions, and community network talent.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {volunteers.length} Active in Network
            </span>
          </div>
        </div>

        {/* Quick Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{volunteers.length}</p>
              <p className="text-xs text-gray-400">Total Active Contacts</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{registeredCount}</p>
              <p className="text-xs text-gray-400">Registered on Initiatives</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{suggestedVolunteers.length}</p>
              <p className="text-xs text-gray-400">Suggested by Match</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search volunteers by name, skill, email, or initiative..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-400 outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-200 outline-none focus:border-primary-500"
              >
                <option value="all" className="bg-[#0b1120]">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c} className="bg-[#0b1120]">{c}</option>
                ))}
              </select>
            )}

            {/* Type tabs */}
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'all' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                All ({volunteers.length})
              </button>
              <button
                onClick={() => setActiveTab('registered')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'registered' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                Registered ({registeredCount})
              </button>
              <button
                onClick={() => setActiveTab('network')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'network' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                Network ({networkCount})
              </button>
            </div>
          </div>
        </div>

        {/* Volunteers Directory List / Cards */}
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredVolunteers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVolunteers.map((vol) => (
              <motion.div
                key={vol.applicationId || vol.volunteerId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-3xl bg-[#0a0f28]/60 backdrop-blur-2xl border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between group shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
              >
                <div>
                  {/* Top Row: Avatar & Status Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={vol.profileImage} alt={vol.name} size="md" className="ring-2 ring-emerald-500/20" />
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {vol.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-primary-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{vol.location}</span>
                        </div>
                      </div>
                    </div>

                    <Badge variant={vol.type === 'registered' ? 'success' : 'primary'} className="text-[10px] px-2 py-0.5">
                      {vol.status}
                    </Badge>
                  </div>

                  {/* Initiative & Category */}
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      {vol.type === 'registered' ? 'Enrolled Initiative' : 'Area of Focus'}
                    </span>
                    <p className="text-xs font-semibold text-white truncate">{vol.opportunityTitle}</p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
                      {vol.category}
                    </span>
                  </div>

                  {/* Skills tags */}
                  {vol.skills && vol.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {vol.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/10">
                            {skill}
                          </span>
                        ))}
                        {vol.skills.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 text-gray-500">
                            +{vol.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  <div className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span>Availability: <strong className="text-gray-200">{vol.availability || 'Weekends'}</strong></span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {vol.email && (
                      <a
                        href={`mailto:${vol.email}`}
                        title="Send Email"
                        className="p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {vol.phone && (
                      <a
                        href={`tel:${vol.phone}`}
                        title="Call Volunteer"
                        className="p-2 rounded-xl bg-white/5 text-emerald-400 hover:text-white hover:bg-emerald-500/20 transition-colors border border-white/10"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedVolunteer(vol)}
                    className="border-white/20 text-xs text-white hover:bg-white/10 gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Profile
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">No matching volunteers found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Try adjusting your search criteria or filter tags to discover active community volunteers.
            </p>
          </Card>
        )}

        {/* Suggested Matched Volunteers Section */}
        {suggestedVolunteers.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" /> Matched Volunteers in Your Community
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Suggested based on cause categories, skills, and proximity to your NGO headquarters.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {suggestedVolunteers.slice(0, 6).map((vol) => {
                const isInvited = invitedIds.has(vol._id || vol.volunteerId);
                return (
                  <div
                    key={vol._id || vol.volunteerId}
                    className="p-5 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-primary-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={vol.profileImage} alt={vol.name} size="md" />
                          <div>
                            <h4 className="text-sm font-bold text-white">{vol.name}</h4>
                            <p className="text-xs text-gray-400">{vol.location?.city || 'Local Region'}</p>
                          </div>
                        </div>
                        {vol.matchScore && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {vol.matchScore}% Match
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-300 line-clamp-2 mb-3">
                        {vol.bio || 'Experienced community volunteer eager to support impactful non-profit drives.'}
                      </p>

                      {vol.matchReasons && vol.matchReasons.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-[11px] text-primary-300 mb-3 space-y-1">
                          {vol.matchReasons.slice(0, 2).map((r, i) => (
                            <p key={i}>• {r}</p>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedVolunteer(vol)}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Profile
                      </Button>

                      <Button
                        size="sm"
                        disabled={isInvited}
                        onClick={() => handleInvite(vol)}
                        className={`text-xs ${isInvited ? 'bg-emerald-600/30 text-emerald-300' : 'bg-primary-600 hover:bg-primary-500 text-white'}`}
                      >
                        {isInvited ? '✓ Invited' : 'Invite Volunteer'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Volunteer Profile Modal */}
        <AnimatePresence>
          {selectedVolunteer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0b1120] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative shadow-2xl"
              >
                <button
                  onClick={() => setSelectedVolunteer(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <Avatar src={selectedVolunteer.profileImage} alt={selectedVolunteer.name} size="lg" className="ring-4 ring-primary-500/30" />
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedVolunteer.name}</h3>
                    <p className="text-xs text-primary-400 font-medium">Volunteer Profile</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{selectedVolunteer.location || 'Location provided upon contact'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedVolunteer.bio && (
                    <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">About</span>
                      <p className="text-xs text-gray-200 leading-relaxed">{selectedVolunteer.bio}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Verified Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedVolunteer.skills.map((s, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-primary-500/15 text-primary-300 border border-primary-500/25 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  {selectedVolunteer.interests && selectedVolunteer.interests.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Causes & Interests</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedVolunteer.interests.map((s, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-gray-200 border border-white/10 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Methods */}
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Direct Contact</span>
                    
                    {selectedVolunteer.email && (
                      <a
                        href={`mailto:${selectedVolunteer.email}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-xs text-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary-400" />
                          <span>{selectedVolunteer.email}</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-gray-400" />
                      </a>
                    )}

                    {selectedVolunteer.phone && (
                      <a
                        href={`tel:${selectedVolunteer.phone}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-xs text-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-emerald-400" />
                          <span>{selectedVolunteer.phone}</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-gray-400" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <Button
                    onClick={() => setSelectedVolunteer(null)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    Close Directory Card
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default NGOVolunteers;
