"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import ExperienceCard from "@/components/experience-card";
import BrowseFilters from "@/components/browse-filters";

export default function BrowsePage() {
  const [filters, setFilters] = useState({});
  const experiences = useQuery(api.experiences.list, filters);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Browse Interview Experiences</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Real placement experiences from PSG College students
          </p>
        </div>
        
        <div className="mb-6">
          <BrowseFilters onChange={setFilters} />
        </div>
        
        {experiences?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No experiences found matching your criteria.</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or be the first to share!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {experiences?.map((exp: any) => (
              <ExperienceCard key={exp._id} experience={exp} />
            ))}
          </div>
        )}
        
        {experiences && experiences.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-8">
            Showing {experiences.length} experience{experiences.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}