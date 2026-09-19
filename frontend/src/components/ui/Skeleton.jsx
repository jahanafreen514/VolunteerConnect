import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-white/10 rounded ${className}`} />
  );
};

export const SkeletonCard = () => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full flex flex-col gap-4">
    <Skeleton className="w-full h-40 rounded-xl" />
    <Skeleton className="w-3/4 h-6" />
    <Skeleton className="w-1/2 h-4" />
    <div className="flex gap-2 mt-2">
      <Skeleton className="w-16 h-6 rounded-full" />
      <Skeleton className="w-20 h-6 rounded-full" />
    </div>
    <div className="mt-auto pt-4 flex justify-between items-center border-t border-white/5">
      <Skeleton className="w-24 h-4" />
      <Skeleton className="w-24 h-8 rounded-lg" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="w-full rounded-xl border border-white/10 overflow-hidden bg-white/5">
    <div className="flex gap-4 p-4 border-b border-white/10 bg-white/5">
      <Skeleton className="w-1/4 h-6" />
      <Skeleton className="w-1/4 h-6" />
      <Skeleton className="w-1/4 h-6" />
      <Skeleton className="w-1/4 h-6" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border-b border-white/5 last:border-0">
        <Skeleton className="w-1/4 h-4" />
        <Skeleton className="w-1/4 h-4" />
        <Skeleton className="w-1/4 h-4" />
        <Skeleton className="w-1/4 h-4" />
      </div>
    ))}
  </div>
);

export const SkeletonStatCard = () => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
    <div className="flex justify-between items-start">
      <Skeleton className="w-24 h-4" />
      <Skeleton className="w-10 h-10 rounded-xl" />
    </div>
    <Skeleton className="w-16 h-8" />
    <Skeleton className="w-32 h-4 mt-2" />
  </div>
);
