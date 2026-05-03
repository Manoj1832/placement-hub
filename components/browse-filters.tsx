"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Search, X } from "lucide-react";

interface BrowseFiltersProps {
  onChange: (filters: {
    company?: string;
    type?: string;
    branch?: string;
    difficulty?: string;
  }) => void;
}

export default function BrowseFilters({ onChange }: BrowseFiltersProps) {
  const companies = useQuery(api.experiences.getDistinctCompanies);
  const [company, setCompany] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<string[]>([]);

  // Update filtered companies when user types
  useEffect(() => {
    if (company && companies) {
      const filtered = companies.filter((c) =>
        c.toLowerCase().includes(company.toLowerCase())
      );
      setFilteredCompanies(filtered.slice(0, 8));
      setShowCompanyDropdown(filtered.length > 0);
    } else {
      setShowCompanyDropdown(false);
    }
  }, [company, companies]);

  const handleChange = () => {
    onChange({
      company: company || undefined,
      type: type === "all" ? undefined : type || undefined,
      difficulty: difficulty === "all" ? undefined : difficulty || undefined,
    });
  };

  const clearFilters = () => {
    setCompany("");
    setType("");
    setDifficulty("");
    onChange({});
  };

  const hasFilters = company || (type && type !== "all") || (difficulty && difficulty !== "all");

  return (
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Company Search with Dropdown */}
        <div className="flex-1 min-w-[200px] relative">
          <label className="text-xs font-medium text-zinc-500 mb-1 block">Company</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search company..."
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                handleChange();
              }}
              onFocus={() => {
                if (filteredCompanies.length > 0) setShowCompanyDropdown(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowCompanyDropdown(false), 200);
              }}
              className="h-10 pl-10 bg-black border-zinc-800 text-white placeholder:text-zinc-500"
            />
          </div>
          {showCompanyDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {filteredCompanies.map((c) => (
                <button
                  key={c}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition"
                  onMouseDown={() => {
                    setCompany(c);
                    setShowCompanyDropdown(false);
                    handleChange();
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Job Type */}
        <div className="min-w-[140px]">
          <label className="text-xs font-medium text-zinc-500 mb-1 block">Job Type</label>
          <Select value={type || "all"} onValueChange={(v) => { setType(v); handleChange(); }}>
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
          <Select value={difficulty || "all"} onValueChange={(v) => { setDifficulty(v); handleChange(); }}>
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
            className="h-10 px-4 text-sm text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-900/20 rounded-lg"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
