import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/25 border-transparent hover:shadow-primary-500/40',
  secondary: 'bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20',
  outline: 'bg-transparent text-primary-400 border-primary-500/50 hover:bg-primary-500/10 hover:border-primary-500',
  ghost: 'bg-transparent text-gray-300 border-transparent hover:bg-white/10 hover:text-white',
  danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 border-transparent hover:shadow-red-500/40'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
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
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 border outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95';
  
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-5 h-5 mr-2" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-5 h-5 ml-2" />}
    </button>
  );
};

export default Button;
