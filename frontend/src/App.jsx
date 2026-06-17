import { BrowserRouter as Router, Routes, Route, matchPath, useLocation } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, AdminRoute, OwnerRoute } from './routes/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Restaurants from './pages/Restaurants';
import RestaurantDetails from './pages/RestaurantDetails';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Customer Dashboard
import Dashboard from './pages/dashboard/Dashboard';
import DashboardReservations from './pages/dashboard/Reservations';
import DashboardFavorites from './pages/dashboard/Favorites';
import DashboardNotifications from './pages/dashboard/Notifications';
import DashboardProfile from './pages/dashboard/Profile';
import DashboardSettings from './pages/dashboard/Settings';

// Admin Layout & Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminReservations from './pages/admin/Reservations';
import AdminRestaurants from './pages/admin/Restaurants';
import AdminMenus from './pages/admin/Menus';
import AdminGallery from './pages/admin/Gallery';
import AdminOrders from './pages/admin/Orders';
import AdminOwners from './pages/admin/Owners';
import AdminCustomers from './pages/admin/Customers';
import AdminFinance from './pages/admin/Finance';
import AdminCommissions from './pages/admin/Commissions';
import AdminSubscriptions from './pages/admin/Subscriptions';
import AdminReviews from './pages/admin/Reviews';
import AdminAdvertisements from './pages/admin/Advertisements';
import AdminCMS from './pages/admin/CMS';
import AdminSupport from './pages/admin/Support';
import AdminNotifications from './pages/admin/Notifications';
import AdminAnalytics from './pages/admin/Analytics';
import AdminActivityLogs from './pages/admin/ActivityLogs';
import AdminSettings from './pages/admin/Settings';

// Owner Dashboard
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerReservations from './pages/owner/Reservations';
import OwnerRestaurants from './pages/owner/Restaurants';
import OwnerMenus from './pages/owner/Menus';
import OwnerReviews from './pages/owner/Reviews';
import OwnerTables from './pages/owner/Tables';
import OwnerSubscription from './pages/owner/Subscription';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
});

const AppLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// Wrapper to use AdminLayout for admin routes
const AdminPage = ({ children }) => <AdminLayout>{children}</AdminLayout>;

const ROUTE_META = [
  { path: '/', title: 'Home', description: 'Discover restaurants, browse menus, and reserve your table with TableBliss.' },
  { path: '/auth/login', title: 'Log In', description: 'Sign in to your TableBliss account.' },
  { path: '/auth/register', title: 'Create Account', description: 'Create a TableBliss account to reserve tables and manage bookings.' },
  { path: '/auth/forgot-password', title: 'Forgot Password', description: 'Recover access to your TableBliss account.' },
  { path: '/auth/reset-password/:token', title: 'Reset Password', description: 'Set a new password for your TableBliss account.' },
  { path: '/restaurants', title: 'Restaurants', description: 'Browse restaurants and find your next dining destination.' },
  { path: '/restaurants/:id', title: 'Restaurant Details', description: 'View restaurant details, availability, and reservation options.' },
  { path: '/contact', title: 'Contact Us', description: 'Reach out to the TableBliss team for support and questions.', icon: '/contact-favicon.svg' },
  { path: '/dashboard', title: 'Customer Dashboard', description: 'Manage your reservations, favorites, profile, and notifications.' },
  { path: '/dashboard/reservations', title: 'My Reservations', description: 'View and manage your upcoming and past reservations.' },
  { path: '/dashboard/favorites', title: 'Favorites', description: 'See the restaurants you saved in TableBliss.' },
  { path: '/dashboard/notifications', title: 'Notifications', description: 'Review your latest account alerts and updates.' },
  { path: '/dashboard/profile', title: 'Profile', description: 'Update your account details and preferences.' },
  { path: '/dashboard/settings', title: 'Account Settings', description: 'Control your account, privacy, and notification settings.' },
  { path: '/admin', title: 'Admin Dashboard', description: 'Monitor platform activity and manage the TableBliss marketplace.' },
  { path: '/admin/users', title: 'Manage Users', description: 'Review and manage platform users.' },
  { path: '/admin/restaurants', title: 'Manage Restaurants', description: 'Approve, edit, and organize restaurant listings.' },
  { path: '/admin/reservations', title: 'Manage Reservations', description: 'Inspect reservation activity across the platform.' },
  { path: '/admin/menus', title: 'Manage Menus', description: 'Review and manage restaurant menus.' },
  { path: '/admin/gallery', title: 'Manage Gallery', description: 'Curate restaurant images and media.' },
  { path: '/admin/orders', title: 'Manage Orders', description: 'Review platform order activity and status.' },
  { path: '/admin/owners', title: 'Manage Owners', description: 'Review restaurant owner accounts and access.' },
  { path: '/admin/customers', title: 'Manage Customers', description: 'Review customer accounts and activity.' },
  { path: '/admin/finance', title: 'Finance', description: 'Track revenue, bookings, and transactions.' },
  { path: '/admin/commissions', title: 'Commissions', description: 'Review commission metrics and payouts.' },
  { path: '/admin/subscriptions', title: 'Subscriptions', description: 'Verify payments and manage subscription plans.' },
  { path: '/admin/reviews', title: 'Review Moderation', description: 'Moderate customer reviews and feedback.' },
  { path: '/admin/advertisements', title: 'Advertisements', description: 'Manage promotional placements and campaigns.' },
  { path: '/admin/cms', title: 'CMS', description: 'Edit site content and landing pages.' },
  { path: '/admin/support', title: 'Support', description: 'Review customer support requests and messages.' },
  { path: '/admin/notifications', title: 'Admin Notifications', description: 'Manage platform notifications and announcements.' },
  { path: '/admin/analytics', title: 'Analytics', description: 'Inspect platform trends and usage metrics.' },
  { path: '/admin/activity-logs', title: 'Activity Logs', description: 'Audit recent platform actions and events.' },
  { path: '/admin/settings', title: 'Admin Settings', description: 'Adjust administrative configuration and preferences.' },
  { path: '/admin/disputes', title: 'Disputes', description: 'Review reservation disputes and related cases.' },
  { path: '/owner', title: 'Owner Dashboard', description: 'Manage your restaurants, reservations, tables, and reviews.' },
  { path: '/owner/restaurants', title: 'My Restaurants', description: 'Create and manage your restaurant listings.' },
  { path: '/owner/reservations', title: 'Owner Reservations', description: 'Track and manage reservations for your restaurants.' },
  { path: '/owner/menus', title: 'Owner Menus', description: 'Update restaurant menu items and details.' },
  { path: '/owner/tables', title: 'Owner Tables', description: 'Manage table layouts and availability.' },
  { path: '/owner/reviews', title: 'Owner Reviews', description: 'Read and respond to customer reviews.' },
  { path: '/owner/subscription', title: 'Subscription', description: 'Manage your subscription plan and payment history.' },
];

const getPageMeta = (pathname) => {
  const match = ROUTE_META.find(({ path }) => matchPath({ path, end: true }, pathname));
  return match || {
    title: 'TableBliss',
    description: 'TableBliss helps restaurants and diners connect through fast, simple reservations.',
  };
};

const RouteHelmet = () => {
  const { pathname } = useLocation();
  const meta = getPageMeta(pathname);

  return (
    <Helmet>
      <title>{`${meta.title} | TableBliss`}</title>
      <meta name="description" content={meta.description} />
      <link rel="icon" type="image/svg+xml" href={meta.icon || '/favicon.svg'} />
    </Helmet>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <HelmetProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <RouteHelmet />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<AppLayout><Home /></AppLayout>} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
              <Route path="/restaurants" element={<AppLayout><Restaurants /></AppLayout>} />
              <Route path="/restaurants/:id" element={<AppLayout><RestaurantDetails /></AppLayout>} />
              <Route path="/contact" element={<AppLayout><Contact /></AppLayout>} />

              {/* Customer Dashboard */}
              <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
              <Route path="/dashboard/reservations" element={<ProtectedRoute><AppLayout><DashboardReservations /></AppLayout></ProtectedRoute>} />
              <Route path="/dashboard/favorites" element={<ProtectedRoute><AppLayout><DashboardFavorites /></AppLayout></ProtectedRoute>} />
              <Route path="/dashboard/notifications" element={<ProtectedRoute><AppLayout><DashboardNotifications /></AppLayout></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><AppLayout><DashboardProfile /></AppLayout></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><AppLayout><DashboardSettings /></AppLayout></ProtectedRoute>} />

              {/* Admin Panel */}
              <Route path="/admin" element={<AdminRoute><AdminPage><AdminDashboard /></AdminPage></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminPage><AdminUsers /></AdminPage></AdminRoute>} />
              <Route path="/admin/restaurants" element={<AdminRoute><AdminPage><AdminRestaurants /></AdminPage></AdminRoute>} />
              <Route path="/admin/reservations" element={<AdminRoute><AdminPage><AdminReservations /></AdminPage></AdminRoute>} />
              <Route path="/admin/menus" element={<AdminRoute><AdminPage><AdminMenus /></AdminPage></AdminRoute>} />
              <Route path="/admin/gallery" element={<AdminRoute><AdminPage><AdminGallery /></AdminPage></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminPage><AdminOrders /></AdminPage></AdminRoute>} />
              <Route path="/admin/owners" element={<AdminRoute><AdminPage><AdminOwners /></AdminPage></AdminRoute>} />
              <Route path="/admin/customers" element={<AdminRoute><AdminPage><AdminCustomers /></AdminPage></AdminRoute>} />
              <Route path="/admin/finance" element={<AdminRoute><AdminPage><AdminFinance /></AdminPage></AdminRoute>} />
              <Route path="/admin/commissions" element={<AdminRoute><AdminPage><AdminCommissions /></AdminPage></AdminRoute>} />
              <Route path="/admin/subscriptions" element={<AdminRoute><AdminPage><AdminSubscriptions /></AdminPage></AdminRoute>} />
              <Route path="/admin/reviews" element={<AdminRoute><AdminPage><AdminReviews /></AdminPage></AdminRoute>} />
              <Route path="/admin/advertisements" element={<AdminRoute><AdminPage><AdminAdvertisements /></AdminPage></AdminRoute>} />
              <Route path="/admin/cms" element={<AdminRoute><AdminPage><AdminCMS /></AdminPage></AdminRoute>} />
              <Route path="/admin/support" element={<AdminRoute><AdminPage><AdminSupport /></AdminPage></AdminRoute>} />
              <Route path="/admin/notifications" element={<AdminRoute><AdminPage><AdminNotifications /></AdminPage></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdminPage><AdminAnalytics /></AdminPage></AdminRoute>} />
              <Route path="/admin/activity-logs" element={<AdminRoute><AdminPage><AdminActivityLogs /></AdminPage></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><AdminPage><AdminSettings /></AdminPage></AdminRoute>} />
              <Route path="/admin/disputes" element={<AdminRoute><AdminPage><AdminReservations /></AdminPage></AdminRoute>} />

              {/* Owner Dashboard */}
              <Route path="/owner" element={<OwnerRoute><AppLayout><OwnerDashboard /></AppLayout></OwnerRoute>} />
              <Route path="/owner/restaurants" element={<OwnerRoute><AppLayout><OwnerRestaurants /></AppLayout></OwnerRoute>} />
              <Route path="/owner/reservations" element={<OwnerRoute><AppLayout><OwnerReservations /></AppLayout></OwnerRoute>} />
              <Route path="/owner/menus" element={<OwnerRoute><AppLayout><OwnerMenus /></AppLayout></OwnerRoute>} />
              <Route path="/owner/tables" element={<OwnerRoute><AppLayout><OwnerTables /></AppLayout></OwnerRoute>} />
              <Route path="/owner/reviews" element={<OwnerRoute><AppLayout><OwnerReviews /></AppLayout></OwnerRoute>} />
              <Route path="/owner/subscription" element={<OwnerRoute><AppLayout><OwnerSubscription /></AppLayout></OwnerRoute>} />

              {/* 404 Catch-all Route */}
              <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
            </Routes>
          </Router>
          </HelmetProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
