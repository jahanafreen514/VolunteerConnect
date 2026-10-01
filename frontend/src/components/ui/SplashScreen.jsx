import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowRight, ShieldCheck, Users } from 'lucide-react';
import RisingParticles from './RisingParticles';

const SplashScreen = ({ onFinish, duration = 4000 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(6px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF8F5] text-slate-800 select-none overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFF8EF 0%, #F5F1FA 50%, #EEF7F3 100%)'
      }}
    >
      {/* Floating ambient pastel dots */}
      <RisingParticles count={30} speed={0.3} />

      {/* Floating blurred pastel atmosphere */}
      <div className="absolute w-[500px] h-[500px] bg-[#DDD5F3]/30 rounded-full blur-[140px] -top-24 -left-24" />
      <div className="absolute w-[500px] h-[500px] bg-[#D8EEE5]/35 rounded-full blur-[140px] -bottom-24 -right-24" />
      <div className="absolute w-[400px] h-[400px] bg-[#F6D8C5]/25 rounded-full blur-[130px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-[#E6E8EC] text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all shadow-soft-sm backdrop-blur-md"
      >
        <span>Skip</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Center Welcome Card */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Soft Pastel Logo Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-white/90 border border-[#E6E8EC] shadow-soft-md flex items-center justify-center p-4 relative backdrop-blur-xl">
            <Heart className="w-10 h-10 text-[#556e5a] fill-[#BFD8C2]" />
            <Sparkles className="w-4 h-4 text-[#7faadc] absolute top-2 right-2 animate-pulse" />
          </div>
        </motion.div>

        {/* Small badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#E6E8EC] text-xs font-medium text-slate-600 mb-3 shadow-soft-sm"
        >
          <span>Connecting People With Purpose</span>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-3xl sm:text-4xl font-extrabold text-[#26372B] tracking-tight mb-2"
        >
          Volunteer<span className="text-[#556e5a]">Connect</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-sm sm:text-base text-[#667085] font-normal mb-8 max-w-sm"
        >
          Discover meaningful causes, collaborate with verified NGOs, and make a real difference.
        </motion.p>

        {/* Progress Bar & Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="w-56 sm:w-64 flex flex-col items-center gap-2.5"
        >
          <div className="w-full h-1.5 bg-[#E6E8EC] rounded-full overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-[#BFD8C2] to-[#AFCDB5] rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
          <span className="text-[11px] font-medium tracking-wider text-[#667085] uppercase">
            Loading Experience...
          </span>
        </motion.div>
      </div>

      {/* Footer text */}
      <div className="absolute bottom-6 text-center text-xs text-[#667085] font-medium">
        Empowering Communities Worldwide
      </div>
    </motion.div>
  );
};

export default SplashScreen;
