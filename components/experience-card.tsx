"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ThumbsUp, Bookmark, CheckCircle, MapPin, Briefcase, Clock } from "lucide-react";
import Link from "next/link";

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

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    upvote({ experienceId: experience._id });
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave({ experienceId: experience._id });
  };

  const difficultyColors: Record<string, string> = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <Link href={`/experience/${experience._id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">{experience.companyName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {experience.roleTitle}
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {experience.opportunityType && (
                <Badge variant="secondary" className="text-xs">{experience.opportunityType}</Badge>
              )}
              {experience.difficulty && (
                <Badge className={`text-xs ${difficultyColors[experience.difficulty.toLowerCase()] || ""}`}>
                  {experience.difficulty}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {experience.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {experience.location}
              </span>
            )}
            {experience.compensation && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                ₹{(experience.compensation / 100000).toFixed(1)}L
              </span>
            )}
            {experience.year && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {experience.month ? `${monthNames[experience.month - 1]} ${experience.year}` : experience.year}
              </span>
            )}
            {experience.totalRounds && (
              <span className="flex items-center gap-1">
                {experience.totalRounds} rounds
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              {experience.isVerified && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleUpvote}>
                <ThumbsUp className="w-3 h-3" />
                <span className="ml-1 text-xs">{experience.upvotes || 0}</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleSave}>
                <Bookmark className={`w-3 h-3 ${saved ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}