import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, Shield, Sparkles, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-white/10 pt-16 pb-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Column 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 shadow-glow-sm">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Volunteer<span className="gradient-text">Connect</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Empowering communities by connecting passionate volunteers with verified NGOs. Track your service hours, earn verified digital certificates, and make an enduring social impact.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational — Live on Render & Atlas
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About Us</Link></li>
              <li><Link to="/opportunities" className="text-gray-400 hover:text-white text-sm transition-colors">Find Opportunities</Link></li>
              <li><a href="/#how-it-works" className="text-gray-400 hover:text-white text-sm transition-colors">How It Works</a></li>
            </ul>
          </div>

          {/* Column 3: Volunteers & NGOs */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Community</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1">
                  Volunteer Sign Up <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </Link>
              </li>
              <li>
                <Link to="/register?role=ngo" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1">
                  Register Your NGO <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </Link>
              </li>
              <li><Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Account Sign In</Link></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact Support</Link></li>
              <li><Link to="/about#verification" className="text-gray-400 hover:text-white text-sm transition-colors">NGO Verification</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Help & Inquiries</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} VolunteerConnect. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
