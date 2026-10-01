import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6 text-center bg-transparent">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-md w-full pastel-card p-8 md:p-12 border border-[#E6E8EC] shadow-soft-md text-center rounded-3xl"
      >
        <motion.h1 
          initial={{ y: -15 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="text-6xl md:text-8xl font-black text-[#5b7f63] mb-4 tracking-tighter"
        >
          404
        </motion.h1>
        
        <h2 className="text-2xl font-bold text-[#354052] mb-3">Page Not Found</h2>
        
        <p className="text-[#667085] text-sm mb-8 leading-relaxed">
          The link you followed may be broken or the page may have been moved. Let's get you back on track to making an impact.
        </p>
        
        <Link 
          to="/" 
          className="btn-primary-pastel inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold shadow-soft-sm text-sm"
        >
          <Home className="w-4 h-4 mr-2" />
          <span>Back to Homepage</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
