import React from 'react';

const variants = {
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  primary: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
  neutral: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const sizes = {
  sm: 'text-xs px-2.5 py-0.5',
  md: 'text-sm px-3 py-1',
};

const Badge = ({ variant = 'primary', size = 'sm', children, className = '' }) => {
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-medium border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
