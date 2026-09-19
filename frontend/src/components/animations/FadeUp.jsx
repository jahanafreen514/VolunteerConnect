import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Reusable FadeUp entrance / scroll-reveal wrapper.
 */
const FadeUp = ({
  children,
  delay = 0,
  duration = 0.6,
  distance = 24,
  trigger = 'whileInView', // 'whileInView' | 'mount'
  once = true,
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

  const initial = { opacity: 0, y: distance };
  const target = { opacity: 1, y: 0 };
  const transition = {
    duration,
    delay,
    ease: [0.21, 0.47, 0.32, 0.98]
  };

  if (trigger === 'mount') {
    return (
      <motion.div
        initial={initial}
        animate={target}
        transition={transition}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={initial}
      whileInView={target}
      viewport={{ once, margin: '-40px' }}
      transition={transition}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default FadeUp;
