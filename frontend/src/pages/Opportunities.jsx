import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, MapPin } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import OpportunityCard from '../components/ui/OpportunityCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import EmptyState from '../components/ui/EmptyState';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import { opportunityService } from '../services/opportunityService';
import { useDebounce } from '../hooks/useDebounce'; // Assuming this exists or create it

const categories = [
  'environment', 'education', 'health', 'community', 
  'animals', 'disaster-relief', 'arts', 'sports', 'technology', 'other'
];

const Opportunities = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
  }, [debouncedSearch, category, city, sort, page]);

  const updateUrlParams = () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (sort !== '-createdAt') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params);
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
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
      setOpportunities(list);
      setTotal(res?.data?.totalDocs || res?.data?.total || res?.total || list.length);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setCity('');
    setSort('-createdAt');
    setPage(1);
  };

  const totalPages = Math.ceil(total / 9);

  return (
    <PublicLayout>
      <div className="bg-gray-950 min-h-screen pt-24 pb-12 relative overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto px-6 relative z-10">
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters (Desktop) */}
            <aside className={`lg:w-1/4 ${showMobileFilters ? 'fixed inset-0 z-50 bg-gray-950 p-6 overflow-y-auto' : 'hidden lg:block'}`}>
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="flex justify-between items-center lg:hidden mb-6">
                  <h2 className="text-xl font-bold text-white">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4">Category</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    <label className="flex items-center space-x-3 text-gray-300 hover:text-white cursor-pointer">
                      <input type="radio" name="category" checked={category === ''} onChange={() => {setCategory(''); setPage(1);}} className="form-radio text-primary-500 bg-gray-800 border-gray-700 focus:ring-primary-500" />
                      <span>All Categories</span>
                    </label>
                    {categories.map(c => (
                      <label key={c} className="flex items-center space-x-3 text-gray-300 hover:text-white cursor-pointer capitalize">
                        <input type="radio" name="category" checked={category === c} onChange={() => {setCategory(c); setPage(1);}} className="form-radio text-primary-500 bg-gray-800 border-gray-700 focus:ring-primary-500" />
                        <span>{c.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4">Location</h3>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="City..." 
                      value={city}
                      onChange={(e) => {setCity(e.target.value); setPage(1);}}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-9 pr-4 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4">Sort By</h3>
                  <select 
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors appearance-none"
                  >
                    <option value="-createdAt">Newest First</option>
                    <option value="date">Event Date (Ascending)</option>
                    <option value="-date">Event Date (Descending)</option>
                  </select>
                </div>

                <button 
                  onClick={clearFilters}
                  className="w-full py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>

                {showMobileFilters && (
                  <button onClick={() => setShowMobileFilters(false)} className="w-full py-3 bg-primary-600 text-white rounded-lg mt-4 font-medium lg:hidden">
                    Apply Filters
                  </button>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Search Bar & Mobile Filter Toggle */}
              <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search opportunities by title or skills..." 
                    value={search}
                    onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                    className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl pl-12 pr-4 py-4 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors shadow-lg"
                  />
                </div>
                <button 
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center justify-center bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-4 hover:bg-gray-800 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {/* Results Count */}
              <div className="mb-6 flex justify-between items-center text-gray-400 text-sm">
                <span>Showing {total} result{total !== 1 ? 's' : ''}</span>
              </div>

              {/* Grid */}
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                      <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                      >
                        Prev
                      </button>
                      <span className="text-gray-400 px-4">
                        Page {page} of {totalPages}
                      </span>
                      <button 
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState 
                  icon={<Search className="w-12 h-12" />}
                  title="No results found"
                  message="Try adjusting your search or filters to find what you're looking for."
                />
              )}
            </main>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Opportunities;
