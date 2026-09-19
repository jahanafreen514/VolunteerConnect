import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Subtle interactive 3D perspective / parallax tilt on hover.
 */
const Parallax = ({
  children,
  tiltMax = 6,
  scaleOnHover = 1.02,
  className = '',
  style = {}
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [coords, setCoords] = useState({ rotateX: 0, rotateY: 0 });

  if (shouldReduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -tiltMax;
    const rotateY = ((x - centerX) / centerX) * tiltMax;

    setCoords({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setCoords({ rotateX: 0, rotateY: 0 });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: coords.rotateX,
        rotateY: coords.rotateY
      }}
      whileHover={{ scale: scaleOnHover }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
        ...style
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default Parallax;
