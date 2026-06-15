

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { HiHeart, HiStar, HiLocationMarker, HiTrash } from 'react-icons/hi';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const { data } = await authAPI.getFavorites();
      setFavorites(data.data);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (restaurantId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await authAPI.toggleFavorite(restaurantId);
      setFavorites((prev) => prev.filter((f) => f._id !== restaurantId));
      Swal.fire({ icon: 'success', title: 'Removed from favorites', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Failed to remove' });
    }
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <HiStar key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Favorite Restaurants</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Your saved restaurants</p>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <HiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No favorites yet</p>
            <Link to="/restaurants" className="btn-primary inline-flex">Browse Restaurants</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              <Link
                key={fav._id}
                to={`/restaurants/${fav._id}`}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="h-40 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                  <img
                    src={fav.images?.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                    alt={fav.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => handleRemoveFavorite(fav._id, e)}
                    className="absolute top-3 right-3 bg-white/80 dark:bg-gray-900/80 p-2 rounded-full text-red-500 hover:bg-white dark:hover:bg-gray-900 transition-colors"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{fav.name}</h3>
                    <span className="text-sm text-primary-500 font-medium">{fav.priceRange}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{fav.cuisine?.join(', ')}</p>
                  <div className="flex items-center justify-between">
                    {renderStars(fav.rating || 0)}
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <HiLocationMarker className="w-3 h-3" />
                      {fav.address?.city}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;