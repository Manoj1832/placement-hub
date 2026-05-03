"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ThumbsUp, Bookmark, CheckCircle, MapPin, Briefcase, Clock, Users, Lock, Crown } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

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
  const saved = useQuery(api.experiences.isSaved, { experienceId: experience._id });
  const upvote = useMutation(api.experiences.upvote);
  const toggleSave = useMutation(api.experiences.save);

  const { data: session } = useSession();
  const userId = session?.user?.email;

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      alert("Please sign in to upvote experiences!");
      return;
    }
    upvote({ experienceId: experience._id });
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      alert("Please sign in to save experiences!");
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
      <Card className="hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 h-full bg-zinc-900 border-zinc-800 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-bold text-white truncate leading-tight">
                {experience.companyName}
              </CardTitle>
              <p className="text-sm text-zinc-400 mt-1 truncate font-medium">
                {experience.roleTitle}
              </p>
            </div>
          </div>
          
          <div className="flex gap-1.5 flex-wrap mt-2">
            {experience.opportunityType && (
              <Badge className={`text-xs font-medium ${typeColors[experience.opportunityType.toLowerCase()] || 'bg-zinc-800 text-zinc-300'}`}>
                {experience.opportunityType}
              </Badge>
            )}
            {experience.difficulty && experience.difficulty !== "medium" && (
              <Badge variant="outline" className={`text-xs font-medium ${difficultyColors[experience.difficulty.toLowerCase()] || 'bg-zinc-800 text-zinc-300'}`}>
                {experience.difficulty}
              </Badge>
            )}
            {experience.isPremium && !experience.isFreePreview && (
              <Badge className="text-xs font-medium bg-yellow-900/30 text-yellow-400">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
            {experience.isFreePreview && (
              <Badge className="text-xs font-medium bg-green-900/30 text-green-400">FREE</Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            {experience.location && (
              <span className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-md text-zinc-400">
                <MapPin className="w-3 h-3" />
                {experience.location}
              </span>
            )}
            {experience.compensation && experience.compensation > 0 && (
              <span className="flex items-center gap-1 bg-green-900/20 px-2 py-1 rounded-md text-green-400">
                <Briefcase className="w-3 h-3" />
                ₹{(experience.compensation / 100000).toFixed(1)}L
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
            {experience.year && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {experience.month ? `${monthNames[experience.month - 1]} ${experience.year}` : experience.year}
              </span>
            )}
            {experience.totalRounds && experience.totalRounds > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {experience.totalRounds} round{experience.totalRounds > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              {experience.isVerified && (
                <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-zinc-800" onClick={handleUpvote}>
                <ThumbsUp className="w-4 h-4 text-zinc-500" />
                <span className="ml-1 text-xs font-medium text-zinc-400">{experience.upvotes || 0}</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-zinc-800" onClick={handleSave}>
                <Bookmark className={`w-4 h-4 ${saved ? "fill-current text-blue-400" : "text-zinc-500"}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}