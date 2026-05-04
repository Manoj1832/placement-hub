"use client";

import { BookOpen, Target, TrendingUp } from "lucide-react";
import Header from "@/components/header";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#2E1065] text-white overflow-hidden selection:bg-[#22C55E] selection:text-black font-sans flex flex-col">
      <Header />

      {/* Background blobs / Glassmorphism */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#4C1D95] opacity-50 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[60%] h-[60%] rounded-full bg-[#3B0764] opacity-50 blur-[120px]" />
      </div>

      <main className="flex-1 relative z-10 py-12 md:py-20 flex items-center justify-center">
        <section className="w-full">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">How It Works</h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                Your journey to cracking the perfect placement starts here. Follow these simple steps to learn, prepare, and succeed.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 max-w-5xl mx-auto">
              {[
                { title: "Browse Experiences", desc: "Filter by company, role, or difficulty to find exact interview patterns.", icon: BookOpen },
                { title: "Learn Patterns", desc: "Understand core concepts and technical rounds directly from successful candidates.", icon: TrendingUp },
                { title: "Crack Interviews", desc: "Apply your knowledge and ace your upcoming technical and HR rounds.", icon: Target }
              ].map((step, i) => (
                <div key={i} className="group bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-[#22C55E]/50 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden flex flex-col items-start h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/10 rounded-full blur-3xl group-hover:bg-[#22C55E]/20 transition-all duration-500" />
                  <div className="text-[#22C55E] text-5xl font-black opacity-20 absolute top-4 right-6">0{i+1}</div>
                  <div className="w-14 h-14 bg-[#4C1D95] rounded-xl flex items-center justify-center mb-6 shadow-lg border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-7 h-7 text-[#22C55E]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-white/70 leading-relaxed text-lg">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
