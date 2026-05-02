"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import ExperienceCard from "@/components/experience-card";
import { useState } from "react";

export default function SavedPage() {
  const { userId } = useAuth();
  const saved = useQuery(api.experiences.getSaved);

  if (!userId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Please sign in to view saved experiences</p>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Sign In</button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">PSG Placement Hub</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Saved Experiences</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {saved?.map((exp: any) => (
            <ExperienceCard key={exp._id} experience={exp} />
          ))}
        </div>
        {saved?.length === 0 && (
          <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
            <p className="text-zinc-400">No saved experiences yet.</p>
            <Link href="/browse" className="text-blue-400 hover:underline mt-2 inline-block">
              Browse experiences
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}