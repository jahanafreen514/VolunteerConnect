import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-xl border-t border-[#E6E8EC] pt-12 pb-10 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Column 1: Brand */}
          <div className="lg:col-span-2 space-y-3.5">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#BFD8C2] border border-[#AFCDB5] flex items-center justify-center shadow-soft-sm">
                <Heart className="w-4 h-4 text-[#26372B] fill-[#9fc2a6]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#26372B]">
                Volunteer<span className="text-[#556e5a]">Connect</span>
              </span>
            </Link>
            <p className="text-[#667085] text-xs sm:text-sm leading-relaxed max-w-sm">
              Empowering communities by connecting passionate volunteers with verified NGOs. Track your service hours, earn verified digital certificates, and make an enduring social impact.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D8EEE5] border border-[#bce1d3] text-[#244e44] text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#54947f] animate-pulse" />
              Verified Community Impact Platform
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#26372B] mb-3">Platform</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/" className="text-[#667085] hover:text-[#26372B] transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-[#667085] hover:text-[#26372B] transition-colors">About Us</Link></li>
              <li><Link to="/opportunities" className="text-[#667085] hover:text-[#26372B] transition-colors">Find Opportunities</Link></li>
              <li><a href="/#how-it-works" className="text-[#667085] hover:text-[#26372B] transition-colors">How It Works</a></li>
            </ul>
          </div>

          {/* Column 3: Community */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#26372B] mb-3">Community</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/register?role=volunteer" className="text-[#667085] hover:text-[#26372B] transition-colors inline-flex items-center gap-1">
                  Volunteer Sign Up <ArrowUpRight className="w-3 h-3 text-[#98A2B3]" />
                </Link>
              </li>
              <li>
                <Link to="/register?role=ngo" className="text-[#667085] hover:text-[#26372B] transition-colors inline-flex items-center gap-1">
                  Register Your NGO <ArrowUpRight className="w-3 h-3 text-[#98A2B3]" />
                </Link>
              </li>
              <li><Link to="/login" className="text-[#667085] hover:text-[#26372B] transition-colors">Account Sign In</Link></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#26372B] mb-3">Support</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/contact" className="text-[#667085] hover:text-[#26372B] transition-colors">Contact Support</Link></li>
              <li><Link to="/about#verification" className="text-[#667085] hover:text-[#26372B] transition-colors">NGO Verification</Link></li>
              <li><Link to="/contact" className="text-[#667085] hover:text-[#26372B] transition-colors">Help & Inquiries</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#E6E8EC] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#667085]">
          <p>© {new Date().getFullYear()} VolunteerConnect. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/about" className="hover:text-[#26372B] transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-[#26372B] transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-[#26372B] transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
