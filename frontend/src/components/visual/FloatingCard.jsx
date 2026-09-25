import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * FloatingCard: A subtle glassmorphic floating stat or badge card.
 */
const FloatingCard = ({
  icon: Icon,
  iconColor = 'text-primary-600 bg-primary-50 dark:text-primary-300 dark:bg-primary-500/20 border-primary-200 dark:border-primary-500/30',
  title = '',
  subtitle = '',
  value = '',
  badge = '',
  delay = 0,
  duration = 5,
  distance = 8,
  className = '',
  style = {}
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      animate={
        shouldReduceMotion
          ? {}
          : {
              y: [0, -distance, 0],
              transition: {
                duration,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay
              }
            }
      }
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              scale: 1.04,
              transition: { type: 'spring', stiffness: 350, damping: 20 }
            }
      }
      className={`inline-flex items-center gap-3.5 p-3 sm:p-3.5 pr-4 rounded-2xl bg-white/85 hover:bg-white/95 dark:bg-[#0f172a]/70 dark:hover:bg-[#0f172a]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/15 shadow-sm dark:shadow-[0_12px_32px_0_rgba(0,0,0,0.4)] transition-all cursor-default ${className}`}
      style={style}
    >
      {Icon && (
        <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          {value && (
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {value}
            </span>
          )}
          {badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-100 dark:bg-accent-500/20 text-accent-700 dark:text-accent-300 border border-accent-300/60 dark:border-accent-500/30">
              {badge}
            </span>
          )}
        </div>
        {title && (
          <span className="text-xs font-semibold text-slate-800 dark:text-gray-200 line-clamp-1">
            {title}
          </span>
        )}
        {subtitle && (
          <span className="text-[11px] text-slate-500 dark:text-gray-400 line-clamp-1">
            {subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default FloatingCard;
