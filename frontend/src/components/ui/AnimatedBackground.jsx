import React, { useEffect, useRef } from 'react';
import RisingParticles from './RisingParticles';

const AnimatedBackground = ({ variant = 'default', showGrid = true, showParticles = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Only render interactive particle nodes for 'hero' variant
    if (variant !== 'hero' || !canvasRef.current) return;

    const canvas = canvasRef.current;
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

    // Particle nodes count scaled to screen size
    const particleCount = Math.min(Math.floor(width / 30), 50);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: i % 3 === 0 ? 'rgba(99, 102, 241, 0.6)' : i % 3 === 1 ? 'rgba(14, 165, 233, 0.55)' : 'rgba(168, 85, 247, 0.5)'
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect close particles with subtle glowing lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - dist / 140) * 0.22})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // Draw and move particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      animate();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [variant]);

  const containerClass = variant === 'subtle' || variant === 'card'
    ? "absolute inset-0 -z-10 overflow-hidden pointer-events-none"
    : "fixed inset-0 -z-10 overflow-hidden pointer-events-none";

  return (
    <div className={containerClass}>
      {/* Deep dark base background */}
      <div className="absolute inset-0 bg-[#070913]" />

      {/* Floating ambient glow blobs - highlighted and vibrant */}
      <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-primary-600/25 rounded-full blur-[150px] animate-blob" />
      <div 
        className="absolute top-1/4 -right-32 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[150px] animate-blob" 
        style={{ animationDelay: '3s' }} 
      />
      <div 
        className="absolute -bottom-32 left-1/4 w-[550px] h-[550px] bg-purple-600/22 rounded-full blur-[150px] animate-blob" 
        style={{ animationDelay: '6s' }} 
      />
      <div 
        className="absolute top-2/3 -left-20 w-[450px] h-[450px] bg-indigo-500/20 rounded-full blur-[140px] animate-blob" 
        style={{ animationDelay: '4.5s' }} 
      />

      {/* Rising Particles Layer */}
      {showParticles && (
        <RisingParticles count={55} speed={0.75} glow={true} />
      )}

      {/* Subtle Dot Grid pattern */}
      {showGrid && (
        <div 
          className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:24px_24px]" 
        />
      )}

      {/* Interactive Particle Canvas for Hero */}
      {variant === 'hero' && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      )}

      {/* Subtle top ambient radial highlight */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary-950/30 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

export default AnimatedBackground;
