"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useTransition, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ExperienceCard from "@/components/experience-card";
import BrowseFilters from "@/components/browse-filters";
import Header from "@/components/header";
import { 
  Loader2, Search, Sparkles, TrendingUp, Building2, Users2, RotateCcw,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight 
} from "lucide-react";

const PAGE_SIZE = 9;

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Read initial states from URL searchParams
  const initialFilters = useMemo(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    return {
      search: searchParams.get("search") || "",
      company: searchParams.get("company") || "",
      role: searchParams.get("role") || "",
      opportunityType: searchParams.get("type") || "",
      branch: searchParams.get("branch") || "",
      difficulty: searchParams.get("difficulty") || "",
      isVerified: searchParams.get("verified") === "true",
      isPremium: searchParams.get("premium") === "true",
      page: isNaN(page) ? 1 : page,
    };
  }, [searchParams]);

  // Keep internal state synchronized with URL params
  const [filters, setFilters] = useState(initialFilters);
  
  // History stack for Undo operations
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Query database
  const experiences = useQuery(api.experiences.browse, {
    search: filters.search,
    company: filters.company,
    role: filters.role,
    opportunityType: filters.opportunityType,
    branch: filters.branch,
    difficulty: filters.difficulty,
    isVerified: filters.isVerified || undefined,
    isPremium: filters.isPremium || undefined,
  });

  const stats = useQuery(api.experiences.getBrowseStats, {
    search: filters.search,
    company: filters.company,
    role: filters.role,
    opportunityType: filters.opportunityType,
    branch: filters.branch,
    difficulty: filters.difficulty,
    isVerified: filters.isVerified || undefined,
    isPremium: filters.isPremium || undefined,
  });

  // Calculate paginated results
  const allExperiences = experiences || [];
  const totalCount = allExperiences.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const currentPage = Math.min(filters.page, Math.max(1, totalPages));

  const currentExperiences = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return allExperiences.slice(startIndex, startIndex + PAGE_SIZE);
  }, [allExperiences, currentPage]);

  // Handle URL updates gracefully
  const updateUrl = (newFilters: typeof filters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.company) params.set("company", newFilters.company);
    if (newFilters.role) params.set("role", newFilters.role);
    if (newFilters.opportunityType) params.set("type", newFilters.opportunityType);
    if (newFilters.branch) params.set("branch", newFilters.branch);
    if (newFilters.difficulty) params.set("difficulty", newFilters.difficulty);
    if (newFilters.isVerified) params.set("verified", "true");
    if (newFilters.isPremium) params.set("premium", "true");
    if (newFilters.page > 1) params.set("page", newFilters.page.toString());

    const currentUrl = window.location.search;
    const nextUrl = `?${params.toString()}`;

    if (currentUrl !== nextUrl) {
      setHistory((prev) => [...prev, currentUrl]);
      startTransition(() => {
        router.push(nextUrl);
      });
    }
  };

  const handleFiltersChange = (updatedFields: Partial<typeof filters>) => {
    const nextFilters = {
      ...filters,
      ...updatedFields,
      // Reset page to 1 when filters change (unless page is explicitly updated)
      page: updatedFields.page !== undefined ? updatedFields.page : 1,
    };
    setFilters(nextFilters);
    updateUrl(nextFilters);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      handleFiltersChange({ page: newPage });
      // Smooth scroll to top of list
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prevUrl = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      startTransition(() => {
        router.push(prevUrl || "/browse");
      });
    }
  };

  const canUndo = history.length > 0;
  const isInitialLoading = experiences === undefined;

  // Pagination range generator
  const getPageNumbers = (current: number, total: number) => {
    const range: (number | string)[] = [];
    const delta = 1;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  };

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="min-h-screen bg-[#09090B]">
      <Header />

      {/* ─── Hero Section ──────────────────────────── */}
      <div className="relative overflow-hidden border-b border-zinc-900/60">
        <div className="container mx-auto px-6 pt-10 pb-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                <span>CURATED EXPERIENCES</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
                Interview Experiences
              </h1>
              <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed">
                Real placement stories from PSG College students. Learn from {totalCount > 0 ? totalCount : "100"}+ verified interview rounds.
              </p>
            </div>

            {/* ─── Live Stats Strip ────────── */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <TrendingUp className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-505 font-bold">Total</p>
                  <p className="text-base font-bold text-white leading-none">{totalCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <Building2 className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-505 font-bold">Companies</p>
                  <p className="text-base font-bold text-white leading-none">{stats?.totalCompanies || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <Users2 className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-505 font-bold">Page</p>
                  <p className="text-base font-bold text-white leading-none">{currentPage}<span className="text-zinc-500 font-normal text-sm">/{totalPages || 1}</span></p>
                </div>
              </div>
              {canUndo && (
                <button
                  onClick={handleUndo}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 text-xs font-semibold transition-all active:scale-[0.97]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Undo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filter Bar ──────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#09090B]/90 backdrop-blur-xl border-b border-zinc-900/60">
        <div className="container mx-auto px-6 py-3">
          <BrowseFilters filters={filters} onChange={handleFiltersChange} />
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
            </div>
            <p className="text-zinc-500 text-xs font-medium tracking-wide">Loading experiences...</p>
          </div>
        ) : currentExperiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5">
            <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 border border-zinc-750/50 flex items-center justify-center">
              <Search className="w-10 h-10 text-zinc-650" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-zinc-300 text-lg font-semibold">No experiences found</p>
              <p className="text-zinc-505 text-sm max-w-sm">Try adjusting your filters or search terms to discover more placement stories.</p>
            </div>
            <button
              onClick={() => handleFiltersChange({})}
              className="mt-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-350 text-xs font-semibold transition-all"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* Results count indicator */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-zinc-500 text-sm">
                Showing <span className="text-zinc-300 font-semibold">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)}</span> of <span className="text-zinc-350 font-semibold">{totalCount}</span> experiences
              </p>
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentExperiences.map((exp: any) => (
                <ExperienceCard key={exp._id} experience={exp} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-zinc-900/60">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="First page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {pageNumbers.map((p, idx) =>
                    p === "..." ? (
                      <span key={`ellipsis-${idx}`} className="w-8 text-center text-zinc-600 select-none">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p as number)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
                          currentPage === p
                            ? "bg-[#F97316] text-black border border-[#F97316]"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Last page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 text-[#F97316] animate-spin" />
          <p className="text-zinc-500 text-xs">Loading experiences...</p>
        </div>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}