import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, Filter, X, MapPin, Navigation, Map as MapIcon, Grid, 
  Newspaper, RefreshCw, Sparkles, ShieldCheck, ShieldAlert, Lock, LogIn, UserPlus 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PublicLayout from '../layouts/PublicLayout';
import OpportunityCard from '../components/ui/OpportunityCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import EmptyState from '../components/ui/EmptyState';
import InteractiveMap from '../components/map/InteractiveMap';
import NewsOpportunityCard from '../components/visual/NewsOpportunityCard';
import { opportunityService } from '../services/opportunityService';
import { locationService } from '../services/locationService';
import { useDebounce } from '../hooks/useDebounce';

const categories = [
  'environment', 'education', 'health', 'community', 
  'animals', 'disaster-relief', 'arts', 'sports', 'technology', 'other'
];

const Opportunities = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [opportunities, setOpportunities] = useState([]);
  const [newsEvents, setNewsEvents] = useState([]);
  const [nearbyNGOs, setNearbyNGOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // View mode: 'grid' or 'map'
  const [viewMode, setViewMode] = useState('grid');

  // User location state
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [radiusKm, setRadiusKm] = useState(50);

  // Form states based on URL or defaults
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (user) {
      fetchOpportunities();
      updateUrlParams();
    }
  }, [user, debouncedSearch, category, city, sort, page, userLocation]);

  useEffect(() => {
    if (user) {
      fetchNewsEvents();
    }
  }, [user, userLocation]);

  const updateUrlParams = () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (sort !== '-createdAt') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        toast.success('Location detected! Showing opportunities sorted by proximity.');

        try {
          const res = await locationService.getNearby(lat, lng, radiusKm, category || 'all');
          if (res?.data?.opportunities) {
            setOpportunities(res.data.opportunities);
            setTotal(res.data.totalOpportunities);
          }
          if (res?.data?.ngos) {
            setNearbyNGOs(res.data.ngos);
          }
        } catch (err) {
          console.warn('Nearby fetch notice:', err);
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === 1) {
          toast.error('Location permission was denied. You can search by city instead.');
        } else {
          toast.error('Unable to retrieve location. Please check device settings.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      if (userLocation?.lat && userLocation?.lng) {
        const res = await locationService.getNearby(userLocation.lat, userLocation.lng, radiusKm, category || 'all');
        const list = res?.data?.opportunities || [];
        const activeList = list.filter(opp => {
          if (opp.status === 'completed' || opp.status === 'cancelled') return false;
          if (!opp.eventDate && !opp.date) return true;
          const d = new Date(opp.eventDate || opp.date);
          return isNaN(d.getTime()) || d >= new Date(Date.now() - 24 * 3600 * 1000);
        });
        setOpportunities(activeList);
        setTotal(res?.data?.totalOpportunities || activeList.length);
        if (res?.data?.ngos) setNearbyNGOs(res.data.ngos);
      } else {
        const query = {
          status: 'published',
          limit: 9,
          page,
          sort
        };
        if (debouncedSearch) query.search = debouncedSearch;
        if (category) query.category = category;
        if (city) query.city = city;

        const res = await opportunityService.getOpportunities(query);
        const list = res?.data?.opportunities || res?.opportunities || (Array.isArray(res?.data) ? res.data : []);
        const activeList = list.filter(opp => {
          if (opp.status === 'completed' || opp.status === 'cancelled') return false;
          if (!opp.eventDate && !opp.date) return true;
          const d = new Date(opp.eventDate || opp.date);
          return isNaN(d.getTime()) || d >= new Date(Date.now() - 24 * 3600 * 1000);
        });
        setOpportunities(activeList);
        setTotal(res?.data?.totalDocs || res?.data?.total || res?.total || activeList.length);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsEvents = async () => {
    setNewsLoading(true);
    try {
      const res = await locationService.getNewsEvents(userLocation?.lat, userLocation?.lng);
      const rawNews = res?.data || [];
      const activeNews = rawNews.filter(n => {
        if (!n.expires_at) return true;
        const exp = new Date(n.expires_at);
        return isNaN(exp.getTime()) || exp >= new Date();
      });
      setNewsEvents(activeNews);
    } catch (err) {
      console.warn('News events error:', err);
    } finally {
      setNewsLoading(false);
    }
  };

  const handleRefreshNews = async () => {
    setNewsLoading(true);
    try {
      await locationService.refreshNews();
      await fetchNewsEvents();
      toast.success('Live community feed refreshed!');
    } catch (err) {
      toast.error('Could not refresh news feed.');
    } finally {
      setNewsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setCity('');
    setSort('-createdAt');
    setPage(1);
    setUserLocation(null);
  };

  const totalPages = Math.ceil(total / 9);

  if (authLoading) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#BFD8C2] border-t-transparent rounded-full animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  // Soft Pastel Login Requirement Banner
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
                Please sign in to browse verified community opportunities and access personalized volunteer matching.
              </p>
            </div>
            <div className="space-y-2.5 pt-2">
              <Link
                to="/login?redirect=/opportunities"
                className="btn-primary-pastel flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to View Opportunities</span>
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

  return (
    <PublicLayout>
      <div className="min-h-screen pb-14 relative overflow-hidden bg-transparent text-[#354052]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-4">
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters (Desktop) */}
            <aside className={`lg:w-1/4 ${showMobileFilters ? 'fixed inset-0 z-50 bg-white/95 backdrop-blur-2xl p-6 overflow-y-auto' : 'hidden lg:block'}`}>
              <div className="lg:sticky lg:top-24 space-y-5">
                <div className="flex justify-between items-center lg:hidden mb-4">
                  <h2 className="text-lg font-bold text-[#26372B]">Filter Causes</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="text-[#667085] hover:text-[#26372B]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="glass-card p-4 sm:p-5 border border-[#E6E8EC]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#26372B] mb-3">Category</h3>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar text-xs">
                    <label className="flex items-center space-x-2.5 text-[#354052] hover:text-[#26372B] cursor-pointer">
                      <input type="radio" name="category" checked={category === ''} onChange={() => {setCategory(''); setPage(1);}} className="accent-[#556e5a]" />
                      <span>All Categories</span>
                    </label>
                    {categories.map(c => (
                      <label key={c} className="flex items-center space-x-2.5 text-[#667085] hover:text-[#26372B] cursor-pointer capitalize">
                        <input type="radio" name="category" checked={category === c} onChange={() => {setCategory(c); setPage(1);}} className="accent-[#556e5a]" />
                        <span>{c.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-4 sm:p-5 border border-[#E6E8EC]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#26372B] mb-3">Location</h3>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3] w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="City name..." 
                      value={city}
                      onChange={(e) => {setCity(e.target.value); setPage(1);}}
                      className="w-full bg-white border border-[#E6E8EC] text-xs text-[#354052] placeholder-[#98A2B3] rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40 transition-all shadow-soft-sm"
                    />
                  </div>
                </div>

                <div className="glass-card p-4 sm:p-5 border border-[#E6E8EC]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#26372B] mb-3">Sort Opportunities</h3>
                  <select 
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full bg-white border border-[#E6E8EC] text-xs text-[#354052] rounded-xl px-3 py-2.5 outline-none focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40 transition-all cursor-pointer shadow-soft-sm"
                  >
                    <option value="-createdAt">Newest Published</option>
                    <option value="date">Event Date (Ascending)</option>
                    <option value="-date">Event Date (Descending)</option>
                  </select>
                </div>

                <button 
                  onClick={clearFilters}
                  className="w-full py-2 bg-white/80 border border-[#E6E8EC] text-xs text-[#667085] hover:text-[#26372B] hover:bg-white rounded-xl transition-all font-medium shadow-soft-sm"
                >
                  Clear All Filters
                </button>

                {showMobileFilters && (
                  <button onClick={() => setShowMobileFilters(false)} className="btn-primary-pastel w-full py-2.5 rounded-xl mt-3 text-xs font-semibold lg:hidden">
                    Apply Filters
                  </button>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Search Bar & Location Discovery Toolbar */}
              <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3] w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search opportunities by title, skills or cause..." 
                    value={search}
                    onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                    className="w-full bg-white/95 border border-[#E6E8EC] text-xs sm:text-sm text-[#354052] placeholder-[#98A2B3] rounded-2xl pl-10 pr-4 py-3 focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40 outline-none transition-all shadow-soft-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUseMyLocation}
                    disabled={locationLoading}
                    title="Detect nearby NGOs and opportunities using browser location"
                    className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all border shadow-soft-sm ${
                      userLocation 
                        ? 'bg-[#D8EEE5] text-[#244e44] border-[#bce1d3]' 
                        : 'bg-white hover:bg-[#FFF8EF] text-[#354052] border-[#E6E8EC]'
                    }`}
                  >
                    <Navigation className={`w-3.5 h-3.5 ${locationLoading ? 'animate-spin text-[#54947f]' : userLocation ? 'text-[#54947f]' : ''}`} />
                    <span className="hidden sm:inline">{locationLoading ? 'Locating...' : userLocation ? 'Location Active' : 'Use Location'}</span>
                    <span className="sm:hidden">{userLocation ? 'Active' : 'Nearby'}</span>
                  </button>

                  <div className="flex items-center bg-white border border-[#E6E8EC] rounded-2xl p-1 shadow-soft-sm">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-[#BFD8C2] text-[#26372B] font-semibold' 
                          : 'text-[#667085] hover:text-[#26372B]'
                      }`}
                      title="Grid View"
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                        viewMode === 'map' 
                          ? 'bg-[#BFD8C2] text-[#26372B] font-semibold' 
                          : 'text-[#667085] hover:text-[#26372B]'
                      }`}
                      title="Interactive Map View"
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Map</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center justify-center bg-white border border-[#E6E8EC] text-[#354052] rounded-2xl p-2.5 hover:bg-[#FFF8EF] transition-colors shadow-soft-sm"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Location Banner */}
              {userLocation && (
                <div className="mb-5 p-3 rounded-2xl bg-[#D8EEE5]/70 border border-[#bce1d3] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-[#244e44]">
                    <MapPin className="w-4 h-4 text-[#54947f] shrink-0" />
                    <span>Showing causes within <strong>{radiusKm} km</strong> of your coordinates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      className="bg-white border border-[#bce1d3] text-[#244e44] text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                    >
                      <option value="15">Within 15 km</option>
                      <option value="30">Within 30 km</option>
                      <option value="50">Within 50 km</option>
                      <option value="100">Within 100 km</option>
                    </select>
                    <button
                      onClick={() => setUserLocation(null)}
                      className="text-xs text-[#667085] hover:text-[#26372B] underline ml-1.5"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {/* View Mode: Interactive Map */}
              {viewMode === 'map' ? (
                <div className="space-y-4 mb-10">
                  <InteractiveMap
                    opportunities={opportunities}
                    ngos={nearbyNGOs}
                    userLocation={userLocation}
                    newsEvents={newsEvents}
                    height="500px"
                  />
                  <div className="flex justify-between items-center text-[#667085] text-xs px-1">
                    <span>
                      Mapping {opportunities.length} active initiative{opportunities.length !== 1 ? 's' : ''}, {nearbyNGOs.length} verified NGO{nearbyNGOs.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ) : (
                /* View Mode: Grid */
                <>
                  <div className="mb-4 flex justify-between items-center text-xs text-[#667085]">
                    <span>Showing {total} result{total !== 1 ? 's' : ''}</span>
                    {userLocation && <span className="text-[#54947f] font-medium">Sorted by proximity</span>}
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                  ) : opportunities.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
                        {opportunities.map(opp => (
                          <OpportunityCard key={opp._id} opportunity={opp} />
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-6 mb-10">
                          <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E6E8EC] text-xs text-[#354052] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FFF8EF] transition-all font-medium shadow-soft-sm"
                          >
                            Prev
                          </button>
                          <span className="text-xs text-[#667085] px-3">
                            Page {page} of {totalPages}
                          </span>
                          <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E6E8EC] text-xs text-[#354052] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FFF8EF] transition-all font-medium shadow-soft-sm"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <EmptyState 
                      icon={<Search className="w-8 h-8 text-[#556e5a]" />}
                      title="No opportunities found"
                      message="Try adjusting your search filters or expanding your location radius."
                    />
                  )}
                </>
              )}

              {/* Real-World Community Needs Section */}
              {newsEvents.length > 0 && (
                <div className="mt-12 pt-8 border-t border-[#E6E8EC]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F6D8C5] text-[#7a4221] border border-[#eebd9e] uppercase tracking-wider">
                          Live Local Needs
                        </span>
                        <span className="text-xs text-[#667085]">
                          Community Alerts
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#26372B]">
                        Real-World Humanitarian Situations Near You
                      </h3>
                    </div>
                    <button
                      onClick={handleRefreshNews}
                      disabled={newsLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E6E8EC] text-xs font-medium text-[#667085] hover:text-[#26372B] hover:bg-[#FFF8EF] shadow-soft-sm"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${newsLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {newsEvents.slice(0, 4).map(event => (
                      <NewsOpportunityCard key={event._id} event={event} />
                    ))}
                  </div>
                </div>
              )}

            </main>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Opportunities;
