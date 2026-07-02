"use client";

import { useState, useEffect } from "react";
import { 
  Flame, Trophy, Target, TrendingUp, Star, Zap, Award, 
  Clock, Sparkles, ChevronRight, BookOpen, Code2, Briefcase
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";

export default function ProgressDashboardPage() {
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/user/sync")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-700" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-zinc-500" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Sign In Required</h2>
          <p className="text-zinc-550 text-sm mb-4">Sign in to track your progress</p>
          <Link href="/sign-in" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-black px-4 py-2 rounded-lg text-sm font-extrabold transition-colors">
            Sign In <ChevronRight className="w-4 h-4 text-black stroke-[3]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B]">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-1 tracking-tight">Your Progress</h1>
          <p className="text-zinc-500 text-sm">Track your placement prep journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0F0F11]/60 border border-zinc-900 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-[#F97316]" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide">Level</p>
                <p className="text-xl font-bold text-white">—</p>
              </div>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#F97316] rounded-full transition-all" style={{ width: '0%' }} />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Start exploring to earn XP</p>
          </div>

          <div className="bg-[#0F0F11]/60 border border-zinc-900 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4 text-[#F97316] fill-[#F97316]/25" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide">Streak</p>
                <p className="text-xl font-bold text-white">—</p>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500">Stay consistent to build streaks</p>
          </div>

          <div className="bg-[#0F0F11]/60 border border-zinc-900 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide">Total XP</p>
                <p className="text-xl font-bold text-white">—</p>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500">Lifetime points</p>
          </div>

          <div className="bg-[#0F0F11]/60 border border-zinc-900 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#F97316]" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide">Badges</p>
                <p className="text-xl font-bold text-white">—</p>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500">Achievements earned</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#0F0F11]/60 border border-zinc-900 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-zinc-500" />
                Active Goals
              </h2>
            </div>
            <p className="text-zinc-550 text-xs text-center py-4">Set goals to start tracking progress</p>
          </div>

          <div className="bg-[#0F0F11]/60 border border-zinc-900 rounded-xl p-5">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              Recent Activity
            </h2>
            <p className="text-zinc-550 text-xs text-center py-4">Start exploring to see activity</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/browse" className="bg-[#0F0F11]/60 border border-zinc-900 rounded-xl p-5 hover:border-orange-500/30 hover:bg-[#121214] transition-all">
            <Briefcase className="w-5 h-5 text-zinc-500 mb-3" />
            <h3 className="text-white font-medium text-sm mb-0.5">Browse</h3>
            <p className="text-[10px] text-zinc-500">View experiences</p>
          </Link>
          
          <Link href="/roadmap" className="bg-[#0F0F11]/60 border border-zinc-900 rounded-xl p-5 hover:border-orange-500/30 hover:bg-[#121214] transition-all">
            <Code2 className="w-5 h-5 text-zinc-500 mb-3" />
            <h3 className="text-white font-medium text-sm mb-0.5">Roadmap</h3>
            <p className="text-[10px] text-zinc-500">Practice DSA</p>
          </Link>
          
          <Link href="/resources" className="bg-[#0F0F11]/60 border border-zinc-900 rounded-xl p-5 hover:border-orange-500/30 hover:bg-[#121214] transition-all">
            <BookOpen className="w-5 h-5 text-zinc-500 mb-3" />
            <h3 className="text-white font-medium text-sm mb-0.5">Resources</h3>
            <p className="text-[10px] text-zinc-500">Download templates</p>
          </Link>
          
          <Link href="/saved" className="bg-[#0F0F11]/60 border border-zinc-900 rounded-xl p-5 hover:border-orange-500/30 hover:bg-[#121214] transition-all">
            <Trophy className="w-5 h-5 text-zinc-500 mb-3" />
            <h3 className="text-white font-medium text-sm mb-0.5">Saved</h3>
            <p className="text-[10px] text-zinc-500">Your saved items</p>
          </Link>
        </div>
      </div>
    </div>
  );
}