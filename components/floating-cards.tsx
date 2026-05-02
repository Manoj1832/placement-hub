import React from 'react';

export default function FloatingCards() {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      {/* Container for the stacked cards */}
      <div className="relative w-[320px] sm:w-[380px] h-[300px]">
        
        {/* Card 1: Zoho */}
        <div className="absolute top-0 left-0 w-full bg-white rounded-2xl p-5 shadow-xl border border-black/5 transform -rotate-3 transition-transform duration-500 hover:rotate-0 hover:-translate-y-2 hover:scale-105 z-10">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Zoho</h3>
            <span className="bg-zinc-600 text-white text-xs font-semibold px-2 py-1 rounded-md">CSE</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-zinc-600 text-white px-2.5 py-1 rounded-full font-medium text-xs">Intern</span>
            <span className="bg-amber-500 text-white px-2.5 py-1 rounded-full font-medium text-xs">Medium</span>
            <span className="text-zinc-500 text-xs font-medium ml-1">• 24 upvotes</span>
          </div>
        </div>

        {/* Card 2: TCS */}
        <div className="absolute top-[80px] left-0 w-full bg-white rounded-2xl p-5 shadow-xl border border-black/5 transform rotate-0 transition-transform duration-500 hover:-translate-y-2 hover:scale-105 z-20">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">TCS</h3>
            <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-md">IT</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-zinc-600 text-white px-2.5 py-1 rounded-full font-medium text-xs">Digital</span>
            <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-full font-medium text-xs">Easy</span>
            <span className="text-zinc-500 text-xs font-medium ml-1">• 18 upvotes</span>
          </div>
        </div>

        {/* Card 3: Amazon */}
        <div className="absolute top-[160px] left-0 w-full bg-white rounded-2xl p-5 shadow-xl border border-black/5 transform rotate-3 transition-transform duration-500 hover:rotate-0 hover:-translate-y-2 hover:scale-105 z-30">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Amazon</h3>
            <span className="bg-zinc-600 text-white text-xs font-semibold px-2 py-1 rounded-md">CSE</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-zinc-600 text-white px-2.5 py-1 rounded-full font-medium text-xs">SDE</span>
            <span className="bg-red-500 text-white px-2.5 py-1 rounded-full font-medium text-xs">Hard</span>
            <span className="text-zinc-500 text-xs font-medium ml-1">• 41 upvotes</span>
          </div>
        </div>

      </div>
    </div>
  );
}
