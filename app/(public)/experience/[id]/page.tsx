"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { use, useState } from "react";
import { ThumbsUp, Bookmark, CheckCircle, MapPin, Briefcase, Clock, Lock, Crown, ExternalLink, Code2, Users } from "lucide-react";
import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";

export default function ExperienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { userId } = useAuth();
  const experience = useQuery(api.experiences.getById, { id: id as any });
  const upvote = useMutation(api.experiences.upvote);
  const toggleSave = useMutation(api.experiences.save);
  const saved = useQuery(api.experiences.isSaved, { experienceId: id as any });

  if (experience === undefined) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  );

  if (experience === null) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-lg">Experience not found</p>
        <Link href="/browse" className="text-blue-400 hover:underline mt-2 inline-block">
          Back to browse
        </Link>
      </div>
    </div>
  );

  const isLocked = experience.accessLevel === "limited";

  let rounds: any[] = [];
  try {
    if (experience.roundsJson) {
      rounds = JSON.parse(experience.roundsJson);
    }
  } catch (e) {
      console.error("Failed to parse rounds:", e);
  }

  const difficultyColors: Record<string, string> = {
    easy: "bg-green-900/30 text-green-400 border-green-800",
    medium: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
    hard: "bg-red-900/30 text-red-400 border-red-800",
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/browse" className="text-sm text-zinc-400 hover:text-white inline-flex items-center">
            ← Back to experiences
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl text-white">{experience.companyName}</CardTitle>
                <p className="text-lg text-zinc-400 mt-1">{experience.roleTitle}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {experience.opportunityType && (
                  <Badge className="bg-blue-900/30 text-blue-400">{experience.opportunityType}</Badge>
                )}
                {experience.difficulty && (
                  <Badge variant="outline" className={difficultyColors[experience.difficulty.toLowerCase()] || ""}>
                    {experience.difficulty}
                  </Badge>
                )}
                {experience.isPremium && !experience.isFreePreview && (
                  <Badge className="bg-yellow-900/30 text-yellow-400">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
                {experience.isFreePreview && (
                  <Badge className="bg-green-900/30 text-green-400">FREE</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
              {experience.year && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {experience.month ? `${monthNames[experience.month - 1]} ${experience.year}` : experience.year}
                </span>
              )}
              {experience.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {experience.location}
                </span>
              )}
              {experience.compensation && experience.compensation > 0 && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  ₹{experience.compensation.toLocaleString("en-IN")}
                </span>
              )}
              {experience.totalRounds && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {experience.totalRounds} rounds
                </span>
              )}
              {experience.isVerified && (
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </span>
              )}
            </div>

            {experience.keyTips && experience.keyTips.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-400 mb-2">Key Tips</h3>
                <ul className="list-disc list-inside space-y-1">
                  {experience.keyTips.map((tip: string, i: number) => (
                    <li key={i} className="text-sm text-zinc-300">{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {isLocked ? (
              <Card className="border-zinc-700 bg-zinc-800/50">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <Lock className="w-12 h-12 text-zinc-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Unlock the Full Experience</h3>
                  <p className="text-zinc-400 mb-6 max-w-md">
                    This is a premium experience. Sign in to access round-by-round details, technical questions, and tips.
                  </p>
                  {!userId ? (
                    <SignInButton mode="modal">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Crown className="w-4 h-4 mr-2" />
                        Sign In to Unlock - ₹99/mo
                      </Button>
                    </SignInButton>
                  ) : (
                    <Button className="bg-yellow-600 hover:bg-yellow-700">
                      Upgrade to Premium - ₹99/mo
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {rounds.length > 0 ? (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Interview Rounds</h2>
                    {rounds.map((round: any, index: number) => (
                      <Card key={index} className="border-zinc-700 bg-zinc-800/50">
                        <CardHeader className="py-3 bg-zinc-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-white">
                                Round {round.round_number}: {round.type}
                              </h3>
                              <p className="text-xs text-zinc-500">
                                {round.duration_minutes} mins • {round.platform || "N/A"} • {round.result}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-zinc-400">{round.experience_rating || "N/A"}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="py-4 space-y-4">
                          {round.tips && (
                            <div className="bg-yellow-900/20 border border-yellow-800 rounded p-3">
                              <p className="text-sm text-yellow-400">{round.tips}</p>
                            </div>
                          )}

                          {round.technical_questions && round.technical_questions.length > 0 && (
                            <div>
                              <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                                <Code2 className="w-4 h-4" />
                                Technical Questions
                              </h4>
                              <div className="space-y-3">
                                {round.technical_questions.map((q: any, i: number) => (
                                  <div key={i} className="bg-zinc-800 rounded p-3 border border-zinc-700">
                                    <p className="text-sm font-medium text-white">{q.question}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {q.difficulty && (
                                        <Badge variant="secondary" className="text-xs">{q.difficulty}</Badge>
                                      )}
                                      {q.topics && q.topics.map((topic: string, j: number) => (
                                        <Badge key={j} variant="outline" className="text-xs">{topic}</Badge>
                                      ))}
                                      {q.leetcode_url && (
                                        <a
                                          href={q.leetcode_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 text-xs text-orange-400 hover:underline"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          LeetCode
                                        </a>
                                      )}
                                    </div>
                                    {q.solution && (
                                      <p className="text-xs text-zinc-400 mt-2">
                                        <span className="font-medium">Solution:</span> {q.solution}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {round.behavioral_questions && round.behavioral_questions.length > 0 && (
                            <div>
                              <h4 className="font-medium text-white mb-2">Behavioral Questions</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {round.behavioral_questions.map((bq: any, i: number) => (
                                  <li key={i} className="text-sm text-zinc-400">
                                    {typeof bq === 'string' ? bq : bq.question}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {experience.oaDetails && (
                      <div>
                        <h3 className="font-semibold text-white mb-2">OA Details</h3>
                        <p className="text-zinc-400 whitespace-pre-wrap">{experience.oaDetails}</p>
                      </div>
                    )}

                    {experience.round1 && (
                      <div>
                        <h3 className="font-semibold text-white mb-2">Round 1</h3>
                        <p className="text-zinc-400 whitespace-pre-wrap">{experience.round1}</p>
                      </div>
                    )}

                    {experience.round2 && (
                      <div>
                        <h3 className="font-semibold text-white mb-2">Round 2</h3>
                        <p className="text-zinc-400 whitespace-pre-wrap">{experience.round2}</p>
                      </div>
                    )}

                    {experience.round3 && (
                      <div>
                        <h3 className="font-semibold text-white mb-2">Round 3</h3>
                        <p className="text-zinc-400 whitespace-pre-wrap">{experience.round3}</p>
                      </div>
                    )}
                  </div>
                )}

                {experience.tips && (
                  <div>
                    <h3 className="font-semibold text-white mb-2">Tips</h3>
                    <p className="text-zinc-400 whitespace-pre-wrap">{experience.tips}</p>
                  </div>
                )}
              </>
            )}

            {experience.mistakesToAvoid && experience.mistakesToAvoid.length > 0 && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <h3 className="font-semibold text-red-400 mb-2">Mistakes to Avoid</h3>
                <ul className="list-disc list-inside space-y-1">
                  {experience.mistakesToAvoid.map((mistake: string, i: number) => (
                    <li key={i} className="text-sm text-zinc-300">{mistake}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800">
              <Button onClick={() => upvote({ experienceId: experience._id })} className="bg-zinc-800 hover:bg-zinc-700 text-white">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Upvote ({experience.upvotes || 0})
              </Button>
              <Button variant="outline" onClick={() => toggleSave({ experienceId: experience._id })} className="border-zinc-700 text-white hover:bg-zinc-800">
                <Bookmark className={`w-4 h-4 mr-2 ${saved ? "fill-current text-blue-400" : ""}`} />
                {saved ? "Saved" : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}