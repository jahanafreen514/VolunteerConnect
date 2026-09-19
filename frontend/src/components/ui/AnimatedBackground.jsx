import React from 'react';

const AnimatedBackground = ({ variant = 'default' }) => {
  const baseClasses = variant === 'default' 
    ? "fixed inset-0 -z-10 overflow-hidden pointer-events-none" 
    : "absolute inset-0 -z-10 overflow-hidden pointer-events-none";

  return (
    <div className={baseClasses}>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent-600/20 rounded-full blur-3xl animate-blob" style={{animationDelay: '2s'}} />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-blob" style={{animationDelay: '4s'}} />
    </div>
  );
};

export default AnimatedBackground;
