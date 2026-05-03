"use client";

import React, { useEffect, useState } from 'react';

export default function FloatingCards() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cards = [
    {
      company: "Amazon",
      branch: "CSE",
      role: "SDE",
      difficulty: "Hard",
      diffColor: "bg-red-500",
      upvotes: 45,
      rotate: "-rotate-12",
      translateY: "translate-y-8",
      translateX: "-translate-x-12",
      zIndex: 10,
      delay: "0s",
    },
    {
      company: "Microsoft",
      branch: "IT",
      role: "SWE",
      difficulty: "Medium",
      diffColor: "bg-amber-500",
      upvotes: 38,
      rotate: "-rotate-6",
      translateY: "translate-y-3",
      translateX: "-translate-x-6",
      zIndex: 20,
      delay: "0.5s",
    },
    {
      company: "Google",
      branch: "CSE",
      role: "L3 SWE",
      difficulty: "Hard",
      diffColor: "bg-red-500",
      upvotes: 52,
      rotate: "rotate-0",
      translateY: "translate-y-0",
      translateX: "translate-x-0",
      zIndex: 30,
      delay: "1s",
    },
    {
      company: "Goldman Sachs",
      branch: "ECE",
      role: "Analyst",
      difficulty: "Hard",
      diffColor: "bg-red-500",
      upvotes: 31,
      rotate: "rotate-6",
      translateY: "translate-y-3",
      translateX: "translate-x-6",
      zIndex: 40,
      delay: "1.5s",
    },
    {
      company: "IBM",
      branch: "CSE",
      role: "Backend",
      difficulty: "Easy",
      diffColor: "bg-emerald-500",
      upvotes: 27,
      rotate: "rotate-12",
      translateY: "translate-y-8",
      translateX: "translate-x-12",
      zIndex: 50,
      delay: "2s",
    },
  ];

  if (!mounted) return <div className="w-[320px] h-[400px]" />;

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] flex items-center justify-center mt-10">
      <style>
        {`
          @keyframes mobile-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animate-mobile-float {
            animation: mobile-float 4s ease-in-out infinite;
          }
        `}
      </style>
      <div className="relative w-[280px] sm:w-[320px] h-[120px] sm:h-[150px]">
        {cards.map((card, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 w-full animate-mobile-float"
            style={{ animationDelay: card.delay }}
          >
            <div
              className={`
                bg-white rounded-2xl p-4 shadow-xl border border-black/5 
                transition-all duration-500 origin-bottom cursor-pointer
                ${card.rotate} ${card.translateY} ${card.translateX}
                hover:rotate-0 hover:-translate-y-6 hover:scale-110 hover:z-[60]
              `}
              style={{ zIndex: card.zIndex }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">{card.company}</h3>
                <span className="bg-zinc-600 text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-md">{card.branch}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                <span className="bg-zinc-600 text-white px-2 py-1 rounded-full font-medium">{card.role}</span>
                <span className={`${card.diffColor} text-white px-2 py-1 rounded-full font-medium`}>{card.difficulty}</span>
                <span className="text-zinc-500 font-medium ml-auto sm:ml-1">• {card.upvotes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
