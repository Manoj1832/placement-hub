"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ExperienceCard from "@/components/experience-card";

export default function SavedPage() {
  const saved = useQuery(api.experiences.getSaved);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Saved Experiences</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {saved?.map((exp: any) => (
          <ExperienceCard key={exp._id} experience={exp} />
        ))}
      </div>
      {saved?.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No saved experiences yet. Browse and save experiences to access them here!
        </p>
      )}
    </div>
  );
}