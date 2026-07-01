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
  const stats = useQuery(api.experiences.getStats);

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-300 overflow-hidden font-sans selection:bg-zinc-800 selection:text-white">
      <Header />

      <main>
        {/* 1. Hero Section */}
        <section className="max-w-screen-xl mx-auto px-6 py-20 md:py-28 relative">
          {/* Subtle ambient light dot in the background */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                Unlock Your Placement Potential
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight leading-[1.1]">
                Crack Your Dream Company with Real Interview Insights
              </h1>
              <p className="text-base md:text-lg text-zinc-400 mb-8 max-w-lg leading-relaxed">
                Explore real interview experiences, role insights, and preparation roadmaps shared by your peers at PSG College.
              </p>
              <div className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link href="/browse">
                  <button className="text-sm font-bold bg-[#F97316] hover:bg-[#EA580C] text-black px-6 py-3 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-orange-950/10">
                    Start Exploring
                    <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
                  </button>
                </Link>
                <Link href="/resume-tips">
                  <button className="text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 px-5 py-3 rounded-lg transition-colors flex items-center gap-2 cursor-pointer">
                    <FileText className="w-4 h-4 text-zinc-500" />
                    Resume & Vault
                  </button>
                </Link>
                <Link href="/roadmap">
                  <button className="text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 px-5 py-3 rounded-lg transition-colors flex items-center gap-2 cursor-pointer">
                    <Map className="w-4 h-4 text-zinc-500" />
                    Roadmaps
                  </button>
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-1/2 relative h-[350px] md:h-[400px] flex items-center justify-center">
              <FloatingCards />
            </div>
          </div>
        </section>

        {/* 2. Trust / Company Logos */}
        <section className="py-10 md:py-14 border-y border-zinc-900">
          <div className="max-w-screen-xl mx-auto px-6">
            <p className="text-center text-[10px] md:text-xs font-bold text-zinc-500 mb-8 tracking-widest uppercase">Trusted by students placed at</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center max-w-4xl mx-auto">
              {[
                { src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", alt: "Google" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", alt: "Amazon" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", alt: "Microsoft" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg", alt: "Meta" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg", alt: "IBM" },
              ].map((logo) => (
                <img
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  className="h-5 md:h-6 object-contain opacity-25 hover:opacity-75 transition-opacity duration-200 grayscale invert hover:grayscale-0 hover:invert-0 cursor-pointer"
                />
              ))}
            </div>
          </div>
        </section>

        {/* 3. Social Proof Stats */}
        <section className="py-12 md:py-16 border-b border-zinc-900">
          <div className="max-w-screen-xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-center justify-items-center max-w-3xl mx-auto">
              {[
                { label: "companies", value: stats ? `${stats.totalCompanies}+` : "—", icon: Users },
                { label: "experiences", value: stats ? `${stats.totalExperiences}+` : "—", icon: Briefcase },
                { label: "free to read", value: stats ? `${stats.freeExperiences}` : "—", icon: Star }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center cursor-default">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className="w-5 h-5 text-zinc-650" />
                    <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">{stat.value}</h3>
                  </div>
                  <p className="text-zinc-500 font-semibold tracking-wider uppercase text-[10px]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Featured Experiences */}
        <section className="py-16 md:py-24 max-w-screen-xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1 tracking-tight">Featured Experiences</h2>
              <p className="text-zinc-500 text-sm">Recently shared placement insights from your peers.</p>
            </div>
            <Link href="/browse" className="text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg border border-zinc-800 transition-colors flex items-center gap-2 group cursor-pointer">
              View All
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentExperiences === undefined ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 animate-pulse">
                  <div className="h-4 bg-zinc-800 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2 mb-6" />
                  <div className="h-3 bg-zinc-800 rounded w-full mb-2" />
                  <div className="h-3 bg-zinc-800 rounded w-4/5" />
                </div>
              ))
            ) : recentExperiences.length === 0 ? (
              <div className="col-span-full text-center py-16 border border-dashed border-zinc-800 rounded-xl">
                <Briefcase className="w-10 h-10 text-zinc-650 mx-auto mb-4" />
                <p className="text-zinc-400 text-base mb-1 font-medium">No experiences shared yet</p>
                <p className="text-zinc-600 text-xs mb-6">Be the first to share your placement journey!</p>
                <Link href="/submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-black rounded-lg font-bold text-sm transition-colors">
                  Share Your Experience
                  <ArrowRight className="w-3.5 h-3.5 text-black stroke-[3]" />
                </Link>
              </div>
            ) : (
              recentExperiences.map((exp: any) => (
                <ExperienceCard key={exp._id} experience={exp} />
              ))
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-zinc-950/40 pt-12 pb-8 border-t border-zinc-900">
          <div className="max-w-screen-xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 rounded-full h-2 bg-[#F97316]" />
                <span className="text-base font-bold text-white tracking-tight">psg.hub</span>
              </div>
              <div className="flex gap-6 text-xs font-semibold text-zinc-500">
                <Link href="/guidelines" className="hover:text-white transition-colors">Guidelines</Link>
                <Link href="/browse" className="hover:text-white transition-colors">Browse</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              </div>
            </div>
            <div className="text-center md:text-left text-xs text-zinc-500 border-t border-zinc-900 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <p>© 2026 PSG Placement Hub. Built for PSG College students.</p>
              <p className="flex items-center gap-1">Made with <Heart className="w-3 h-3 text-zinc-600" /> for the community</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}