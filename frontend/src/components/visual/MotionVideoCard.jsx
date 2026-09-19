import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play } from 'lucide-react';

/**
 * MotionVideoCard: A compact visual card playing a short, looping, muted video.
 * Features:
 * - autoplay, muted, loop, playsInline
 * - No visible video controls
 * - Rounded corners, soft shadow, subtle hover scale
 * - Smooth floating animation
 * - Graceful fallback to rich animated community image if video is not available
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
              scale: 1.04,
              rotate: 0,
              transition: { type: 'spring', stiffness: 280, damping: 18 }
            }
      }
      className={`relative overflow-hidden rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/20 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(99,102,241,0.3)] transition-shadow duration-300 group ${width} ${className}`}
    >
      {/* Video / Visual container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gray-900">
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
              <div className="w-full h-full bg-gradient-to-tr from-primary-900/60 via-purple-900/40 to-cyan-900/40 flex items-center justify-center">
                <Play className="w-8 h-8 text-white/50 animate-pulse" />
              </div>
            )}
          </div>
        )}

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {category ? (
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider">
              {category}
            </span>
          ) : <span />}

          {badge && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-500/80 backdrop-blur-md text-[10px] font-semibold text-white shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              {badge}
            </span>
          )}
        </div>

        {/* Bottom Title Bar */}
        {title && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
            <p className="text-xs font-bold text-white truncate drop-shadow-md">
              {title}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MotionVideoCard;
