"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface BrowseFiltersProps {
  filters: {
    search?: string;
    type?: string;
    difficulty?: string;
  };
  onChange: (filters: {
    search?: string;
    type?: string;
    difficulty?: string;
  }) => void;
}

export default function BrowseFilters({ filters, onChange }: BrowseFiltersProps) {
  const [searchQuery, setSearchQuery] = useState<string>(filters.search || "");
  const [type, setType] = useState<string>(filters.type || "");
  const [difficulty, setDifficulty] = useState<string>(filters.difficulty || "");

  // Sync internal state with props (e.g. when Undo is clicked)
  useEffect(() => {
    setSearchQuery(filters.search || "");
    setType(filters.type || "");
    setDifficulty(filters.difficulty || "");
  }, [filters.search, filters.type, filters.difficulty]);

  // Debounce the actual filter change for the parent, only if it differs from current props
  useEffect(() => {
    const nextFilters = {
      search: searchQuery || undefined,
      type: type === "all" ? undefined : type || undefined,
      difficulty: difficulty === "all" ? undefined : difficulty || undefined,
    };

    const hasChanged =
      (nextFilters.search || undefined) !== (filters.search || undefined) ||
      (nextFilters.type || undefined) !== (filters.type || undefined) ||
      (nextFilters.difficulty || undefined) !== (filters.difficulty || undefined);

    if (hasChanged) {
      const timer = setTimeout(() => {
        onChange(nextFilters);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, type, difficulty, filters, onChange]);

  const clearFilters = () => {
    setSearchQuery("");
    setType("");
    setDifficulty("");
    onChange({});
  };

  const hasFilters = searchQuery || (type && type !== "all") || (difficulty && difficulty !== "all");
  const activeCount = [searchQuery, type && type !== "all" ? type : null, difficulty && difficulty !== "all" ? difficulty : null].filter(Boolean).length;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="flex-1 min-w-[220px] relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
        <Input
          placeholder="Search companies, roles, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 rounded-xl transition-all focus:border-purple-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-purple-500/20"
        />
      </div>

      {/* Job Type */}
      <Select value={type || "all"} onValueChange={(v) => setType(v)}>
        <SelectTrigger className="h-10 w-[140px] bg-white/[0.04] border-white/[0.08] text-white rounded-xl hover:bg-white/[0.06] transition-all focus:border-purple-500/50">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a24] border-white/10 rounded-xl shadow-2xl">
          <SelectItem value="all" className="text-white focus:bg-white/10 focus:text-white rounded-lg">All Types</SelectItem>
          <SelectItem value="internship" className="text-white focus:bg-white/10 focus:text-white rounded-lg">Internship</SelectItem>
          <SelectItem value="fulltime" className="text-white focus:bg-white/10 focus:text-white rounded-lg">Full-time</SelectItem>
        </SelectContent>
      </Select>

      {/* Difficulty */}
      <Select value={difficulty || "all"} onValueChange={(v) => setDifficulty(v)}>
        <SelectTrigger className="h-10 w-[140px] bg-white/[0.04] border-white/[0.08] text-white rounded-xl hover:bg-white/[0.06] transition-all focus:border-purple-500/50">
          <SelectValue placeholder="All Levels" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a24] border-white/10 rounded-xl shadow-2xl">
          <SelectItem value="all" className="text-white focus:bg-white/10 focus:text-white rounded-lg">All Levels</SelectItem>
          <SelectItem value="easy" className="text-green-400 focus:bg-white/10 focus:text-green-400 rounded-lg">Easy</SelectItem>
          <SelectItem value="medium" className="text-yellow-400 focus:bg-white/10 focus:text-yellow-400 rounded-lg">Medium</SelectItem>
          <SelectItem value="hard" className="text-red-400 focus:bg-white/10 focus:text-red-400 rounded-lg">Hard</SelectItem>
        </SelectContent>
      </Select>

      {/* Active filter count + clear */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="h-10 px-3.5 text-sm text-zinc-400 hover:text-white flex items-center gap-2 bg-white/[0.04] hover:bg-red-500/10 border border-white/[0.08] hover:border-red-500/20 rounded-xl transition-all group"
        >
          <X className="w-3.5 h-3.5 group-hover:text-red-400 transition-colors" />
          <span className="hidden sm:inline">Clear</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 text-[11px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
