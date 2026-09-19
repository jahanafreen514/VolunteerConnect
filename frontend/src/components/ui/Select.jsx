import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select an option',
  className = '',
  ...rest
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-200">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={`w-full appearance-none bg-white/5 border rounded-xl px-4 py-3 text-white outline-none transition-all
            ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary-500 focus:ring-primary-500/20'}
            focus:ring-2 pr-10 ${className}`}
          {...rest}
        >
          {placeholder && <option value="" disabled className="bg-gray-800 text-gray-400">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-gray-800 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
