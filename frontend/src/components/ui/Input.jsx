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
      {label && <label className="text-sm font-medium text-gray-200">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all
            ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary-500 focus:ring-primary-500/20'}
            focus:ring-2
            ${Icon ? 'pl-10' : ''}
            ${(RightIcon || isPassword) ? 'pr-10' : ''}
            ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
        {!isPassword && RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            <RightIcon className="h-5 w-5" />
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-400 mt-1">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
