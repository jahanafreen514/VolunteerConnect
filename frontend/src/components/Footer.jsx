import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900/80 backdrop-blur-md border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-purple-400">
                VolunteerConnect
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Connecting passionate individuals with meaningful volunteer opportunities. 
              Together we can make a difference in our communities and build a better world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">About Us</Link></li>
              <li><Link to="/opportunities" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Browse Opportunities</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Register</Link></li>
            </ul>
          </div>

          {/* For Organizations */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Organizations</h4>
            <ul className="space-y-2">
              <li><Link to="/register/ngo" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Join as NGO</Link></li>
              <li><Link to="/ngo/dashboard" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">NGO Portal</Link></li>
              <li><Link to="/admin/login" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} VolunteerConnect. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center">
            Made with <Heart className="w-4 h-4 text-red-500 mx-1 inline" /> for a better world
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
