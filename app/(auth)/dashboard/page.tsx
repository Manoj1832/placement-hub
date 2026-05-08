"use client";

import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { 
  Flame, Trophy, Target, TrendingUp, Star, Zap, Award, 
  Clock, Sparkles, ChevronRight, BookOpen, Code2, Briefcase
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";

export default function ProgressDashboardPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
          <p className="text-zinc-400 mb-4">Sign in to track your progress</p>
          <Link href="/sign-in" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
            Sign In <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Progress</h1>
          <p className="text-zinc-400">Track your placement prep journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 uppercase">Level</p>
                <p className="text-2xl font-bold text-white">1</p>
              </div>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: '0%' }} />
            </div>
            <p className="text-xs text-zinc-500 mt-1">0 / 500 XP</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 uppercase">Streak</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500">Best: 0 days</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 uppercase">Total XP</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500">Lifetime points</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 uppercase">Badges</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500">Achievements earned</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                Active Goals
              </h2>
            </div>
            <p className="text-zinc-500 text-center py-4">Set goals to start tracking progress</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Recent Activity
            </h2>
            <p className="text-zinc-500 text-center py-4">Start exploring to see activity</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/browse" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-purple-500/30 transition-colors">
            <Briefcase className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="text-white font-medium mb-1">Browse</h3>
            <p className="text-xs text-zinc-500">View experiences</p>
          </Link>
          
          <Link href="/roadmap" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-purple-500/30 transition-colors">
            <Code2 className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="text-white font-medium mb-1">Roadmap</h3>
            <p className="text-xs text-zinc-500">Practice DSA</p>
          </Link>
          
          <Link href="/resources" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-purple-500/30 transition-colors">
            <BookOpen className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="text-white font-medium mb-1">Resources</h3>
            <p className="text-xs text-zinc-500">Download templates</p>
          </Link>
          
          <Link href="/saved" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-purple-500/30 transition-colors">
            <Trophy className="w-8 h-8 text-yellow-500 mb-3" />
            <h3 className="text-white font-medium mb-1">Saved</h3>
            <p className="text-xs text-zinc-500">Your saved items</p>
          </Link>
        </div>
      </div>
    </div>
  );
}