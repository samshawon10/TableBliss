import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="text-9xl font-bold text-primary-500/20 dark:text-primary-400/10 select-none">
          404
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-[-1.5rem] mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="btn-primary"
          >
            Go Home
          </Link>
          <Link
            to="/restaurants"
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;