import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome, HiOfficeBuilding, HiUsers, HiCalendar, HiExclamation, HiLogout,
  HiExternalLink, HiMenu, HiX, HiCurrencyDollar, HiStar, HiPhotograph, HiChat,
  HiBell, HiChartBar, HiShieldCheck, HiCog, HiDocumentText, HiCollection,
  HiTrendingUp, HiCreditCard, HiSupport, HiInformationCircle, HiChevronDown,
  HiChevronLeft, HiChevronRight, HiSearch, HiShoppingCart, HiUserGroup,
  HiSun, HiMoon
} from 'react-icons/hi';

const sidebarSections = [
  { label: 'MAIN', items: [{ to: '/admin', label: 'Dashboard', icon: HiHome, exact: true }] },
  {
    label: 'MANAGEMENT',
    items: [
      { to: '/admin/restaurants', label: 'All Restaurants', icon: HiOfficeBuilding },
      { to: '/admin/restaurants?status=pending', label: 'Pending Approvals', icon: HiExclamation },
      { to: '/admin/restaurants?status=featured', label: 'Featured', icon: HiStar },
      { to: '/admin/owners', label: 'Restaurant Owners', icon: HiUsers },
      { to: '/admin/customers', label: 'Customers', icon: HiUserGroup },
    ],
  },
  { label: 'TRANSACTIONS', items: [{ to: '/admin/reservations', label: 'Reservations', icon: HiCalendar }, { to: '/admin/orders', label: 'Orders', icon: HiShoppingCart }] },
  { label: 'FINANCE', items: [{ to: '/admin/finance', label: 'Revenue', icon: HiCurrencyDollar }, { to: '/admin/commissions', label: 'Commissions', icon: HiCreditCard }, { to: '/admin/subscriptions', label: 'Subscriptions', icon: HiCollection }] },
  { label: 'CONTENT', items: [{ to: '/admin/reviews', label: 'Reviews', icon: HiStar }, { to: '/admin/advertisements', label: 'Advertisements', icon: HiPhotograph }, { to: '/admin/cms', label: 'CMS', icon: HiDocumentText }] },
  { label: 'SUPPORT', items: [{ to: '/admin/support', label: 'Support Tickets', icon: HiSupport }, { to: '/admin/notifications', label: 'Notifications', icon: HiBell }] },
  { label: 'ANALYTICS', items: [{ to: '/admin/analytics', label: 'Analytics', icon: HiChartBar }, { to: '/admin/activity-logs', label: 'Activity Logs', icon: HiShieldCheck }] },
  { label: 'SYSTEM', items: [{ to: '/admin/settings', label: 'Settings', icon: HiCog }] },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    import('../../services/api').then(api => {
      api.adminAPI.getStats().then(({ data }) => setNotifCount(data.data?.unreadContacts || 0)).catch(() => {});
    });
  }, []);

  const getPageTitle = () => {
    for (const section of sidebarSections)
      for (const item of section.items)
        if (item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to.split('?')[0])) return item.label;
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 72 }}
        className={`fixed lg:relative z-50 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300
          ${mobileSidebarOpen ? 'left-0' : '-left-full lg:left-0'}
          ${sidebarOpen ? 'w-[280px]' : 'w-[72px]'}`}
      >
        <div className={`flex items-center gap-3 p-5 border-b border-gray-100 dark:border-gray-800 ${!sidebarOpen && 'justify-center'}`}>
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg flex-shrink-0">
            <span className="text-lg font-bold text-white">T</span>
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
              <h1 className="text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">TableBliss</h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">Admin Panel</p>
            </motion.div>
          )}
        </div>

        {sidebarOpen && (
          <div className="px-4 pt-4">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm border-0 focus:ring-2 focus:ring-purple-500/50 outline-none"
              />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {sidebarSections.map(section => (
            <div key={section.label}>
              {sidebarOpen && (
                <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{section.label}</p>
              )}
              <div className="space-y-0.5">
                {section.items.map(link => {
                  const isActive = link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to.split('?')[0]);
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                        ${isActive
                          ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
                        ${!sidebarOpen && 'justify-center'}`}
                      title={!sidebarOpen ? link.label : undefined}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                        ${isActive
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'}`}>
                        <link.icon className="w-[18px] h-[18px]" />
                      </div>
                      {sidebarOpen && (
                        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="truncate">
                          {link.label}
                        </motion.span>
                      )}
                      {isActive && sidebarOpen && (
                        <motion.div layoutId="activeTab" className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={`p-3 border-t border-gray-100 dark:border-gray-800 ${!sidebarOpen && 'text-center'}`}>
          <div className={`flex items-center gap-3 ${sidebarOpen ? 'px-3 py-2' : 'justify-center'} rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors`}>
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-sm font-bold text-white">{user?.name?.[0] || 'A'}</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-gray-500 truncate">Super Admin</p>
              </div>
            )}
          </div>
          <div className={`flex gap-1 mt-2 ${!sidebarOpen && 'flex-col items-center'}`}>
            <NavLink to="/" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${!sidebarOpen && 'justify-center'}`} title="View Site">
              <HiExternalLink className="w-4 h-4" />{sidebarOpen && 'View Site'}
            </NavLink>
            <button onClick={logout} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${!sidebarOpen && 'justify-center'}`} title="Sign Out">
              <HiLogout className="w-4 h-4" />{sidebarOpen && 'Sign Out'}
            </button>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm hidden lg:flex"
        >
          {sidebarOpen ? <HiChevronLeft className="w-3 h-3" /> : <HiChevronRight className="w-3 h-3" />}
        </button>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <HiMenu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{getPageTitle()}</h2>
                <p className="text-xs text-gray-500">Manage your platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <HiSun className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                ) : (
                  <HiMoon className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
                )}
              </button>

              <button onClick={() => navigate('/admin/notifications')} className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Notifications">
                <HiBell className="w-5 h-5 text-gray-500" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white dark:ring-gray-900">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-[10px] text-gray-500">Super Admin</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-white">{user?.name?.[0] || 'A'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;