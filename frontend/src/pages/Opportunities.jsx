import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, MapPin, Navigation, Map as MapIcon, Grid, Newspaper, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
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
    fetchOpportunities();
    updateUrlParams();
  }, [debouncedSearch, category, city, sort, page, userLocation]);

  useEffect(() => {
    fetchNewsEvents();
  }, [userLocation]);

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


  return (
    <PublicLayout>
      <div className="min-h-screen pb-12 relative overflow-hidden bg-transparent">
        <div className="container mx-auto px-6 relative z-10">
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters (Desktop) */}
            <aside className={`lg:w-1/4 ${showMobileFilters ? 'fixed inset-0 z-50 bg-[#050a1e]/95 backdrop-blur-2xl p-6 overflow-y-auto' : 'hidden lg:block'}`}>
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="flex justify-between items-center lg:hidden mb-6">
                  <h2 className="text-xl font-bold text-white">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="glass-card p-5 border border-white/10">
                  <h3 className="font-semibold text-white mb-4">Category</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    <label className="flex items-center space-x-3 text-gray-300 hover:text-white cursor-pointer">
                      <input type="radio" name="category" checked={category === ''} onChange={() => {setCategory(''); setPage(1);}} className="form-radio text-primary-500 bg-white/10 border-white/20 focus:ring-primary-500" />
                      <span>All Categories</span>
                    </label>
                    {categories.map(c => (
                      <label key={c} className="flex items-center space-x-3 text-gray-300 hover:text-white cursor-pointer capitalize">
                        <input type="radio" name="category" checked={category === c} onChange={() => {setCategory(c); setPage(1);}} className="form-radio text-primary-500 bg-white/10 border-white/20 focus:ring-primary-500" />
                        <span>{c.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5 border border-white/10">
                  <h3 className="font-semibold text-white mb-4">Location</h3>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="City..." 
                      value={city}
                      onChange={(e) => {setCity(e.target.value); setPage(1);}}
                      className="w-full bg-white/[0.05] border border-white/10 text-white placeholder-gray-400 rounded-xl pl-9 pr-4 py-2.5 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="glass-card p-5 border border-white/10">
                  <h3 className="font-semibold text-white mb-4">Sort By</h3>
                  <select 
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full bg-gray-900/80 backdrop-blur-lg border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="-createdAt">Newest First</option>
                    <option value="date">Event Date (Ascending)</option>
                    <option value="-date">Event Date (Descending)</option>
                  </select>
                </div>

                <button 
                  onClick={clearFilters}
                  className="w-full py-2.5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all font-medium text-sm backdrop-blur-md"
                >
                  Clear All Filters
                </button>

                {showMobileFilters && (
                  <button onClick={() => setShowMobileFilters(false)} className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl mt-4 font-medium lg:hidden transition-all shadow-glow-sm">
                    Apply Filters
                  </button>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Search Bar & Location Discovery Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search opportunities by title, skills or cause..." 
                    value={search}
                    onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                    className="w-full bg-white/[0.04] backdrop-blur-2xl border border-white/10 text-white placeholder-gray-400 rounded-2xl pl-12 pr-4 py-3.5 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-glass"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUseMyLocation}
                    disabled={locationLoading}
                    title="Detect nearby NGOs and opportunities using browser location"
                    className={`px-4 py-3.5 rounded-2xl font-medium text-sm flex items-center gap-2 transition-all backdrop-blur-xl border ${
                      userLocation 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-sm' 
                        : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                    }`}
                  >
                    <Navigation className={`w-4 h-4 ${locationLoading ? 'animate-spin text-emerald-400' : userLocation ? 'text-emerald-400 fill-emerald-400/20' : ''}`} />
                    <span className="hidden sm:inline">{locationLoading ? 'Locating...' : userLocation ? 'Location Active' : 'Use My Location'}</span>
                    <span className="sm:hidden">{userLocation ? 'Active' : 'Nearby'}</span>
                  </button>

                  <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-xl">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-primary-600 text-white shadow-sm' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title="Grid View"
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                        viewMode === 'map' 
                          ? 'bg-primary-600 text-white shadow-sm' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title="Interactive Map View"
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Map</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center justify-center bg-white/[0.05] border border-white/10 text-white rounded-2xl px-4 py-3.5 hover:bg-white/10 transition-colors backdrop-blur-xl"
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Active Location Banner */}
              {userLocation && (
                <div className="mb-6 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Showing opportunities & NGOs within <strong>{radiusKm} km</strong> of your coordinates ({userLocation.lat.toFixed(2)}°, {userLocation.lng.toFixed(2)}°)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      className="bg-black/40 border border-emerald-500/30 text-emerald-200 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                    >
                      <option value="15">Within 15 km</option>
                      <option value="30">Within 30 km</option>
                      <option value="50">Within 50 km</option>
                      <option value="100">Within 100 km</option>
                    </select>
                    <button
                      onClick={() => setUserLocation(null)}
                      className="text-xs text-gray-400 hover:text-white underline ml-2"
                    >
                      Reset to All
                    </button>
                  </div>
                </div>
              )}

              {/* View Mode: Interactive Map */}
              {viewMode === 'map' ? (
                <div className="space-y-6 mb-12">
                  <InteractiveMap
                    opportunities={opportunities}
                    ngos={nearbyNGOs}
                    userLocation={userLocation}
                    newsEvents={newsEvents}
                    height="540px"
                  />
                  <div className="flex justify-between items-center text-gray-400 text-sm px-1">
                    <span>
                      Mapping {opportunities.length} active opportunit{opportunities.length !== 1 ? 'ies' : 'y'}, {nearbyNGOs.length} verified NGO{nearbyNGOs.length !== 1 ? 's' : ''}, and {newsEvents.length} community report{newsEvents.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ) : (
                /* View Mode: Grid */
                <>
                  <div className="mb-6 flex justify-between items-center text-gray-400 text-sm">
                    <span>Showing {total} result{total !== 1 ? 's' : ''}</span>
                    {userLocation && <span className="text-emerald-400 text-xs">Sorted by proximity</span>}
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                  ) : opportunities.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                        {opportunities.map(opp => (
                          <OpportunityCard key={opp._id} opportunity={opp} />
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-8 mb-12">
                          <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-all backdrop-blur-md text-sm font-medium"
                          >
                            Prev
                          </button>
                          <span className="text-gray-300 text-sm px-4">
                            Page {page} of {totalPages}
                          </span>
                          <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-all backdrop-blur-md text-sm font-medium"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <EmptyState 
                      icon={<Search className="w-12 h-12" />}
                      title="No opportunities found"
                      message="Try adjusting your search filters or expanding your location radius."
                    />
                  )}
                </>
              )}

              {/* Section 27: From Recent News & Local Situations */}
              <div className="mt-16 pt-12 border-t border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Live Community Feed
                      </span>
                      <span className="text-xs text-gray-400">Verified Public Feeds</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Newspaper className="w-6 h-6 text-primary-400" />
                      From Recent News & Local Situations
                    </h2>
                    <p className="text-sm text-gray-400 mt-1 max-w-2xl">
                      Real-world situations detected from authorized public reports, disaster feeds, and weather alerts. 
                      If verified NGOs exist nearby, they coordinate direct action; otherwise local verification or NGO support can be requested.
                    </p>
                  </div>

                  <button
                    onClick={handleRefreshNews}
                    disabled={newsLoading}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50 self-start md:self-auto"
                  >
                    <RefreshCw className={`w-4 h-4 ${newsLoading ? 'animate-spin text-primary-400' : ''}`} />
                    <span>{newsLoading ? 'Refreshing Feed...' : 'Refresh Live Feed'}</span>
                  </button>
                </div>

                {newsLoading && newsEvents.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : newsEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {newsEvents.map(event => (
                      <NewsOpportunityCard 
                        key={event._id} 
                        event={event}
                        onAdoptSuccess={fetchNewsEvents}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center border border-white/10 rounded-2xl">
                    <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-1">No Active Crisis or Emergency Alerts</h3>
                    <p className="text-sm text-gray-400 max-w-md mx-auto">
                      No severe weather warnings, disaster declarations, or urgent relief reports detected in this radius. Check back later or browse standard NGO-posted opportunities above.
                    </p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Opportunities;
