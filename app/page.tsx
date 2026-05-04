"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { ArrowRight, FileText, Map, Sparkles, BookOpen, Target, TrendingUp, ChevronRight, PlayCircle, Star, Users, Briefcase, Heart } from "lucide-react";
import ExperienceCard from "@/components/experience-card";
import FloatingCards from "@/components/floating-cards";
import Header from "@/components/header";

export default function HomePage() {
  const recentExperiences = useQuery(api.experiences.getRecent, { limit: 3 });

  return (
    <div className="min-h-screen bg-[#2E1065] text-white overflow-hidden selection:bg-[#22C55E] selection:text-black font-sans">
      <Header />

      {/* Background blobs / Glassmorphism */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#4C1D95] opacity-50 blur-[100px]" />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#3B0764] opacity-50 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-[#1E1B4B] opacity-80 blur-[80px]" />
      </div>

      <main className="relative z-10">
        {/* 1. Hero Section */}
        <section className="max-w-screen-xl mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-10 lg:gap-20">
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium mb-6 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-[#22C55E]" />
                Unlock Your Placement Potential
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Crack Your Dream Company with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-[#4ADE80]">Real Interview Insights</span> 🚀
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-white/70 mb-8 max-w-lg font-light leading-relaxed">
                Explore real interview experiences, role insights, and preparation strategies.
              </p>
              <div className="flex flex-row flex-nowrap items-center justify-center md:justify-start gap-2 md:gap-4 mt-4 w-full overflow-hidden">
                <Link href="/browse" className="flex-1 md:flex-none">
                  <button className="w-full text-[11px] sm:text-xs md:text-sm font-semibold bg-[#22C55E] text-black px-2 py-2 sm:px-3 md:px-4 md:py-2 rounded-xl hover:bg-[#4ADE80] transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap">
                    Start Exploring
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                  </button>
                </Link>
                <Link href="/resume-tips" className="flex-1 md:flex-none">
                  <button className="w-full text-[11px] sm:text-xs md:text-sm font-semibold bg-white/10 backdrop-blur-md text-white border border-white/20 px-2 py-2 sm:px-3 md:px-4 md:py-2 rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap">
                    <FileText className="w-3 h-3 md:w-4 md:h-4 text-[#22C55E] shrink-0" />
                    custResume
                  </button>
                </Link>
                <Link href="/roadmap" className="flex-1 md:flex-none">
                  <button className="w-full text-[11px] sm:text-xs md:text-sm font-semibold bg-white/10 backdrop-blur-md text-white border border-white/20 px-2 py-2 sm:px-3 md:px-4 md:py-2 rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap">
                    <Map className="w-3 h-3 md:w-4 md:h-4 text-[#22C55E] shrink-0" />
                    Roadmap
                  </button>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative h-[350px] md:h-[450px] flex items-center justify-center animate-in fade-in zoom-in duration-1000">
              <FloatingCards />
            </div>
          </div>
        </section>

        {/* 2. Trust / Company Logos */}
        <section className="py-12 md:py-20 border-y border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="max-w-screen-xl mx-auto px-4">
            <p className="text-center text-sm font-medium text-white/50 mb-6 tracking-widest uppercase">Trusted by students placed at</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center max-w-4xl mx-auto">
              {[
                { src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", alt: "Google", h: "h-6 md:h-8" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", alt: "Amazon", h: "h-7 md:h-9" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", alt: "Microsoft", h: "h-6 md:h-8" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg", alt: "Meta", h: "h-4 md:h-5" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg", alt: "IBM", h: "h-8 md:h-10" },
              ].map((logo, i) => (
                <img
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  className={`w-full h-auto max-h-10 object-contain cursor-pointer animate-logo-blink`}
                  style={{ animationDelay: `${i * 0.8}s` }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 3. Social Proof Stats */}
        <section className="py-12 md:py-20 border-b border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-center justify-items-center max-w-4xl mx-auto">
              {[
                { label: "students", value: "450+", icon: Users },
                { label: "experiences", value: "70+", icon: Briefcase },
                { label: "rating", value: "4.8⭐", icon: Star }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center cursor-default animate-text-blink" style={{ animationDelay: `${i * 0.8 + 0.4}s` }}>
                  <div className="flex items-center gap-3 mb-2 text-[#22C55E]">
                    <stat.icon className="w-8 h-8" />
                    <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">{stat.value}</h3>
                  </div>
                  <p className="text-white/60 font-medium tracking-widest uppercase text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* 5. Featured Experiences */}
        <section className="py-12 md:py-20">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6 md:gap-10">
              <div>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2">Featured Experiences</h2>
                <p className="text-white/60">Recently shared insights from your peers.</p>
              </div>
              <Link href="/browse" className="text-sm font-semibold bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg border border-white/10 transition-all flex items-center gap-2 group w-full sm:w-auto text-center justify-center">
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {recentExperiences?.map((exp: any) => (
                <ExperienceCard key={exp._id} experience={exp} />
              ))}
            </div>
          </div>
        </section>



        {/* 7. Footer */}
        <footer className="bg-black/60 pt-16 pb-8 border-t border-white/10">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-md relative flex items-center justify-center shadow-lg shadow-[#22C55E]/20">
                  <div className="w-4 h-4 bg-[#22C55E] absolute -right-1 -top-1 rounded-sm" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">psg.hub</span>
              </div>
              <div className="flex gap-6 text-sm font-medium text-white/60">
                <Link href="/guidelines" className="hover:text-[#22C55E] transition-colors">Guidelines</Link>
                <Link href="/browse" className="hover:text-[#22C55E] transition-colors">Browse</Link>
                <Link href="/privacy" className="hover:text-[#22C55E] transition-colors">Privacy</Link>
              </div>
            </div>
            <div className="text-center md:text-left text-sm text-white/40 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p>© 2026 PSG Placement Hub. Built for PSG College students.</p>
              <p className="flex items-center gap-1">Made with <Heart className="w-4 h-4 text-red-500" /> for the community</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}