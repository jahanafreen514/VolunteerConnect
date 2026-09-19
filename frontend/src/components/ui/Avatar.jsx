import React from 'react';

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl'
};

const gradients = [
  'from-pink-500 to-rose-500',
  'from-purple-500 to-indigo-500',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500'
];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getGradient = (name) => {
  if (!name) return gradients[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizeClass = sizes[size];
  
  if (src) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden border border-white/20 shrink-0 ${className}`}>
        <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
      </div>
    );
  }

  const gradientClass = getGradient(name);
  const initials = getInitials(name);

  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shadow-inner bg-gradient-to-br ${gradientClass} border border-white/20 shrink-0 ${className}`}>
      {initials}
    </div>
  );
};

export default Avatar;
