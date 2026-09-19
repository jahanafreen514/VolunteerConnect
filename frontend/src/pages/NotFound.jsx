import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6 text-center bg-transparent">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full glass-card p-8 md:p-12 border border-white/10 shadow-glass text-center"
      >
        <motion.h1 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-400 via-secondary-400 to-accent-400 mb-4 tracking-tighter"
        >
          404
        </motion.h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Page Not Found</h2>
        
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          The link you followed may be broken or the page may have been moved. Let's get you back on track to making an impact.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-8 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium btn-glow transition-all group text-sm"
        >
          <Home className="w-4 h-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
          <span>Back to Homepage</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
