import React, { useEffect, useRef } from 'react';
import RisingParticles from './RisingParticles';

const AnimatedBackground = ({ showGrid = true, showParticles = true, showNodes = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!showNodes || !canvasRef.current) return;

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

    // Subtle ambient connected nodes
    const particleCount = Math.min(Math.floor(width / 32), 48);
    const particles = [];
    const colors = ['rgba(99, 102, 241, 0.6)', 'rgba(56, 189, 248, 0.55)', 'rgba(168, 85, 247, 0.5)', 'rgba(45, 212, 191, 0.5)'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1,
        color: colors[i % colors.length]
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle network connection filaments
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - dist / 130) * 0.18})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw and move nodes
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
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      animate();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [showNodes]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Layer 1: Deep navy / indigo atmospheric base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050816] via-[#070d28] to-[#030614]" />

      {/* Layer 2: Slow moving ambient radial glow orbs */}
      <div 
        className="absolute -top-32 -left-32 w-[720px] h-[720px] bg-primary-600/22 rounded-full blur-[160px] animate-blob" 
      />
      <div 
        className="absolute top-1/4 -right-32 w-[650px] h-[650px] bg-cyan-500/20 rounded-full blur-[160px] animate-blob" 
        style={{ animationDelay: '3.5s' }} 
      />
      <div 
        className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] bg-purple-600/22 rounded-full blur-[160px] animate-blob" 
        style={{ animationDelay: '7s' }} 
      />
      <div 
        className="absolute top-2/3 -left-20 w-[500px] h-[500px] bg-teal-500/18 rounded-full blur-[150px] animate-blob" 
        style={{ animationDelay: '5s' }} 
      />

      {/* Layer 3: Rising Particles field */}
      {showParticles && (
        <RisingParticles count={55} speed={0.7} glow={true} />
      )}

      {/* Layer 4: Soft glowing nodes & subtle connection network */}
      {showNodes && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      )}

      {/* Layer 5: Subtle dot matrix & cyan/violet ambient highlights */}
      {showGrid && (
        <div 
          className="absolute inset-0 opacity-[0.14] bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:26px_26px]" 
        />
      )}

      {/* Top subtle ambient glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary-600/10 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

export default AnimatedBackground;
