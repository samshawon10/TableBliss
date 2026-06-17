import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome, HiOfficeBuilding, HiUsers, HiCalendar, HiExclamation, HiLogout,
  HiExternalLink, HiMenu, HiX, HiCurrencyDollar, HiStar, HiPhotograph, HiChat,
  HiBell, HiChartBar, HiShieldCheck, HiCog, HiDocumentText, HiCollection,
  HiTrendingUp, HiCreditCard, HiSupport, HiInformationCircle, HiChevronDown,
  HiChevronLeft, HiChevronRight, HiSearch, HiShoppingCart, HiUserGroup
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 72 }}
        className={`fixed lg:relative z-50 h-screen bg-gradient-to-b from-[#1a0533] via-[#1e0840] to-[#12082a] border-r border-[#2a1250]/60 flex flex-col transition-all duration-300 shadow-2xl shadow-purple-900/30
          ${mobileSidebarOpen ? 'left-0' : '-left-full lg:left-0'}
          ${sidebarOpen ? 'w-[280px]' : 'w-[72px]'}`}
      >
        {/* Logo area */}
        <div className={`flex items-center gap-3 p-5 border-b border-[#3a1a6a]/60 ${!sidebarOpen && 'justify-center'}`}>
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#d4a574] to-[#b8863e] rounded-xl shadow-lg shadow-[#d4a574]/30 flex-shrink-0">
            <span className="text-lg font-bold text-[#1a0533]">T</span>
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
              <h1 className="text-base font-bold bg-gradient-to-r from-[#d4a574] to-[#ecc27d] bg-clip-text text-transparent">TableBliss</h1>
              <p className="text-[10px] text-[#b89ddf] -mt-0.5">Admin Panel</p>
            </motion.div>
          )}
        </div>

        {/* Search */}
        {sidebarOpen && (
          <div className="px-4 pt-4">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b6cb0]" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-[#2a1050]/60 border border-[#3a1a6a]/40 rounded-lg text-sm text-white placeholder-[#8b6cb0] focus:ring-2 focus:ring-[#d4a574]/50 focus:border-[#d4a574]/50 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-[#3a1a6a] scrollbar-track-transparent">
          {sidebarSections.map(section => (
            <div key={section.label}>
              {sidebarOpen && (
                <p className="px-3 mb-2 text-[10px] font-bold text-[#8b6cb0] uppercase tracking-[0.15em]">{section.label}</p>
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
                          ? 'bg-gradient-to-r from-[#d4a574]/20 to-[#b8863e]/10 text-[#f0d6a8] shadow-lg shadow-[#d4a574]/10'
                          : 'text-[#b89ddf] hover:bg-[#2a1050]/40 hover:text-[#d4a574]'}
                        ${!sidebarOpen && 'justify-center'}`}
                      title={!sidebarOpen ? link.label : undefined}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                        ${isActive
                          ? 'bg-gradient-to-br from-[#d4a574] to-[#b8863e] text-[#1a0533] shadow-lg shadow-[#d4a574]/30'
                          : 'bg-[#2a1050]/50 text-[#8b6cb0] group-hover:bg-[#3a1a6a]/60 group-hover:text-[#d4a574]'}`}>
                        <link.icon className="w-[18px] h-[18px]" />
                      </div>
                      {sidebarOpen && (
                        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="truncate">
                          {link.label}
                        </motion.span>
                      )}
                      {isActive && sidebarOpen && (
                        <motion.div layoutId="activeTab" className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4a574] shadow-lg shadow-[#d4a574]/50" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User area */}
        <div className={`p-3 border-t border-[#3a1a6a]/60 ${!sidebarOpen && 'text-center'}`}>
          <div className={`flex items-center gap-3 ${sidebarOpen ? 'px-3 py-2' : 'justify-center'} rounded-xl hover:bg-[#2a1050]/30 cursor-pointer transition-colors`}>
            <div className="w-9 h-9 bg-gradient-to-br from-[#d4a574] to-[#b8863e] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-[#d4a574]/20">
              <span className="text-sm font-bold text-[#1a0533]">{user?.name?.[0] || 'A'}</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-[#f0d6a8]">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-[#8b6cb0] truncate">Super Admin</p>
              </div>
            )}
          </div>
          <div className={`flex gap-1 mt-2 ${!sidebarOpen && 'flex-col items-center'}`}>
            <NavLink to="/" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#8b6cb0] hover:bg-[#2a1050]/40 hover:text-[#d4a574] transition-colors ${!sidebarOpen && 'justify-center'}`} title="View Site">
              <HiExternalLink className="w-4 h-4" />{sidebarOpen && 'View Site'}
            </NavLink>
            <button onClick={logout} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${!sidebarOpen && 'justify-center'}`} title="Sign Out">
              <HiLogout className="w-4 h-4" />{sidebarOpen && 'Sign Out'}
            </button>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#1e0840] border border-[#3a1a6a] rounded-full flex items-center justify-center text-[#b89ddf] hover:text-[#d4a574] shadow-lg shadow-purple-900/30 hidden lg:flex transition-colors"
        >
          {sidebarOpen ? <HiChevronLeft className="w-3 h-3" /> : <HiChevronRight className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
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
                <div className="w-9 h-9 bg-gradient-to-br from-[#1a0533] to-[#2a1050] rounded-xl flex items-center justify-center shadow-md border border-[#3a1a6a]/30">
                  <span className="text-sm font-bold text-[#d4a574]">{user?.name?.[0] || 'A'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;