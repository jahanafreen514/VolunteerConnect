import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import FoldText from './FoldText';
import RisingParticles from './RisingParticles';

const SplashScreen = ({ onFinish, duration = 5000 }) => {
  const [progress, setProgress] = useState(0);

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
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050816] text-white select-none overflow-hidden"
    >
      {/* Soft Rising Particles Background */}
      <RisingParticles count={70} speed={0.9} glow={true} />

      {/* Floating radial gradient orbs */}
      <div className="absolute w-[650px] h-[650px] bg-primary-600/25 rounded-full blur-[160px] -top-32 -left-32 animate-pulse" />
      <div className="absolute w-[650px] h-[650px] bg-purple-600/25 rounded-full blur-[170px] -bottom-32 -right-32 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute w-[450px] h-[450px] bg-cyan-500/20 rounded-full blur-[140px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Dot Grid */}
      <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:28px_28px]" />

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs tracking-wider uppercase font-semibold text-gray-200 hover:text-white transition-all backdrop-blur-xl shadow-lg"
      >
        <span>Skip</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Center Reveal Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-2xl">
        {/* Animated Glowing Logo Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.1 }}
          className="relative mb-6"
        >
          {/* Pulsing ring aura */}
          <motion.div
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary-500 via-purple-500 to-cyan-400 blur-xl opacity-60"
          />

          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-primary-500 via-indigo-500 to-cyan-400 p-0.5 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full bg-[#050816]/80 backdrop-blur-xl rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-transparent fill-primary-400 stroke-primary-300 filter drop-shadow-[0_0_15px_rgba(99,102,241,0.9)]" />
              </motion.div>
              <Sparkles className="w-4 h-4 text-cyan-300 absolute top-2.5 right-2.5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
        </motion.div>

        {/* WELCOME 3D FoldText Component */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-3"
        >
          <FoldText
            text="WELCOME"
            splitBy="char"
            hinge="top"
            trigger="mount"
            duration={0.65}
            stagger={0.045}
            perspective={700}
            creaseShading={0.55}
            fontSize="clamp(2.4rem, 7vw, 4.8rem)"
            fontWeight={900}
            color="#f7f2e8"
          />
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-2xl sm:text-3xl font-black tracking-tight mb-2 text-gray-200"
        >
          To Volunteer<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-purple-400 to-cyan-400">Connect</span>
        </motion.h1>

        {/* Tagline / Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="text-sm sm:text-base text-gray-300 font-medium tracking-wide mb-8"
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
