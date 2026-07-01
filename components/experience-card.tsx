"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ThumbsUp, Bookmark, CheckCircle, MapPin, Briefcase, Clock, Users, Lock, Crown } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/components/toast-modal";
import CompanyLogo from "./company-logo";

interface ExperienceCardProps {
  experience: {
    _id: any;
    companyName: string;
    roleTitle: string;
    opportunityType: string;
    branch?: string;
    year?: number;
    month?: number;
    difficulty?: string;
    isAnonymous?: boolean;
    isVerified?: boolean;
    isPremium?: boolean;
    isFreePreview?: boolean;
    upvotes?: number;
    location?: string;
    workMode?: string;
    compensation?: number;
    duration?: string;
    totalRounds?: number;
  };
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const { user } = useUser();
  const userId = user?.primaryEmailAddress?.emailAddress;
  const [localUpvotes, setLocalUpvotes] = useState(experience.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [localSaved, setLocalSaved] = useState(false);
  const { showToast } = useToast();

  const saved = useQuery(api.experiences.isSaved, { 
    experienceId: experience._id,
    userEmail: userId || ""
  });
  const upvote = useMutation(api.experiences.upvote);
  const toggleSave = useMutation(api.experiences.save);

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      showToast("warning", "Sign In Required", "Please sign in to upvote experiences!");
      return;
    }
    if (!hasUpvoted) {
      setLocalUpvotes(prev => prev + 1);
      setHasUpvoted(true);
      upvote({ experienceId: experience._id });
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      showToast("warning", "Sign In Required", "Please sign in to save experiences!");
      return;
    }
    setLocalSaved(!localSaved);
    toggleSave({ experienceId: experience._id, userEmail: userId });
  };

  const difficultyColors: Record<string, string> = {
    easy: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    medium: "bg-amber-950/40 text-amber-400 border-amber-900/50",
    hard: "bg-rose-950/40 text-rose-400 border-rose-900/50",
  };

  const typeColors: Record<string, string> = {
    internship: "bg-blue-950/40 text-blue-400 border-blue-900/50",
    fulltime: "bg-violet-950/40 text-violet-400 border-violet-900/50",
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <Link href={`/experience/${experience._id}`}>
      <Card className="group relative overflow-hidden transition-all duration-300 h-full bg-[#0F0F11]/60 hover:bg-[#121214] border border-zinc-900 hover:border-orange-500/30 rounded-xl shadow-none">
        {/* Hover subtle top light bar */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#F97316]/0 via-[#F97316]/40 to-[#F97316]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            <CompanyLogo companyName={experience.companyName} size="md" />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-bold text-white truncate leading-tight group-hover:text-[#F97316] transition-colors">
                {experience.companyName}
              </CardTitle>
              <p className="text-xs text-zinc-400 mt-0.5 truncate font-medium">
                {experience.roleTitle}
              </p>
            </div>
          </div>
          
          <div className="flex gap-1.5 flex-wrap mt-3">
            {experience.opportunityType && (
              <Badge className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeColors[experience.opportunityType.toLowerCase()] || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                {experience.opportunityType}
              </Badge>
            )}
            {experience.difficulty && experience.difficulty !== "medium" && (
              <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${difficultyColors[experience.difficulty.toLowerCase()] || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                {experience.difficulty}
              </Badge>
            )}
            {experience.isPremium && !experience.isFreePreview && (
              <Badge className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-900/50">
                <Crown className="w-2.5 h-2.5 mr-1 text-amber-400" />
                Premium
              </Badge>
            )}
            {experience.isFreePreview && (
              <Badge className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1C0F02] text-[#F97316] border border-orange-950/40">FREE</Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-1.5">
            {experience.location && (
              <div className="flex items-center gap-1.5 bg-zinc-900/60 px-2 py-1 rounded text-zinc-400 text-[11px] border border-zinc-900">
                <MapPin className="w-3 h-3 text-zinc-500" />
                <span className="truncate">{experience.location}</span>
              </div>
            )}
            {experience.compensation && experience.compensation > 0 && (
              <div className="flex items-center gap-1.5 bg-zinc-900/60 px-2 py-1 rounded text-zinc-300 text-[11px] border border-zinc-900">
                <Briefcase className="w-3 h-3 text-zinc-500" />
                <span className="font-semibold text-white">₹{(experience.compensation / 100000).toFixed(1)}L</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2.5 text-[10px] text-zinc-500">
            {experience.year && (
              <div className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                <span>{experience.month ? `${monthNames[experience.month - 1]} ${experience.year}` : experience.year}</span>
              </div>
            )}
            {experience.totalRounds && experience.totalRounds > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-2.5 h-2.5" />
                <span>{experience.totalRounds} round{experience.totalRounds > 1 ? 's' : ''}</span>
              </div>
            )}
            {experience.workMode && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-2.5 h-2.5" />
                <span>{experience.workMode}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-zinc-900">
            <div className="flex items-center gap-2">
              {experience.isVerified && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={handleUpvote} className={`flex items-center gap-1 h-7 px-2 rounded transition-colors hover:bg-zinc-900 ${hasUpvoted ? "bg-zinc-900" : ""}`}>
                <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? "text-[#F97316]" : "text-zinc-500"}`} />
                <span className={`text-[11px] font-semibold ${hasUpvoted ? "text-white" : "text-zinc-500"}`}>{localUpvotes}</span>
              </button>
              <button type="button" onClick={handleSave} className="flex items-center justify-center h-7 w-7 rounded hover:bg-zinc-900 transition-colors">
                <Bookmark className={`w-3.5 h-3.5 ${localSaved !== undefined ? (localSaved ? "fill-current text-[#F97316]" : "text-zinc-500") : (saved ? "fill-current text-[#F97316]" : "text-zinc-500")}`} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}