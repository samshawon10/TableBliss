import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationAPI } from '../../services/api';
import { 
  HiMenu, HiX, HiSearch, HiUser, HiSun, HiMoon, HiBell, HiLogout, 
  HiCalendar, HiHeart, HiCog, HiMenu as HiMenuIcon 
} from 'react-icons/hi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated, isAdmin, isRestaurantOwner, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await notificationAPI.getUnreadCount();
      setUnreadCount(data.data.count);
    } catch (error) {}
  };

  useEffect(() => {
    setIsOpen(false);
    setShowProfileMenu(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !isScrolled;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/restaurants', label: 'Restaurants' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHome
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className={`text-2xl font-display font-bold ${isTransparent ? 'text-white' : 'text-primary-500'}`}>
              TableBliss
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="items-center hidden gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-medium transition-colors duration-200 ${
                  location.pathname === link.to
                    ? 'text-primary-500'
                    : isTransparent
                    ? 'text-white hover:text-primary-200'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-48 lg:w-64 pl-10 pr-4 py-2 rounded-full text-sm border ${
                    isTransparent
                      ? 'bg-white/10 text-white placeholder-white/70 border-white/20'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                <HiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isTransparent ? 'text-white/70' : 'text-gray-400'}`} />
              </div>
            </form>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${
                isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>

            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2"
                >
                  {/* Notifications */}
                  <Link
                    to="/dashboard/notifications"
                    className={`relative p-2 rounded-full transition-colors ${
                      isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <HiBell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${isTransparent ? 'border-white/30' : 'border-primary-200'}`}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-primary-100">
                        <HiUser className="w-4 h-4 text-primary-600" />
                      </div>
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 w-56 py-2 mt-2 bg-white border border-gray-100 shadow-lg dark:bg-gray-800 rounded-xl dark:border-gray-700"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <HiMenuIcon className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link to="/dashboard/reservations" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <HiCalendar className="w-4 h-4" /> My Reservations
                      </Link>
                      <Link to="/dashboard/favorites" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <HiHeart className="w-4 h-4" /> Favorites
                      </Link>
                      <Link to="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <HiCog className="w-4 h-4" /> Settings
                      </Link>
                      {(isAdmin || isRestaurantOwner) && (
                        <Link to={isAdmin ? '/admin' : '/owner'} className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700">
                          {isAdmin ? 'Admin Panel' : 'Owner Panel'}
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 w-full border-t border-gray-100 dark:border-gray-700"
                      >
                        <HiLogout className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="items-center hidden gap-3 md:flex">
                <Link
                  to="/auth/login"
                  className={`btn-secondary bg-white/30 transition-colors duration-200 text-sm py-2 ${isTransparent ? 'border-white/30 text-white hover:bg-white/10' : ''}`}
                >
                  Sign In
                </Link>
                <Link to="/auth/register" className="py-2 text-sm btn-primary">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-t border-gray-100 md:hidden dark:bg-gray-900 dark:border-gray-800"
          >
            <div className="px-4 py-4 space-y-3">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                />
              </form>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block py-2 font-medium ${
                    location.pathname === link.to ? 'text-primary-500' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated ? (
                <div className="flex gap-3 pt-2">
                  <Link to="/auth/login" className="flex-1 text-sm text-center btn-secondary">
                    Sign In
                  </Link>
                  <Link to="/auth/register" className="flex-1 text-sm text-center btn-primary">
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <p className="mb-2 text-sm text-gray-500">Signed in as {user?.email}</p>
                  <Link to="/dashboard" className="block py-2 text-gray-700 dark:text-gray-300">Dashboard</Link>
                  <Link to="/dashboard/reservations" className="block py-2 text-gray-700 dark:text-gray-300">My Reservations</Link>
                  <button onClick={logout} className="block py-2 text-red-600">Sign Out</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;