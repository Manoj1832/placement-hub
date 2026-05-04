"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ExperienceCard from "@/components/experience-card";
import Header from "@/components/header";
import { ArrowLeft, Bookmark } from "lucide-react";

export default function SavedPage() {
  const router = useRouter();
  const { user: sessionUser, loading: sessionLoading } = useAuth();
  const userId = sessionUser?.email ?? undefined;
  const saved = useQuery(api.experiences.getSaved, {});

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Bookmark className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 mb-4">Please sign in to view saved experiences</p>
          <button 
            onClick={() => router.push("/sign-in")} 
            className="px-4 py-2 bg-[#00FF7F] text-black rounded-lg font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="container mx-auto px-4 py-4 border-b border-zinc-800">
        <Link href="/browse" className="text-sm text-zinc-400 hover:text-white inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to browse
        </Link>
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
            <Bookmark className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No saved experiences yet.</p>
            <Link href="/browse" className="text-[#00FF7F] hover:underline mt-2 inline-block">
              Browse experiences
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
