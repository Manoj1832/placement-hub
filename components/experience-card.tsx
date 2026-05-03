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

  const saved = useQuery(api.experiences.isSaved, { 
    experienceId: experience._id,
    userEmail: userId ?? undefined
  });
  const upvote = useMutation(api.experiences.upvote);
  const toggleSave = useMutation(api.experiences.save);

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      alert("Please sign in to upvote experiences!");
      return;
    }
    // Optimistic UI update queue
    if (!hasUpvoted) {
      setLocalUpvotes(prev => prev + 1);
      setHasUpvoted(true);
      upvote({ experienceId: experience._id, userEmail: userId });
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      alert("Please sign in to save experiences!");
      return;
    }
    toggleSave({ experienceId: experience._id, userEmail: userId });
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
      <Card className="group relative overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-300 h-full bg-zinc-900/80 backdrop-blur-sm border-zinc-800/60 hover:border-purple-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all duration-300" />
        <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-300" />
        
        <CardHeader className="pb-2 relative z-10">
          <div className="flex items-start justify-between gap-2">
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
    </Link>
  );
}