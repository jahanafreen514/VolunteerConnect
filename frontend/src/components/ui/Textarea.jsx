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
      {label && <label className="text-sm font-medium text-gray-200">{label}</label>}
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all resize-y
          ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary-500 focus:ring-primary-500/20'}
          focus:ring-2 ${className}`}
        {...rest}
      />
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
