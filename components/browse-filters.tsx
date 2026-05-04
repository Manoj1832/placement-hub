"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Search, X } from "lucide-react";

interface BrowseFiltersProps {
  onChange: (filters: {
    search?: string;
    type?: string;
    branch?: string;
    difficulty?: string;
  }) => void;
}

export default function BrowseFilters({ onChange }: BrowseFiltersProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");

  // Debounce the actual filter change for the parent
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({
        search: searchQuery || undefined,
        type: type === "all" ? undefined : type || undefined,
        difficulty: difficulty === "all" ? undefined : difficulty || undefined,
      });
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery, type, difficulty]);

  const clearFilters = () => {
    setSearchQuery("");
    setType("");
    setDifficulty("");
    onChange({});
  };

  const hasFilters = searchQuery || (type && type !== "all") || (difficulty && difficulty !== "all");

  return (
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Generic Search */}
        <div className="flex-1 min-w-[200px] relative">
          <label className="text-xs font-medium text-zinc-500 mb-1 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search companies, roles, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 bg-black border-zinc-800 text-white placeholder:text-zinc-500 transition-all focus:border-[#00FF7F]"
            />
          </div>
        </div>

        {/* Job Type */}
        <div className="min-w-[140px]">
          <label className="text-xs font-medium text-zinc-500 mb-1 block">Job Type</label>
          <Select value={type || "all"} onValueChange={(v) => { setType(v); }}>
            <SelectTrigger className="h-10 bg-black border-zinc-800 text-white">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all" className="text-white">All Types</SelectItem>
              <SelectItem value="internship" className="text-white">Internship</SelectItem>
              <SelectItem value="fulltime" className="text-white">Full-time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty */}
        <div className="min-w-[140px]">
          <label className="text-xs font-medium text-zinc-500 mb-1 block">Difficulty</label>
          <Select value={difficulty || "all"} onValueChange={(v) => { setDifficulty(v); }}>
            <SelectTrigger className="h-10 bg-black border-zinc-800 text-white">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all" className="text-white">All Levels</SelectItem>
              <SelectItem value="easy" className="text-white">Easy</SelectItem>
              <SelectItem value="medium" className="text-white">Medium</SelectItem>
              <SelectItem value="hard" className="text-white">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="h-10 px-4 text-sm text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-900/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
