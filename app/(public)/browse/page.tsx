"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
import ExperienceCard from "@/components/experience-card";
import BrowseFilters from "@/components/browse-filters";
import { Search, Users, Building2, Award, Crown, LogIn, UserPlus } from "lucide-react";

function BrowseContent() {
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const urlCompany = searchParams.get("company");
  const urlType = searchParams.get("type");
  const urlSearch = searchParams.get("search");
  
  const [filters, setFilters] = useState<any>({});
  const [localSearch, setLocalSearch] = useState(urlSearch || "");
  
  useEffect(() => {
    if (urlCompany) setFilters({ company: urlCompany });
    if (urlType) setFilters((prev: any) => ({ ...prev, type: urlType }));
  }, [urlCompany, urlType]);

  const experiences = useQuery(api.experiences.list, filters);
  const stats = useQuery(api.experiences.getStats);

  const filteredExp = experiences?.filter((exp: any) => {
    if (!localSearch) return true;
    const s = localSearch.toLowerCase();
    return (
      exp.companyName?.toLowerCase().includes(s) ||
      exp.roleTitle?.toLowerCase().includes(s) ||
      exp.tags?.some((t: string) => t.toLowerCase().includes(s))
    );
  });

  return (
    <div className="min-h-screen bg-[#2D1A5C]">
      <div className="bg-[#241350] border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Interview Experiences
              </h1>
              <p className="text-white/60 mt-1">
                Real placement stories from PSG College students
              </p>
            </div>
            
            {!userId ? (
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#00FF7F] hover:bg-[#00cc66] text-black rounded-lg font-semibold shadow-[0_0_15px_rgba(0,255,127,0.3)] transition">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              </SignInButton>
            ) : (
              <Link href="/dashboard">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#392070] hover:bg-[#462888] text-white rounded-lg font-medium border border-white/10 transition">
                  <UserPlus className="w-4 h-4" />
                  Dashboard
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
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
        
        {filteredExp?.length === 0 ? (
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
          </>
        )}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#2D1A5C] flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <BrowseContent />
    </Suspense>
  );
}