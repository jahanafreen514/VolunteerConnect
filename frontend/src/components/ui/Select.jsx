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
      {label && <label className="text-xs sm:text-sm font-semibold text-[#354052]">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={`w-full appearance-none bg-white/95 border rounded-xl px-4 py-2.5 sm:py-3 text-sm text-[#354052] outline-none transition-all duration-200 shadow-soft-sm
            ${error ? 'border-[#F2D6DD] focus:border-[#d48ea0] focus:ring-2 focus:ring-[#F2D6DD]/40' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'}
            pr-10 ${className}`}
          {...rest}
        >
          {placeholder && <option value="" disabled className="text-[#98A2B3] bg-white">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-[#354052]">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#667085]">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && <p className="text-xs text-[#8C3B4A] mt-0.5">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
