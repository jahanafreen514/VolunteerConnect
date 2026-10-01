import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  // Pastel Sage Primary CTA
  primary: 'bg-[#AFCDB5] text-[#26372B] border border-[#9ec2a5] hover:bg-[#9ec2a5] shadow-soft-sm hover:shadow-pastel-sage hover:-translate-y-0.5',
  // White/Warm Cream Secondary CTA
  secondary: 'bg-white/90 text-[#354052] border border-[#E6E8EC] hover:bg-[#FFF8EF] hover:border-[#d0d5dd] shadow-soft-sm hover:-translate-y-0.5',
  // Clean Outline Button
  outline: 'bg-transparent text-[#354052] border border-[#E6E8EC] hover:bg-white/70 hover:border-[#BFD8C2] hover:text-[#26372B]',
  // Subtle Ghost Button
  ghost: 'bg-transparent text-[#667085] border-transparent hover:bg-black/[0.04] hover:text-[#354052]',
  // Soft Rose Danger Button (replacing harsh neon red)
  danger: 'bg-[#F2D6DD] text-[#8C3B4A] border border-[#e6b5c1] hover:bg-[#ebd0d7] shadow-soft-sm hover:-translate-y-0.5',
  // Soft Powder Blue Accent Button
  powder: 'bg-[#C9DDF2] text-[#24426b] border border-[#b2d0ee] hover:bg-[#b9d5f0] shadow-soft-sm hover:-translate-y-0.5'
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-2xl'
};

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  children,
  type = 'button',
  onClick,
  ...rest
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-[#BFD8C2]/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none';
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 mr-2 shrink-0" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 ml-2 shrink-0" />}
    </button>
  );
};

export default Button;
