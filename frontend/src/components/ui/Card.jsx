import React from 'react';

const Card = ({ children, className = '', hover = false, onClick, ...rest }) => {
  const baseStyle = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden";
  const hoverStyle = hover 
    ? "transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 cursor-pointer" 
    : "";

  return (
    <div 
      className={`${baseStyle} ${hoverStyle} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
