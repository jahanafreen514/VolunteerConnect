import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * AnimatedImage: Responsive image component with smooth hover zoom,
 * glassmorphic border, and optional floating badge.
 */
const AnimatedImage = ({
  src,
  alt = 'Volunteer activity',
  aspectRatio = 'aspect-[4/3]',
  badge = '',
  caption = '',
  className = '',
  onClick
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.02 }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/15 p-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.4)] group cursor-pointer ${className}`}
    >
      <div className={`relative ${aspectRatio} w-full overflow-hidden rounded-xl bg-gray-900`}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
        />

        {/* Ambient Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badge */}
        {badge && (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider">
            {badge}
          </div>
        )}

        {/* Bottom Caption */}
        {caption && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
            <p className="text-xs font-semibold text-white drop-shadow-md line-clamp-1">
              {caption}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnimatedImage;
