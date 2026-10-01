import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Modern Clean Card without 3D rotation, matching requirement 7
 */
const FlipCard3D = ({
  frontTitle = 'Connect with Purpose',
  frontTag = 'Explore Causes',
  frontIcon: FrontIcon,
  backDesc = 'Discover meaningful volunteering opportunities near your community and interests.',
  linkText = 'Explore Causes',
  linkTo = '/opportunities',
  width = 'w-64 sm:w-72',
  className = ''
}) => {
  return (
    <div
      className={`group ${width} pastel-card p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-hover ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F5F1FA] text-[#4D3A7A] border border-[#DDD5F3]">
            {frontTag}
          </span>
          {FrontIcon && (
            <div className="p-2.5 rounded-2xl bg-[#D8EEE5] text-[#26372B] border border-[#BFD8C2]">
              <FrontIcon className="w-5 h-5" />
            </div>
          )}
        </div>

        <h4 className="text-xl font-bold text-[#354052] mb-2 leading-snug">
          {frontTitle}
        </h4>
        <p className="text-sm text-[#667085] leading-relaxed">
          {backDesc}
        </p>
      </div>

      <div className="pt-4 border-t border-[#E6E8EC] mt-4 flex items-center justify-between">
        <Link
          to={linkTo}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#28486D] hover:underline"
        >
          <span>{linkText}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <span className="text-[10px] text-[#667085] font-medium">VolunteerConnect</span>
      </div>
    </div>
  );
};

export default FlipCard3D;
