import React, { useEffect, useRef } from 'react';
import RisingParticles from './RisingParticles';
import { useTheme } from '../../context/ThemeContext';

const AnimatedBackground = ({ showGrid = true, showParticles = true, showNodes = true }) => {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

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

    // Subtle pastel ambient connected nodes
    const particleCount = Math.min(Math.floor(width / 34), 42);
    const particles = [];
    const colors = isDark 
      ? ['rgba(154, 165, 244, 0.45)', 'rgba(123, 183, 239, 0.4)', 'rgba(188, 153, 243, 0.4)', 'rgba(116, 202, 162, 0.4)']
      : ['rgba(154, 165, 244, 0.55)', 'rgba(123, 183, 239, 0.5)', 'rgba(188, 153, 243, 0.5)', 'rgba(116, 202, 162, 0.5)'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1,
        color: colors[i % colors.length]
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Delicate network connection filaments
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 125) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark 
              ? `rgba(154, 165, 244, ${(1 - dist / 125) * 0.14})` 
              : `rgba(154, 165, 244, ${(1 - dist / 125) * 0.12})`;
            ctx.lineWidth = 0.75;
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
        ctx.shadowBlur = 6;
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
  }, [showNodes, isDark]);

  const pastelParticleColors = isDark 
    ? ['#9aa5f4', '#7bb7ef', '#bc99f3', '#74caa2', '#f37a91']
    : ['#bcc4f9', '#a7d2f6', '#d5bef8', '#a0dec0', '#faa5b5'];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none transition-colors duration-500">
      {/* Layer 1: Atmospheric base gradient */}
      <div 
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark 
            ? 'bg-gradient-to-b from-[#0b0f19] via-[#0e1424] to-[#080b12]' 
            : 'bg-gradient-to-b from-[#fbfbfe] via-[#f3f5fc] to-[#eef2f9]'
        }`} 
      />

      {/* Layer 2: Slow moving ambient radial pastel glow orbs */}
      <div 
        className={`absolute -top-32 -left-32 w-[720px] h-[720px] rounded-full blur-[170px] animate-blob transition-all duration-700 ${
          isDark ? 'bg-primary-600/15' : 'bg-primary-200/40'
        }`} 
      />
      <div 
        className={`absolute top-1/4 -right-32 w-[650px] h-[650px] rounded-full blur-[170px] animate-blob transition-all duration-700 ${
          isDark ? 'bg-secondary-600/12' : 'bg-secondary-200/35'
        }`} 
        style={{ animationDelay: '3.5s' }} 
      />
      <div 
        className={`absolute -bottom-32 left-1/4 w-[600px] h-[600px] rounded-full blur-[170px] animate-blob transition-all duration-700 ${
          isDark ? 'bg-purple-600/12' : 'bg-purple-200/35'
        }`} 
        style={{ animationDelay: '7s' }} 
      />
      <div 
        className={`absolute top-2/3 -left-20 w-[500px] h-[500px] rounded-full blur-[160px] animate-blob transition-all duration-700 ${
          isDark ? 'bg-accent-600/12' : 'bg-accent-200/30'
        }`} 
        style={{ animationDelay: '5s' }} 
      />

      {/* Layer 3: Rising Particles field with soft pastel tones */}
      {showParticles && (
        <RisingParticles count={48} speed={0.6} glow={true} colors={pastelParticleColors} />
      )}

      {/* Layer 4: Soft glowing nodes & subtle connection network */}
      {showNodes && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      )}

      {/* Layer 5: Subtle dot matrix */}
      {showGrid && (
        <div 
          className={`absolute inset-0 [background-size:28px_28px] transition-opacity duration-500 ${
            isDark 
              ? 'opacity-[0.08] bg-[radial-gradient(#9aa5f4_1px,transparent_1px)]' 
              : 'opacity-[0.06] bg-[radial-gradient(#64748b_1px,transparent_1px)]'
          }`} 
        />
      )}

      {/* Top subtle ambient pastel glow */}
      <div 
        className={`absolute top-0 inset-x-0 h-80 bg-gradient-to-b pointer-events-none transition-colors duration-500 ${
          isDark ? 'from-primary-600/10 via-transparent to-transparent' : 'from-primary-200/25 via-transparent to-transparent'
        }`} 
      />
    </div>
  );
};

export default AnimatedBackground;
