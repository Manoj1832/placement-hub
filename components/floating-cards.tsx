"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FloatingCards() {
  const router = useRouter();
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
      diffColor: "bg-red-50 text-red-600 border border-red-100",
      upvotes: 45,
      top: "top-0",
      rotate: "rotate-[-2deg]",
      zIndex: 50,
      delay: "0s",
    },
    {
      company: "Microsoft",
      branch: "IT",
      role: "SWE",
      difficulty: "Medium",
      diffColor: "bg-amber-50 text-amber-600 border border-amber-100",
      upvotes: 38,
      top: "top-[60px]",
      rotate: "rotate-[3deg]",
      zIndex: 40,
      delay: "0.5s",
    },
    {
      company: "Google",
      branch: "CSE",
      role: "L3 SWE",
      difficulty: "Hard",
      diffColor: "bg-red-50 text-red-600 border border-red-100",
      upvotes: 52,
      top: "top-[120px]",
      rotate: "rotate-[-1deg]",
      zIndex: 30,
      delay: "1s",
    },
    {
      company: "Goldman Sachs",
      branch: "ECE",
      role: "Analyst",
      difficulty: "Hard",
      diffColor: "bg-red-50 text-red-600 border border-red-100",
      upvotes: 31,
      top: "top-[180px]",
      rotate: "rotate-[2deg]",
      zIndex: 20,
      delay: "1.5s",
    },
    {
      company: "IBM",
      branch: "CSE",
      role: "Backend",
      difficulty: "Easy",
      diffColor: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      upvotes: 27,
      top: "top-[240px]",
      rotate: "rotate-[0deg]",
      zIndex: 10,
      delay: "2s",
    },
  ];

  if (!mounted) return <div className="w-[320px] h-[360px]" />;

  return (
    <div className="relative w-full h-[360px] sm:h-[400px] flex justify-center">
      <style>
        {`
          @keyframes gentle-bob {
            0%, 100% { transform: translateY(0px) rotate(var(--base-rot)); }
            50% { transform: translateY(-8px) rotate(calc(var(--base-rot) + 1deg)); }
          }
          .animate-gentle-bob {
            animation: gentle-bob 4s ease-in-out infinite;
          }
        `}
      </style>
      
      <div className="relative w-[280px] sm:w-[320px] h-full mt-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`absolute left-0 w-full animate-gentle-bob ${card.top}`}
            style={{ 
              animationDelay: card.delay,
              zIndex: card.zIndex,
              ["--base-rot" as any]: card.rotate.replace("rotate-[", "").replace("]", "")
            }}
          >
            <div
              onClick={() => router.push('/browse')}
              className="bg-white rounded-xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-neutral-200 transition-all duration-300 cursor-pointer hover:-translate-y-3 hover:shadow-md hover:z-[60]"
            >
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">{card.company}</h3>
                <span className="bg-neutral-100 text-neutral-500 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded border border-neutral-200">{card.branch}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                <span className="bg-neutral-50 text-neutral-600 border border-neutral-200 px-2 py-0.5 rounded-full font-medium">{card.role}</span>
                <span className={`${card.diffColor} px-2 py-0.5 rounded-full font-medium`}>{card.difficulty}</span>
                <span className="text-neutral-400 font-medium ml-auto">▲ {card.upvotes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
