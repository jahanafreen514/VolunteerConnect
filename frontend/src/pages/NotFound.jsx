import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden p-6 text-center">
      <AnimatedBackground />
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full bg-gray-900/80 p-8 md:p-12 rounded-3xl border border-gray-800 shadow-2xl backdrop-blur-md"
      >
        <motion.h1 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-500 to-accent-500 mb-4 tracking-tighter"
        >
          404
        </motion.h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Oops! Page not found</h2>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20 group"
        >
          <Home className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform" />
          Go to Homepage
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
