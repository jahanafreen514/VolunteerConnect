import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Modern PolaroidCard component.
 * Features:
 * - Crisp white/light frame with authentic Polaroid proportions
 * - Subtle resting rotation with soft shadow
 * - On hover: straightens rotation, lifts up, expands shadow, and zooms image
 * - Small caption area with optional tag/badge
 */
const PolaroidCard = ({
  image,
  videoSrc,
  caption = '',
  tag = '',
  date = '',
  badge = '',
  rotation = -3,
  width = 'w-64 sm:w-72',
  className = '',
  onClick
}) => {
  const shouldReduceMotion = useReducedMotion();

  const hoverState = shouldReduceMotion
    ? {}
    : {
        y: -10,
        rotate: rotation * 0.2,
        scale: 1.03,
        transition: { type: 'spring', stiffness: 260, damping: 20 }
      };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, rotate: rotation }}
      whileInView={{ opacity: 1, scale: 1, rotate: rotation }}
      viewport={{ once: true, margin: '-20px' }}
      whileHover={hoverState}
      onClick={onClick}
      style={{
        transformOrigin: 'center center',
      }}
      className={`relative select-none bg-white text-gray-900 rounded-2xl p-3 pb-5 shadow-[0_16px_38px_-10px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.2)] hover:shadow-[0_26px_50px_-12px_rgba(99,102,241,0.35),0_0_0_1px_rgba(255,255,255,0.35)] transition-shadow duration-300 cursor-pointer ${width} ${className}`}
    >
      {/* Media Window (Photo) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 shadow-inner group">
        {videoSrc ? (
          <video
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : image ? (
          <img
            src={image}
            alt={caption || 'Community event'}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400/20 via-indigo-500/20 to-purple-500/20 flex items-center justify-center text-gray-400 text-xs font-semibold">
            Volunteer Moment
          </div>
        )}

        {/* Soft Vignette / Glow on photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5 pointer-events-none" />

        {/* Optional floating badge inside photo */}
        {badge && (
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white shadow-sm flex items-center gap-1">
            <span>{badge}</span>
          </div>
        )}
      </div>

      {/* Polaroid Caption Area */}
      <div className="pt-3 px-1 flex flex-col gap-0.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 tracking-wider uppercase">
          {tag && <span className="text-primary-600 font-bold">{tag}</span>}
          {date && <span>{date}</span>}
        </div>
        {caption && (
          <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mt-0.5 font-sans">
            {caption}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default PolaroidCard;
