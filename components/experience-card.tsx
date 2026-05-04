"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ThumbsUp, Bookmark, CheckCircle, MapPin, Briefcase, Clock, Users, Lock, Crown } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/toast-modal";
import CompanyLogo from "./company-logo";
import BorderGlow from "./ui/border-glow";

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
  const { user } = useAuth();
  const userId = user?.email;
  const [localUpvotes, setLocalUpvotes] = useState(experience.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const { showToast } = useToast();

  const saved = useQuery(api.experiences.isSaved, { 
    experienceId: experience._id
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
    // Optimistic UI update queue
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
    toggleSave({ experienceId: experience._id });
  };

  const difficultyColors: Record<string, string> = {
    easy: "bg-green-900/30 text-green-400 border-green-800",
    medium: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
    hard: "bg-red-900/30 text-red-400 border-red-800",
  };

  const typeColors: Record<string, string> = {
    internship: "bg-blue-900/30 text-blue-400",
    fulltime: "bg-purple-900/30 text-purple-400",
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <Link href={`/experience/${experience._id}`}>
      <BorderGlow
        edgeSensitivity={35}
        glowColor="270 60 70"
        backgroundColor="#18181b"
        borderRadius={16}
        glowRadius={30}
        glowIntensity={0.8}
        coneSpread={20}
        colors={['#a855f7', '#ec4899', '#3b82f6']}
        className="h-full"
      >
      <Card className="group relative overflow-hidden hover:-translate-y-1 transition-all duration-300 h-full bg-transparent border-0 shadow-none">
        
        <CardHeader className="pb-2 relative z-10">
          <div className="flex items-start gap-3">
            <CompanyLogo companyName={experience.companyName} size="md" />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-bold text-white truncate leading-tight group-hover:text-purple-400 transition-colors">
                {experience.companyName}
              </CardTitle>
              <p className="text-sm text-zinc-400 mt-1 truncate font-medium group-hover:text-zinc-300 transition-colors">
                {experience.roleTitle}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap mt-3">
            {experience.opportunityType && (
              <Badge className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColors[experience.opportunityType.toLowerCase()] || 'bg-zinc-800 text-zinc-300'}`}>
                {experience.opportunityType}
              </Badge>
            )}
            {experience.difficulty && experience.difficulty !== "medium" && (
              <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${difficultyColors[experience.difficulty.toLowerCase()] || 'bg-zinc-800 text-zinc-300'}`}>
                {experience.difficulty}
              </Badge>
            )}
            {experience.isPremium && !experience.isFreePreview && (
              <Badge className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-yellow-900/40 text-yellow-400 border-yellow-700/50">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
            {experience.isFreePreview && (
              <Badge className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-900/40 text-green-400 border-green-700/50">FREE</Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 relative z-10">
          <div className="grid grid-cols-2 gap-2">
            {experience.location && (
              <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2.5 py-1.5 rounded-lg text-zinc-400 text-xs">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span className="truncate">{experience.location}</span>
              </div>
            )}
            {experience.compensation && experience.compensation > 0 && (
              <div className="flex items-center gap-1.5 bg-green-900/20 px-2.5 py-1.5 rounded-lg text-green-400 text-xs">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="font-semibold">₹{(experience.compensation / 100000).toFixed(1)}L</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            {experience.year && (
              <div className="flex items-center gap-1.5 bg-zinc-800/30 px-2 py-1 rounded-md">
                <Clock className="w-3 h-3" />
                <span>{experience.month ? `${monthNames[experience.month - 1]} ${experience.year}` : experience.year}</span>
              </div>
            )}
            {experience.totalRounds && experience.totalRounds > 0 && (
              <div className="flex items-center gap-1.5 bg-zinc-800/30 px-2 py-1 rounded-md">
                <Users className="w-3 h-3" />
                <span>{experience.totalRounds} round{experience.totalRounds > 1 ? 's' : ''}</span>
              </div>
            )}
            {experience.workMode && (
              <div className="flex items-center gap-1.5 bg-zinc-800/30 px-2 py-1 rounded-md">
                <Briefcase className="w-3 h-3" />
                <span>{experience.workMode}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
            <div className="flex items-center gap-2">
              {experience.isVerified && (
                <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={handleUpvote} className={`flex items-center gap-1.5 h-8 px-3 rounded-lg transition-colors hover:bg-zinc-800 ${hasUpvoted ? "bg-purple-500/20" : ""}`}>
                <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? "text-purple-400" : "text-zinc-500"}`} />
                <span className={`text-xs font-medium ${hasUpvoted ? "text-purple-400" : "text-zinc-400"}`}>{localUpvotes}</span>
              </button>
              <button type="button" onClick={handleSave} className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-zinc-800 transition-colors">
                <Bookmark className={`w-4 h-4 ${saved ? "fill-current text-purple-400" : "text-zinc-500"}`} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
      </BorderGlow>
    </Link>
  );
}