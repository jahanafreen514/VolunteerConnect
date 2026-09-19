import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Floating animation wrapper with continuous gentle bobbing motion.
 * Automatically respects prefers-reduced-motion.
 */
const Floating = ({
  children,
  duration = 5,
  delay = 0,
  distance = 10,
  rotate = 1.5,
  className = '',
  style = {}
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      animate={{
        y: [0, -distance, 0],
        rotate: [0, rotate, 0]
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
        delay
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default Floating;
