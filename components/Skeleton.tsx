
import React from 'react';

export const CardSkeleton = () => (
  <div className="flex-none w-44 md:w-72 aspect-[2/3] relative rounded-[2.5rem] overflow-hidden bg-zinc-900">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
  </div>
);

export const HeroSkeleton = () => (
  <div className="w-full h-[92vh] bg-[#050505] relative overflow-hidden">
    <div className="absolute inset-0 bg-zinc-900 animate-pulse"></div>
    <div className="absolute bottom-[20%] left-6 md:left-16 space-y-6 w-full max-w-2xl">
      <div className="h-4 w-32 bg-zinc-800 rounded-full"></div>
      <div className="h-24 w-3/4 bg-zinc-800 rounded-3xl"></div>
      <div className="h-20 w-full bg-zinc-800 rounded-3xl"></div>
      <div className="flex gap-4">
        <div className="h-16 w-40 bg-zinc-800 rounded-2xl"></div>
        <div className="h-16 w-40 bg-zinc-800 rounded-2xl"></div>
      </div>
    </div>
  </div>
);
