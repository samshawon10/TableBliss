

import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { restaurantAPI } from '../services/api';
import { CardSkeleton } from '../components/common/Skeleton';
import { HiStar, HiLocationMarker, HiFilter, HiSearch, HiX } from 'react-icons/hi';

const cuisines = ['Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian', 'French', 'American', 'Thai', 'Mediterranean', 'Korean'];
const priceRanges = ['$', '$$', '$$$', '$$$$'];

const Restaurants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    cuisine: searchParams.get('cuisine') || '',
    priceRange: searchParams.get('priceRange') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.cuisine) params.cuisine = filters.cuisine;
      if (filters.priceRange) params.priceRange = filters.priceRange;
      if (filters.rating) params.rating = filters.rating;
      if (filters.sort) params.sort = filters.sort;

      const { data } = await restaurantAPI.getAll(params);
      setRestaurants(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const updateFilter = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value, page: key === 'page' ? value : 1 };
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
      setSearchParams(params);
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({ search: '', cuisine: '', priceRange: '', rating: '', sort: '', page: 1 });
    setSearchParams({});
  };

  const hasActiveFilters = filters.cuisine || filters.priceRange || filters.rating;

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">Restaurants</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{pagination.total} restaurants found</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search restaurants..." value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} className="input-field pl-10" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`btn-secondary py-2.5 ${showFilters ? 'bg-primary-50 border-primary-500 text-primary-600' : ''}`}>
              <HiFilter className="w-5 h-5" /> Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"><HiX className="w-4 h-4" /> Clear all</button>
              )}
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Cuisine</label>
                <select value={filters.cuisine} onChange={(e) => updateFilter('cuisine', e.target.value)} className="input-field">
                  <option value="">All Cuisines</option>
                  {cuisines.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Price Range</label>
                <select value={filters.priceRange} onChange={(e) => updateFilter('priceRange', e.target.value)} className="input-field">
                  <option value="">All Prices</option>
                  {priceRanges.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Minimum Rating</label>
                <select value={filters.rating} onChange={(e) => updateFilter('rating', e.target.value)} className="input-field">
                  <option value="">Any Rating</option>
                  {[4, 3, 2, 1].map((r) => <option key={r} value={r}>{r}+ Stars</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Sort By</label>
                <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className="input-field">
                  <option value="">Latest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
            : restaurants.map((restaurant, i) => (
                <motion.div key={restaurant._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/restaurants/${restaurant._id}`} className="card block group">
                    <div className="relative h-48 overflow-hidden">
                      <img src={restaurant.images?.cover || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium">{restaurant.priceRange}</div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary-500 transition-colors">{restaurant.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-400 mb-2">
                        <HiStar className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{restaurant.rating}</span>
                        <span className="text-sm text-gray-400">({restaurant.totalReviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <HiLocationMarker className="w-4 h-4" />
                        <span className="truncate">{restaurant.address?.city}, {restaurant.address?.state}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {restaurant.cuisine?.slice(0, 3).map((c) => (
                          <span key={c} className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => updateFilter('page', page)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${filters.page === page ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50'}`}>
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;