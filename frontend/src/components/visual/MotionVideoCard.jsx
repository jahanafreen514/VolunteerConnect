import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play } from 'lucide-react';

/**
 * MotionVideoCard: A compact visual card playing a short, looping, muted video.
 */
const MotionVideoCard = ({
  src,
  poster,
  title = '',
  category = '',
  badge = '',
  rotation = 2,
  width = 'w-64 sm:w-72',
  className = '',
  floatDuration = 6,
  floatDistance = 8
}) => {
  const videoRef = useRef(null);
  const [hasError, setHasError] = useState(!src);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotate: rotation }}
      whileInView={{ opacity: 1, scale: 1, rotate: rotation }}
      viewport={{ once: true, margin: '-20px' }}
      animate={
        shouldReduceMotion
          ? {}
          : {
              y: [0, -floatDistance, 0],
              transition: {
                duration: floatDuration,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }
            }
      }
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              scale: 1.03,
              rotate: 0,
              transition: { type: 'spring', stiffness: 280, damping: 18 }
            }
      }
      className={`relative overflow-hidden rounded-2xl pastel-card p-2 border border-[#E6E8EC] shadow-soft-md hover:shadow-soft-hover transition-all duration-300 group ${width} ${className}`}
    >
      {/* Video / Visual container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
        {!hasError && src ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setHasError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            {poster ? (
              <img
                src={poster}
                alt={title || 'Volunteer scene'}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#D8EEE5] via-[#C9DDF2] to-[#DDD5F3] flex items-center justify-center">
                <Play className="w-8 h-8 text-[#28486D] opacity-60" />
              </div>
            )}
          </div>
        )}

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {category ? (
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E6E8EC] text-[10px] font-bold text-[#354052] uppercase tracking-wider shadow-soft-sm">
              {category}
            </span>
          ) : <span />}

          {badge && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#AFCDB5] text-[10px] font-bold text-[#26372B] shadow-soft-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#26372B]" />
              {badge}
            </span>
          )}
        </div>

        {/* Bottom Title Bar */}
        {title && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
            <p className="text-xs font-bold text-white truncate drop-shadow">
              {title}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MotionVideoCard;
