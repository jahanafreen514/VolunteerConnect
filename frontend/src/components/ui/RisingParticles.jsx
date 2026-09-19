import React, { useEffect, useRef } from 'react';

const RisingParticles = ({
  count = 60,
  speed = 0.8,
  glow = true,
  colors = ['#818cf8', '#38bdf8', '#c084fc', '#34d399', '#f472b6'],
  interactive = true,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 140 });

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

    const handleMouseMove = (e) => {
      if (!interactive) return;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Create rising particles
    const particles = [];
    const actualCount = Math.min(Math.floor((width * height) / 18000), count);

    for (let i = 0; i < actualCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 1.2,
        baseSpeed: (Math.random() * 0.6 + 0.4) * speed,
        driftSpeed: Math.random() * 0.02 + 0.005,
        driftAmp: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.6 + 0.25,
        color: colors[i % colors.length]
      });
    }

    let time = 0;
    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle upward
        p.y -= p.baseSpeed;
        p.x += Math.sin(time * p.driftSpeed + p.phase) * p.driftAmp;

        // Interactive mouse push
        if (interactive) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRef.current.radius && dist > 0) {
            const force = (1 - dist / mouseRef.current.radius) * 1.8;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // Reset when moving off top
        if (p.y < -20) {
          p.y = height + Math.random() * 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 10;
        if (p.x > width + 20) p.x = -10;

        // Draw soft glowing particle
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (glow) {
          ctx.shadowBlur = p.radius * 6;
          ctx.shadowColor = p.color;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Extra soft outer halo
        if (glow && p.radius > 1.8) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.25;
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Reduced motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      render();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [count, speed, glow, colors, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    />
  );
};

export default RisingParticles;
