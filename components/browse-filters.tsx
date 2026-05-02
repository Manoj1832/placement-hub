"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";

interface BrowseFiltersProps {
  onChange: (filters: {
    company?: string;
    type?: string;
    branch?: string;
    difficulty?: string;
  }) => void;
}

export default function BrowseFilters({ onChange }: BrowseFiltersProps) {
  const [company, setCompany] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");

  const handleChange = () => {
    onChange({
      company: company || undefined,
      type: type || undefined,
      branch: branch || undefined,
      difficulty: difficulty || undefined,
    });
  };

  const clearFilters = () => {
    setCompany("");
    setType("");
    setBranch("");
    setDifficulty("");
    onChange({});
  };

  const hasFilters = company || type || branch || difficulty;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Company</label>
          <Input
            placeholder="Search company..."
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              handleChange();
            }}
            className="h-9"
          />
        </div>

        <div className="min-w-[120px]">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
          <Select value={type} onValueChange={(v) => { setType(v); handleChange(); }}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="fulltime">Full-time</SelectItem>
              <SelectItem value="PPO">PPO</SelectItem>
              <SelectItem value="Summer">Summer</SelectItem>
              <SelectItem value="Winter">Winter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[120px]">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Difficulty</label>
          <Select value={difficulty} onValueChange={(v) => { setDifficulty(v); handleChange(); }}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}