

import { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { restaurantAPI } from '../services/api';
import { CardSkeleton } from '../components/common/Skeleton';
import { HiStar, HiLocationMarker, HiClock, HiArrowRight } from 'react-icons/hi';
import { FaQuoteLeft } from 'react-icons/fa';

const HeroSection = () => (
  <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920')] bg-cover bg-center opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/50" />
    </div>
    
    {/* Animated circles */}
    <div className="absolute rounded-full top-20 left-10 w-72 h-72 bg-primary-500/20 blur-3xl animate-pulse" />
    <div className="absolute rounded-full bottom-20 right-10 w-96 h-96 bg-primary-400/10 blur-3xl animate-pulse" />

    <div className="relative z-10 px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl font-display">
          Discover & Reserve
          <span className="block text-primary-400">The Perfect Table</span>
        </h1>
        <p className="max-w-2xl mx-auto mb-10 text-lg text-gray-300 md:text-xl">
          Explore top-rated restaurants, browse menus, and book your table with ease. 
          Your unforgettable dining experience awaits.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/restaurants" className="btn-primary text-lg px-8 py-3.5">
            Explore Restaurants
            <HiArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/auth/register" className="btn-secondary text-lg px-8 py-3.5 bg-white/10 border-white/20 text-white hover:bg-white/20">
            Get Started
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="grid max-w-3xl grid-cols-2 gap-8 mx-auto mt-20 md:grid-cols-4"
      >
        {[
          { number: '500+', label: 'Restaurants' },
          { number: '50K+', label: 'Happy Diners' },
          { number: '100K+', label: 'Reservations' },
          { number: '4.8', label: 'Avg Rating' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold md:text-4xl text-primary-400">{stat.number}</div>
            <div className="mt-1 text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>

    {/* Scroll indicator */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="absolute -translate-x-1/2 bottom-8 left-1/2"
    >
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex justify-center w-6 h-10 border-2 rounded-full border-white/30"
      >
        <div className="w-1.5 h-3 bg-white/50 rounded-full mt-2" />
      </motion.div>
    </motion.div>
  </section>
);

const HowItWorks = () => (
  <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-16 text-center">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Three simple steps to your perfect dining experience</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
        {[
          { step: '01', title: 'Find a Restaurant', desc: 'Browse our curated list of restaurants, filter by cuisine, location, or rating.' },
          { step: '02', title: 'Choose Your Table', desc: 'Select your preferred date, time, and party size from available options.' },
          { step: '03', title: 'Enjoy Your Meal', desc: 'Show up at the restaurant and enjoy a seamless dining experience.' },
        ].map((item, i) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="text-center"
          >
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
              <span className="text-2xl font-bold text-primary-500">{item.step}</span>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FeaturedRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await restaurantAPI.getFeatured();
        setRestaurants(data.data.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch featured restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="section-title">Featured Restaurants</h2>
            <p className="section-subtitle">Hand-picked selections for you</p>
          </div>
          <Link to="/restaurants" className="hidden btn-outline sm:flex">
            View All <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : restaurants.map((restaurant, i) => (
                <motion.div
                  key={restaurant._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/restaurants/${restaurant._id}`} className="block card group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={restaurant.images?.cover || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                        alt={restaurant.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute px-2 py-1 text-sm font-medium rounded-full top-3 right-3 bg-white/90 backdrop-blur-sm">
                        {restaurant.priceRange}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-primary-500">{restaurant.name}</h3>
                      <div className="flex items-center gap-1 mb-2 text-yellow-400">
                        <HiStar className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{restaurant.rating}</span>
                        <span className="text-sm text-gray-400">({restaurant.totalReviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <HiLocationMarker className="w-4 h-4" />
                        <span className="truncate">{restaurant.address?.city}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {restaurant.cuisine?.slice(0, 2).map((c) => (
                          <span key={c} className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs rounded-full">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link to="/restaurants" className="btn-outline">
            View All Restaurants <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => (
  <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-16 text-center">
        <h2 className="section-title">What Our Diners Say</h2>
        <p className="section-subtitle">Join thousands of satisfied customers</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {[
          { name: 'Sarah Johnson', role: 'Food Blogger', text: 'TableBliss made it so easy to find and book the perfect restaurant for our anniversary. The real-time availability feature is a game-changer!', rating: 5 },
          { name: 'Michael Chen', role: 'Business Executive', text: 'I use TableBliss for all my business dinners. The seamless booking process and confirmation emails make planning effortless.', rating: 5 },
          { name: 'Emily Rodriguez', role: 'Travel Enthusiast', text: 'Traveling and trying new restaurants has never been easier. TableBliss helps me discover hidden gems wherever I go.', rating: 5 },
        ].map((testimonial, i) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="p-8 bg-white shadow-sm dark:bg-gray-800 rounded-xl"
          >
            <FaQuoteLeft className="w-8 h-8 mb-4 text-primary-200" />
            <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-400">{testimonial.text}</p>
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <HiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{testimonial.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Home = () => {
  return (
      <div>
      <HeroSection />
      <HowItWorks />
      <FeaturedRestaurants />
      <Testimonials />
    </div>
      );
};

export default Home;
