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
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    if (urlCompany) setFilters({ company: urlCompany });
    if (urlType) setFilters((prev: any) => ({ ...prev, type: urlType }));
  }, [urlCompany, urlType]);

  // Reset when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, localSearch]);

  // Paginated query - fetch specific page
  const paginationArgs = {
    cursor: String((currentPage - 1) * PAGE_SIZE),
    numItems: PAGE_SIZE,
    search: localSearch || undefined,
    ...filters,
  };

  const pageResult = useQuery(api.experiences.paginatedList, paginationArgs);

  const currentExperiences = pageResult?.page || [];
  const totalCount = pageResult?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const isInitialLoading = pageResult === undefined;

  return (
    <div className="min-h-screen bg-[#2D1A5C]">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Interview Experiences</h1>
          <p className="text-white/60 mt-1">Real placement stories from PSG College students</p>
        </div>
        
        <div className="mb-6">
          <BrowseFilters onChange={setFilters} />
        </div>
        
        {isInitialLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#00FF7F] animate-spin" />
            <span className="text-white/70 ml-3">Loading experiences...</span>
          </div>
        ) : currentExperiences.length === 0 ? (
          <div className="text-center py-16 bg-[#392070] rounded-xl border border-white/10">
            <Search className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/80 text-lg">No experiences found</p>
            <p className="text-white/50 text-sm mt-2">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentExperiences.map((exp: any) => (
                <ExperienceCard key={exp._id} experience={exp} />
              ))}
            </div>
            
            {/* Numbered Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#392070] hover:bg-[#462888] text-white rounded-lg font-medium border border-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium border transition ${
                        currentPage === page
                          ? "bg-[#00FF7F] text-black border-[#00FF7F]"
                          : "bg-[#392070] text-white border-white/10 hover:bg-[#462888]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#392070] hover:bg-[#462888] text-white rounded-lg font-medium border border-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
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
    <Suspense fallback={<div className="min-h-screen bg-[#2D1A5C] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#00FF7F] animate-spin" /></div>}>
      <BrowseContent />
    </Suspense>
  );
}