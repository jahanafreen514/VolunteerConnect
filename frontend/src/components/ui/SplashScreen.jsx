import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';

const SplashScreen = ({ onFinish, duration = 5000 }) => {
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Canvas animated particles and glowing nodes
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

    // Particle nodes count
    const count = Math.min(Math.floor(width / 25), 55);
    const nodes = [];

    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1,
        color: i % 3 === 0 ? 'rgba(99, 102, 241, 0.65)' : i % 3 === 1 ? 'rgba(14, 165, 233, 0.6)' : 'rgba(168, 85, 247, 0.5)'
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - dist / 150) * 0.25})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = n.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    // 5-second progress ticker
    const intervalMs = 25;
    const step = 100 / (duration / intervalMs);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + step;
      });
    }, intervalMs);

    const completeTimeout = setTimeout(() => {
      sessionStorage.setItem('vc_splash_seen', 'true');
      if (onFinish) onFinish();
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(completeTimeout);
    };
  }, [duration, onFinish]);

  const handleSkip = () => {
    sessionStorage.setItem('vc_splash_seen', 'true');
    if (onFinish) onFinish();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950 text-white select-none overflow-hidden"
    >
      {/* Dynamic Animated Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Floating radial gradient orbs */}
      <div className="absolute w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-[150px] -top-32 -left-32 animate-pulse" />
      <div className="absolute w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[160px] -bottom-32 -right-32 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[130px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Dot Grid */}
      <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:28px_28px]" />

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs tracking-wider uppercase font-semibold text-gray-300 hover:text-white transition-all backdrop-blur-md"
      >
        <span>Skip</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Center Reveal Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg">
        {/* Animated Glowing Logo Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.2 }}
          className="relative mb-8"
        >
          {/* Pulsing ring aura */}
          <motion.div
            animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary-500 via-purple-500 to-cyan-400 blur-xl opacity-50"
          />

          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-cyan-500 p-0.5 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full bg-gray-950/80 backdrop-blur-xl rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Heart className="w-12 h-12 sm:w-14 sm:h-14 text-transparent fill-primary-400 stroke-primary-300 filter drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
              </motion.div>
              <Sparkles className="w-4 h-4 text-cyan-300 absolute top-3 right-3 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-4xl sm:text-5xl font-black tracking-tight mb-3"
        >
          Volunteer<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-purple-400 to-cyan-400">Connect</span>
        </motion.h1>

        {/* Tagline / Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-base sm:text-lg text-gray-300 font-medium tracking-wide mb-10"
        >
          Connect. Volunteer. Make an Impact.
        </motion.p>

        {/* Progress Bar & Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="w-56 sm:w-64 flex flex-col items-center gap-2"
        >
          <div className="w-full h-1.5 bg-gray-800/80 rounded-full overflow-hidden p-0.5 border border-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 via-purple-500 to-cyan-400 rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
          <span className="text-[11px] font-medium tracking-wider text-gray-400 uppercase">
            Launching Platform...
          </span>
        </motion.div>
      </div>

      {/* Footer subtle brand badge */}
      <div className="absolute bottom-6 text-center text-xs text-gray-400 font-medium">
        Empowering Communities Worldwide
      </div>
    </motion.div>
  );
};

export default SplashScreen;
