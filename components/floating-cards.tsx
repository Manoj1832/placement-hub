import React from 'react';

export default function FloatingCards() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {/* Container for the stacked cards */}
      <div className="relative w-[320px] sm:w-[380px] h-[400px]">
        
        {/* Card 1: Amazon */}
        <div className="absolute top-0 left-0 w-full bg-white rounded-2xl p-4 shadow-xl border border-black/5 transform -rotate-3 transition-transform duration-500 hover:rotate-0 hover:-translate-y-2 hover:scale-105 z-10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Amazon</h3>
            <span className="bg-zinc-600 text-white text-xs font-semibold px-2 py-1 rounded-md">CSE</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-zinc-600 text-white px-2 py-1 rounded-full font-medium">SDE</span>
            <span className="bg-red-500 text-white px-2 py-1 rounded-full font-medium">Hard</span>
            <span className="text-zinc-500 font-medium ml-1">• 45 upvotes</span>
          </div>
        </div>

        {/* Card 2: Microsoft */}
        <div className="absolute top-[65px] left-0 w-full bg-white rounded-2xl p-4 shadow-xl border border-black/5 transform rotate-2 transition-transform duration-500 hover:rotate-0 hover:-translate-y-2 hover:scale-105 z-20">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Microsoft</h3>
            <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-md">IT</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-zinc-600 text-white px-2 py-1 rounded-full font-medium">SWE</span>
            <span className="bg-amber-500 text-white px-2 py-1 rounded-full font-medium">Medium</span>
            <span className="text-zinc-500 font-medium ml-1">• 38 upvotes</span>
          </div>
        </div>

        {/* Card 3: Google */}
        <div className="absolute top-[130px] left-0 w-full bg-white rounded-2xl p-4 shadow-xl border border-black/5 transform -rotate-2 transition-transform duration-500 hover:rotate-0 hover:-translate-y-2 hover:scale-105 z-30">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Google</h3>
            <span className="bg-zinc-600 text-white text-xs font-semibold px-2 py-1 rounded-md">CSE</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-zinc-600 text-white px-2 py-1 rounded-full font-medium">L3 SWE</span>
            <span className="bg-red-500 text-white px-2 py-1 rounded-full font-medium">Hard</span>
            <span className="text-zinc-500 font-medium ml-1">• 52 upvotes</span>
          </div>
        </div>

        {/* Card 4: Goldman Sachs */}
        <div className="absolute top-[195px] left-0 w-full bg-white rounded-2xl p-4 shadow-xl border border-black/5 transform rotate-3 transition-transform duration-500 hover:rotate-0 hover:-translate-y-2 hover:scale-105 z-40">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Goldman Sachs</h3>
            <span className="bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-md">ECE</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-zinc-600 text-white px-2 py-1 rounded-full font-medium">Analyst</span>
            <span className="bg-red-500 text-white px-2 py-1 rounded-full font-medium">Hard</span>
            <span className="text-zinc-500 font-medium ml-1">• 31 upvotes</span>
          </div>
        </div>

        {/* Card 5: IBM */}
        <div className="absolute top-[260px] left-0 w-full bg-white rounded-2xl p-4 shadow-xl border border-black/5 transform -rotate-1 transition-transform duration-500 hover:rotate-0 hover:-translate-y-2 hover:scale-105 z-50">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight">IBM</h3>
            <span className="bg-zinc-600 text-white text-xs font-semibold px-2 py-1 rounded-md">CSE</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-zinc-600 text-white px-2 py-1 rounded-full font-medium">Backend</span>
            <span className="bg-emerald-500 text-white px-2 py-1 rounded-full font-medium">Easy</span>
            <span className="text-zinc-500 font-medium ml-1">• 27 upvotes</span>
          </div>
        </div>

      </div>
    </div>
  );
}
