import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  rightIcon: RightIcon,
  type = 'text',
  className = '',
  ...rest
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-xs sm:text-sm font-semibold text-[#354052]">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={`w-full bg-white/95 border rounded-xl px-4 py-2.5 sm:py-3 text-sm text-[#354052] placeholder-[#98A2B3] outline-none transition-all duration-200 shadow-soft-sm
            ${error ? 'border-[#F2D6DD] focus:border-[#d48ea0] focus:ring-2 focus:ring-[#F2D6DD]/40' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'}
            ${Icon ? 'pl-10' : ''}
            ${(RightIcon || isPassword) ? 'pr-10' : ''}
            ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#667085] hover:text-[#354052] transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        {!isPassword && RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#667085]">
            <RightIcon className="h-4 w-4" />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-[#8C3B4A] mt-0.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#667085] mt-0.5">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
