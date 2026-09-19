import React, { useState, useEffect, useRef } from 'react';

const DepthText = ({
  text = 'Connect. Volunteer.',
  layers = 34,
  depth = 2.4,
  faceColor = '#f8fafc',
  depthColor = '#7c3aed',
  tilt = 7.5,
  pointerTracking = true,
  smoothing = 0.14,
  perspective = 900,
  autoOrbit = true,
  orbitSpeed = 0.35,
  fontSize = 'clamp(2.5rem, 8vw, 5.5rem)',
  fontWeight = 900,
  shadow = true,
  className = ''
}) => {
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const isHovered = useRef(false);
  const timeRef = useRef(0);

  useEffect(() => {
    let animationFrameId;

    const animate = () => {
      timeRef.current += 0.016 * orbitSpeed;

      if (autoOrbit && !isHovered.current) {
        targetRotation.current = {
          x: Math.sin(timeRef.current) * tilt,
          y: Math.cos(timeRef.current * 0.8) * tilt
        };
      }

      // Smooth interpolation
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * smoothing;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * smoothing;

      setRotation({
        x: currentRotation.current.x,
        y: currentRotation.current.y
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [autoOrbit, orbitSpeed, tilt, smoothing]);

  const handlePointerMove = (e) => {
    if (!pointerTracking || !containerRef.current) return;
    isHovered.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    targetRotation.current = {
      x: -y * tilt * 2,
      y: x * tilt * 2
    };
  };

  const handlePointerLeave = () => {
    isHovered.current = false;
    if (!autoOrbit) {
      targetRotation.current = { x: 0, y: 0 };
    }
  };

  // Generate depth layers
  const layerElements = [];
  for (let i = layers; i >= 1; i--) {
    const layerDepth = i * depth;
    // Calculate color blend towards depthColor
    const factor = i / layers;
    const isFront = i === 1;

    layerElements.push(
      <span
        key={i}
        aria-hidden={!isFront}
        className="absolute inset-0 select-none pointer-events-none transition-transform"
        style={{
          transform: `translateZ(-${layerDepth}px)`,
          color: isFront ? faceColor : depthColor,
          opacity: isFront ? 1 : Math.max(0.2, 1 - factor * 0.7),
          textShadow: shadow && i === layers
            ? `0 ${layerDepth * 1.5}px ${layerDepth * 2}px rgba(0, 0, 0, 0.8), 0 0 40px ${depthColor}88`
            : undefined
        }}
      >
        {text}
      </span>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative inline-block cursor-pointer select-none ${className}`}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d'
      }}
    >
      <div
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
          fontSize,
          fontWeight,
          lineHeight: 1.1,
          letterSpacing: '-0.03em'
        }}
        className="relative"
      >
        {/* Invisible placeholder for layout sizing */}
        <span className="invisible block">{text}</span>
        {layerElements}
      </div>
    </div>
  );
};

export default DepthText;
