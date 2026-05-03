"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ExperienceCard from "@/components/experience-card";
import BrowseFilters from "@/components/browse-filters";
import Header from "@/components/header";
import { Search, Users, Building2, Award, Crown, Loader2 } from "lucide-react";

const PAGE_SIZE = 8;

function BrowseContent() {
  const searchParams = useSearchParams();
  const urlCompany = searchParams.get("company");
  const urlType = searchParams.get("type");
  const urlSearch = searchParams.get("search");
  
  const [filters, setFilters] = useState<any>({});
  const [localSearch, setLocalSearch] = useState(urlSearch || "");
  const [cursor, setCursor] = useState<string | null>(null);
  const [allExperiences, setAllExperiences] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const initialLoadDone = useRef(false);
  
  useEffect(() => {
    if (urlCompany) setFilters({ company: urlCompany });
    if (urlType) setFilters((prev: any) => ({ ...prev, type: urlType }));
  }, [urlCompany, urlType]);

  // Reset when filters change
  useEffect(() => {
    setCursor(null);
    setAllExperiences([]);
    setHasMore(true);
    initialLoadDone.current = false;
  }, [filters]);

  // Paginated query - fetch chunk by chunk
  const paginationArgs = {
    cursor: cursor ?? undefined,
    numItems: PAGE_SIZE,
    ...filters,
  };

  const pageResult = useQuery(api.experiences.paginatedList, paginationArgs);
  const stats = useQuery(api.experiences.getStats);

  // When new page data arrives, append it
  useEffect(() => {
    if (pageResult && pageResult.page) {
      if (!initialLoadDone.current && cursor === null) {
        // First load
        setAllExperiences(pageResult.page);
        initialLoadDone.current = true;
      } else if (cursor !== null) {
        // Subsequent loads
        setAllExperiences(prev => {
          const existingIds = new Set(prev.map((e: any) => e._id));
          const newItems = pageResult.page.filter((e: any) => !existingIds.has(e._id));
          return [...prev, ...newItems];
        });
      }
      setHasMore(!pageResult.isDone);
      setIsLoadingMore(false);
    }
  }, [pageResult, cursor]);

  const loadMore = useCallback(() => {
    if (pageResult?.continueCursor && !isLoadingMore) {
      setIsLoadingMore(true);
      setCursor(pageResult.continueCursor);
    }
  }, [pageResult, isLoadingMore]);

  // Client-side search filter on already-loaded data
  const filteredExp = allExperiences?.filter((exp: any) => {
    if (!localSearch) return true;
    const s = localSearch.toLowerCase();
    return (
      exp.companyName?.toLowerCase().includes(s) ||
      exp.roleTitle?.toLowerCase().includes(s) ||
      exp.tags?.some((t: string) => t.toLowerCase().includes(s))
    );
  });

  const isInitialLoading = !pageResult && allExperiences.length === 0;

  return (
    <div className="min-h-screen bg-[#2D1A5C]">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Interview Experiences</h1>
          <p className="text-white/60 mt-1">Real placement stories from PSG College students</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#392070] rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Users className="w-4 h-4" />
              <span>Experiences</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">{stats?.totalExperiences || 0}</div>
          </div>
          <div className="bg-[#392070] rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Building2 className="w-4 h-4" />
              <span>Companies</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">{stats?.totalCompanies || 0}</div>
          </div>
          <div className="bg-[#392070] rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Award className="w-4 h-4" />
              <span>Free Access</span>
            </div>
            <div className="text-xl font-bold text-[#00FF7F] mt-1">5</div>
          </div>
          <div className="bg-[#392070] rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Crown className="w-4 h-4" />
              <span>Premium</span>
            </div>
            <div className="text-xl font-bold text-yellow-400 mt-1">Unlock</div>
          </div>
        </div>
        
        <div className="mb-6">
          <BrowseFilters onChange={setFilters} />
        </div>
        
        {isInitialLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#00FF7F] animate-spin" />
            <span className="text-white/70 ml-3">Loading experiences...</span>
          </div>
        ) : filteredExp?.length === 0 ? (
          <div className="text-center py-16 bg-[#392070] rounded-xl border border-white/10">
            <Search className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/80 text-lg">No experiences found</p>
            <p className="text-white/50 text-sm mt-2">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-white/60">
                Showing <span className="font-semibold text-white">{filteredExp?.length}</span> experiences
                <span className="text-white/50 ml-2">(5 free, rest premium)</span>
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredExp?.map((exp: any) => (
                <ExperienceCard key={exp._id} experience={exp} />
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 px-8 py-3 bg-[#392070] hover:bg-[#462888] text-white rounded-xl font-medium border border-white/10 transition disabled:opacity-50 shadow-lg"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    "Load More Experiences"
                  )}
                </button>
              </div>
            )}
            
            {!hasMore && allExperiences.length > PAGE_SIZE && (
              <p className="text-center text-white/40 text-sm mt-8">
                You&apos;ve reached the end — {allExperiences.length} experiences loaded
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#2D1A5C] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#00FF7F] animate-spin" /></div>}>
      <BrowseContent />
    </Suspense>
  );
}