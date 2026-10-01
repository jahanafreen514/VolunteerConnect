import React from 'react';

const variants = {
  success: 'bg-[#D8EEE5] text-[#244e44] border-[#bce1d3]',
  warning: 'bg-[#F6D8C5] text-[#7a4221] border-[#eebd9e]',
  error: 'bg-[#F2D6DD] text-[#8C3B4A] border-[#e6b5c1]',
  info: 'bg-[#C9DDF2] text-[#24426b] border-[#a3c5eb]',
  primary: 'bg-[#BFD8C2] text-[#26372B] border-[#AFCDB5]',
  neutral: 'bg-white/80 text-[#354052] border-[#E6E8EC]',
  purple: 'bg-[#DDD5F3] text-[#4d387a] border-[#c5b8eb]',
  lavender: 'bg-[#DDD5F3] text-[#4d387a] border-[#c5b8eb]',
  sage: 'bg-[#BFD8C2] text-[#26372B] border-[#AFCDB5]',
  mint: 'bg-[#D8EEE5] text-[#244e44] border-[#bce1d3]',
  peach: 'bg-[#F6D8C5] text-[#7a4221] border-[#eebd9e]',
  blush: 'bg-[#F2D6DD] text-[#8C3B4A] border-[#e6b5c1]',
};

const sizes = {
  sm: 'text-xs px-2.5 py-0.5',
  md: 'text-sm px-3 py-1',
};

const Badge = ({ variant = 'primary', size = 'sm', children, className = '' }) => {
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-medium border ${variants[variant] || variants.primary} ${sizes[size] || sizes.sm} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
