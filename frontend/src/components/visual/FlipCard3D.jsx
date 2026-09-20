import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * 3D Interactive Flip Card with perspective, smooth rotation,
 * hover/touch support, and glassmorphism styling.
 */
const FlipCard3D = ({
  frontTitle = 'Connect with Purpose',
  frontTag = 'Explore Causes',
  frontIcon: FrontIcon,
  backTitle = 'Purpose Driven',
  backDesc = 'Discover meaningful volunteering opportunities near your community and interests.',
  backIcon: BackIcon,
  linkText = 'Explore Causes',
  linkTo = '/opportunities',
  accentColor = 'from-primary-500/20 via-indigo-500/20 to-purple-500/20',
  borderColor = 'border-primary-500/30 hover:border-primary-400/60',
  iconColor = 'text-primary-400 bg-primary-500/15 border-primary-500/30',
  width = 'w-64 sm:w-72',
  height = 'h-72 sm:h-80',
  className = ''
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`group ${width} ${height} [perspective:1200px] cursor-pointer select-none ${className}`}
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsFlipped(!isFlipped);
        }
      }}
      aria-label={`${frontTitle}. Flip to view details.`}
    >
      <div
        className={`relative w-full h-full duration-700 [transform-style:preserve-3d] transition-transform ease-out ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* FRONT FACE */}
        <div
          className={`absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-3xl p-6 flex flex-col justify-between
            bg-white/[0.04] backdrop-blur-2xl border ${borderColor} shadow-glass
            bg-gradient-to-br ${accentColor} transition-all duration-300 group-hover:shadow-glow-sm`}
        >
          {/* Top header */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white/90 border border-white/10 backdrop-blur-md">
              {frontTag}
            </span>
            <div className={`p-2.5 rounded-2xl border ${iconColor}`}>
              {FrontIcon && <FrontIcon className="w-5 h-5" />}
            </div>
          </div>

          {/* Center Title */}
          <div className="my-auto py-4">
            <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {frontTitle.split('\n').map((line, idx) => (
                <span key={idx} className="block">
                  {line}
                </span>
              ))}
            </h4>
          </div>

          {/* Bottom Flip Hint */}
          <div className="flex items-center justify-between text-xs text-gray-300/80 pt-3 border-t border-white/10">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <RotateCw className="w-3.5 h-3.5 text-primary-300 group-hover:rotate-180 transition-transform duration-500" />
              Hover or tap to flip
            </span>
            <span className="text-white/40 group-hover:text-white transition-colors">↺</span>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl p-6 flex flex-col justify-between
            bg-[#0b102c]/90 backdrop-blur-2xl border ${borderColor} shadow-glass
            bg-gradient-to-tl ${accentColor}`}
        >
          {/* Top */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary-300 uppercase tracking-wider">
              {backTitle}
            </span>
            <div className={`p-2 rounded-xl border ${iconColor}`}>
              {BackIcon ? <BackIcon className="w-4 h-4" /> : FrontIcon ? <FrontIcon className="w-4 h-4" /> : null}
            </div>
          </div>

          {/* Description */}
          <div className="my-auto py-2">
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-normal">
              {backDesc}
            </p>
          </div>

          {/* Action Link */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <Link
              to={linkTo}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-300 hover:text-white group/link"
            >
              <span>{linkText}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>
            <span className="text-[10px] text-gray-400">Virtual Connect</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard3D;
