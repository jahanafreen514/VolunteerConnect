import React, { forwardRef } from 'react';

const Textarea = forwardRef(({
  label,
  error,
  rows = 4,
  className = '',
  ...rest
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-xs sm:text-sm font-semibold text-[#354052]">{label}</label>}
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full bg-white/95 border rounded-xl px-4 py-2.5 sm:py-3 text-sm text-[#354052] placeholder-[#98A2B3] outline-none transition-all duration-200 resize-y shadow-soft-sm
          ${error ? 'border-[#F2D6DD] focus:border-[#d48ea0] focus:ring-2 focus:ring-[#F2D6DD]/40' : 'border-[#E6E8EC] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40'}
          ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-[#8C3B4A] mt-0.5">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
