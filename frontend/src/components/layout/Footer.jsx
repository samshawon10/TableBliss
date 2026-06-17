import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="text-gray-300 bg-gray-900">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="text-2xl font-bold font-display text-primary-400">
              TableBliss
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Discover and reserve the best tables at your favorite restaurants. Your dining experience starts here.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 transition-colors hover:text-primary-400">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-primary-400">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-primary-400">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-primary-400">
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm transition-colors hover:text-primary-400">About Us</Link></li>
              <li><Link to="/restaurants" className="text-sm transition-colors hover:text-primary-400">Restaurants</Link></li>
              <li><Link to="/contact" className="text-sm transition-colors hover:text-primary-400">Contact</Link></li>
              <li><Link to="/faq" className="text-sm transition-colors hover:text-primary-400">FAQ</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm transition-colors hover:text-primary-400">Help Center</a></li>
              <li><a href="#" className="text-sm transition-colors hover:text-primary-400">Privacy Policy</a></li>
              <li><a href="#" className="text-sm transition-colors hover:text-primary-400">Terms of Service</a></li>
              <li><a href="#" className="text-sm transition-colors hover:text-primary-400">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
         <div>
  <h3 className="mb-4 font-semibold text-white">Contact Us</h3>

  <ul className="space-y-3 text-sm">
    <li>House 15, Road 2</li>

    <li>Notun Bazar, Badda, Dhaka 1212, Bangladesh</li>

    <li className="pt-2">
      <a
        href="tel:+8801712345678"
        className="transition-colors hover:text-primary-400"
      >
        +880 1712-345678
      </a>
    </li>

    <li>
      <a
        href="mailto:hello@tablebliss.com"
        className="transition-colors hover:text-primary-400"
      >
        hello@tablebliss.com
      </a>
    </li>
  </ul>
 </div>
        </div>

       <div className="pt-8 mt-12 text-sm text-center text-gray-500 border-t border-gray-800">
  <p>
    &copy; {new Date().getFullYear()} TableBliss. All rights reserved.
  </p>

  <p className="mt-2">
    Developed by{" "}
    <a
      href="https://shawonakando.dev"
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-gray-500 transition-colors hover:text-primary-400"
    >
    The Lazy Loaders
    </a>
  </p>
</div>
      </div>
    </footer>
  );
};

export default Footer;