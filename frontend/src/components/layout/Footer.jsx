import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="text-2xl font-display font-bold text-primary-400">
              TableBliss
            </Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Discover and reserve the best tables at your favorite restaurants. Your dining experience starts here.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link to="/restaurants" className="text-sm hover:text-primary-400 transition-colors">Restaurants</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-primary-400 transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="text-sm hover:text-primary-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm hover:text-primary-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm hover:text-primary-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm hover:text-primary-400 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li>123 Dining Street</li>
              <li>New York, NY 10001</li>
              <li className="pt-2">
                <a href="tel:+1234567890" className="hover:text-primary-400 transition-colors">+1 (234) 567-890</a>
              </li>
              <li>
                <a href="mailto:hello@tablebliss.com" className="hover:text-primary-400 transition-colors">hello@tablebliss.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} TableBliss. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;