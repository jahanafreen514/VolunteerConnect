import React, { useEffect, useRef } from 'react';

/**
 * Lightweight, elegant pastel floating dots.
 * Features:
 * - Tiny pastel dots with gentle floating motion
 * - Low opacity: 0.15 - 0.35
 * - Pastel palette: lavender, pale blue, mint, blush, peach, soft sage
 * - Extremely smooth diagonal drift with slight alpha oscillation
 * - Ultra lightweight for 60fps performance
 */
const RisingParticles = ({
  count = 32,
  speed = 0.35,
  colors = ['#DDD5F3', '#C9DDF2', '#D8EEE5', '#F2D6DD', '#F6D8C5', '#BFD8C2'],
  className = ''
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Keep particle density comfortable and lightweight
    const actualCount = Math.min(Math.floor((width * height) / 38000), count);
    const particles = [];

    for (let i = 0; i < actualCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 1.2, // Tiny dots: 1.2px - 2.7px
        baseSpeedY: (Math.random() * 0.25 + 0.15) * speed,
        baseSpeedX: (Math.random() * 0.2 - 0.1) * speed,
        driftAmp: Math.random() * 0.8 + 0.2,
        driftSpeed: Math.random() * 0.008 + 0.003,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: Math.random() * 0.18 + 0.15, // 0.15 - 0.33
        alphaPulseSpeed: Math.random() * 0.01 + 0.004,
        color: colors[i % colors.length]
      });
    }

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Gently float upward and diagonally
        p.y -= p.baseSpeedY;
        p.x += Math.sin(time * p.driftSpeed + p.phase) * p.driftAmp + p.baseSpeedX;

        // Wrap around smoothly
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Soft subtle breathing alpha (0.15 - 0.35)
        const alpha = Math.min(
          0.35,
          Math.max(0.15, p.baseAlpha + Math.sin(time * p.alphaPulseSpeed + p.phase) * 0.08)
        );

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      render();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [count, speed, colors]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    />
  );
};

export default RisingParticles;
