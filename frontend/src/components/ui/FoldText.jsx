import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FoldText = ({
  text = 'WELCOME',
  splitBy = 'char',
  hinge = 'top',
  trigger = 'mount',
  duration = 0.65,
  stagger = 0.045,
  ease = [0.215, 0.61, 0.355, 1], // Equivalent to power3.out
  perspective = 700,
  creaseShading = 0.55,
  fontSize = 72,
  fontWeight = 800,
  color = '#f7f2e8',
  className = ''
}) => {
  const [isTriggered, setIsTriggered] = useState(trigger === 'mount');

  useEffect(() => {
    if (trigger === 'mount') {
      setIsTriggered(true);
    }
  }, [trigger]);

  const items = splitBy === 'char' ? text.split('') : text.split(' ');

  const hingeOrigins = {
    top: 'center top',
    bottom: 'center bottom',
    left: 'left center',
    right: 'right center'
  };

  const initialRotate = {
    top: { rotateX: -90, opacity: 0 },
    bottom: { rotateX: 90, opacity: 0 },
    left: { rotateY: -90, opacity: 0 },
    right: { rotateY: 90, opacity: 0 }
  };

  return (
    <div
      className={`inline-flex flex-wrap justify-center items-center select-none ${className}`}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d'
      }}
      onMouseEnter={() => trigger === 'hover' && setIsTriggered(true)}
      onMouseLeave={() => trigger === 'hover' && setIsTriggered(false)}
    >
      {items.map((item, index) => {
        const isSpace = item === ' ';

        if (isSpace) {
          return <span key={index} className="inline-block w-4">&nbsp;</span>;
        }

        return (
          <div
            key={index}
            className="inline-block relative overflow-visible"
            style={{
              perspective: `${perspective}px`,
              transformStyle: 'preserve-3d'
            }}
          >
            <motion.div
              initial={initialRotate[hinge] || initialRotate.top}
              animate={isTriggered ? { rotateX: 0, rotateY: 0, opacity: 1 } : initialRotate[hinge]}
              transition={{
                duration,
                delay: index * stagger,
                ease
              }}
              style={{
                transformOrigin: hingeOrigins[hinge] || hingeOrigins.top,
                transformStyle: 'preserve-3d',
                fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
                fontWeight,
                color,
                display: 'inline-block',
                lineHeight: 1,
                padding: '0.05em 0.08em',
                backfaceVisibility: 'hidden',
                textShadow: `0 4px 20px rgba(0, 0, 0, ${creaseShading})`
              }}
            >
              {item}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

export default FoldText;
