"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Trophy, Target, Flame, Zap, ExternalLink, X, TrendingUp, Code2 } from "lucide-react";
import { NODES, Problem } from "./dsa-data";

const STORAGE_KEY = "psg_dsa_progress";

type DSAProgress = {
  solvedProblems: string[];
  lastSolved: number;
  streak: number;
  lastActive: number;
};

const DIFFICULTY_COLORS = {
  Easy: "bg-green-500/20 text-green-400 border-green-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", 
  Hard: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function DsaTracker() {
  const [progress, setProgress] = useState<DSAProgress>({
    solvedProblems: [],
    lastSolved: 0,
    streak: 0,
    lastActive: 0,
  });
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [filter, setFilter] = useState<"all" | "solved" | "unsolved">("all");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check streak
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const lastActive = parsed.lastActive || 0;
        const daysSince = Math.floor((now - lastActive) / dayMs);
        
        if (daysSince <= 1 && lastActive > 0) {
          parsed.streak = parsed.streak || 1;
        } else if (daysSince > 1) {
          parsed.streak = 0;
        }
        setProgress(parsed);
      } catch (e) {
        console.error("Failed to parse progress", e);
      }
    }
  }, []);

  // Save to localStorage
  const saveProgress = (newProgress: DSAProgress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    setProgress(newProgress);
  };

  const markSolved = (problem: Problem) => {
    const isAlreadySolved = progress.solvedProblems.includes(problem.url);
    let newSolved: string[];
    
    if (isAlreadySolved) {
      newSolved = progress.solvedProblems.filter(p => p !== problem.url);
    } else {
      newSolved = [...progress.solvedProblems, problem.url];
    }
    
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const lastActive = progress.lastActive || 0;
    const daysSince = Math.floor((now - lastActive) / dayMs);
    
    let newStreak = progress.streak;
    if (daysSince <= 1 && lastActive > 0) {
      newStreak = (progress.streak || 1);
    } else if (daysSince > 1) {
      newStreak = 1;
    } else {
      newStreak = 1;
    }
    
    const newProgress: DSAProgress = {
      solvedProblems: newSolved,
      lastSolved: isAlreadySolved ? progress.lastSolved : now,
      streak: newStreak,
      lastActive: now,
    };
    
    saveProgress(newProgress);
  };

  const totalProblems = NODES.reduce((a, n) => a + n.problems.length, 0);
  const solvedCount = progress.solvedProblems.length;
  const solvedPercent = Math.round((solvedCount / totalProblems) * 100);
  
  const easySolved = NODES.flatMap(n => n.problems)
    .filter(p => p.difficulty === "Easy" && progress.solvedProblems.includes(p.url)).length;
  const medSolved = NODES.flatMap(n => n.problems)
    .filter(p => p.difficulty === "Medium" && progress.solvedProblems.includes(p.url)).length;
  const hardSolved = NODES.flatMap(n => n.problems)
    .filter(p => p.difficulty === "Hard" && progress.solvedProblems.includes(p.url)).length;

  const allProblems = NODES.flatMap(n => n.problems);
  const filteredProblems = allProblems.filter(p => {
    const isSolved = progress.solvedProblems.includes(p.url);
    if (filter === "solved") return isSolved;
    if (filter === "unsolved") return !isSolved;
    return true;
  });

  const unselectedProblems = NODES.flatMap(n => n.problems).filter(
    p => !selectedProblem || (p.url !== selectedProblem.url)
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Stats */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-bold text-white">DSA Progress</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{solvedCount}/{totalProblems}</p>
            <p className="text-xs text-zinc-500">Solved</p>
          </div>
          <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
            <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{progress.streak || 0}</p>
            <p className="text-xs text-zinc-500">Day Streak</p>
          </div>
        </div>

        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
            style={{ width: `${solvedPercent}%` }}
          />
        </div>
        <p className="text-xs text-zinc-500 mb-4">{solvedPercent}% Complete</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-400">Easy</span>
            <span className="text-xs text-zinc-400">{easySolved}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-yellow-400">Medium</span>
            <span className="text-xs text-zinc-400">{medSolved}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-400">Hard</span>
            <span className="text-xs text-zinc-400">{hardSolved}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 text-xs py-1.5 rounded ${filter === "all" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unsolved")}
            className={`flex-1 text-xs py-1.5 rounded ${filter === "unsolved" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
          >
            Todo
          </button>
          <button
            onClick={() => setFilter("solved")}
            className={`flex-1 text-xs py-1.5 rounded ${filter === "solved" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
          >
            Done
          </button>
        </div>
      </div>

      {/* Problems List */}
      <div className="flex-1">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4">Problems ({filteredProblems.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredProblems.map((problem) => {
              const isSolved = progress.solvedProblems.includes(problem.url);
              return (
                <div
                  key={problem.url}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    isSolved ? "bg-green-500/10" : "bg-zinc-800/30 hover:bg-zinc-800/50"
                  }`}
                  onClick={() => setSelectedProblem(problem)}
                >
                  {isSolved ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-600 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isSolved ? "text-green-400 line-through" : "text-white"}`}>
                      {problem.name}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markSolved(problem);
                    }}
                    className="shrink-0"
                  >
                    {isSolved ? (
                      <Circle className="w-5 h-5 text-zinc-500 hover:text-zinc-300" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-purple-500 hover:text-purple-400" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Problem Detail Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{selectedProblem.name}</h3>
              <button onClick={() => setSelectedProblem(null)}>
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            
            <div className={`inline-block px-3 py-1 rounded-full text-xs border mb-4 ${DIFFICULTY_COLORS[selectedProblem.difficulty]}`}>
              {selectedProblem.difficulty}
            </div>
            
            <div className="flex gap-3">
              <a
                href={selectedProblem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
              >
                <ExternalLink className="w-4 h-4" />
                Solve on LeetCode
              </a>
              <button
                onClick={() => markSolved(selectedProblem)}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
                  progress.solvedProblems.includes(selectedProblem.url)
                    ? "bg-zinc-700 text-zinc-300"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {progress.solvedProblems.includes(selectedProblem.url) ? (
                  <>
                    <Circle className="w-4 h-4" />
                    Undo
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Done
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}