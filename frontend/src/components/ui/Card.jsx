import React from 'react';

/**
 * Universal Card component conforming to Requirement 14:
 * - background: rgba(255, 255, 255, 0.85)
 * - border: 1px solid rgba(230, 232, 236, 0.85)
 * - border-radius: 20px (rounded-2xl)
 * - box-shadow: 0 8px 30px rgba(80, 90, 100, 0.08)
 * - on hover: translateY(-4px), softer shadow elevation
 */
const Card = ({ children, className = '', hover = false, onClick, ...rest }) => {
  const baseStyle = "bg-white/85 backdrop-blur-xl border border-[#E6E8EC]/90 rounded-2xl shadow-soft-md transition-all duration-250 text-[#354052]";
  const hoverStyle = hover 
    ? "hover:-translate-y-1 hover:shadow-soft-hover hover:border-[#BFD8C2]/80 cursor-pointer" 
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
