"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { use, useState } from "react";
import { ThumbsUp, Bookmark, CheckCircle, MapPin, Briefcase, Clock, ExternalLink, Code2 } from "lucide-react";
import Link from "next/link";

export default function ExperienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const experience = useQuery(api.experiences.getById, { id: id as any });
  const upvote = useMutation(api.experiences.upvote);
  const toggleSave = useMutation(api.experiences.save);
  const saved = useQuery(api.experiences.isSaved, { experienceId: id as any });

  const [showReportModal, setShowReportModal] = useState(false);

  if (experience === undefined) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );

  if (experience === null) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium">Experience not found</p>
        <Link href="/browse" className="text-primary hover:underline mt-2 inline-block">
          Back to browse
        </Link>
      </div>
    </div>
  );

  let rounds: any[] = [];
  try {
    if (experience.roundsJson) {
      rounds = JSON.parse(experience.roundsJson);
    }
  } catch (e) {
    console.error("Failed to parse rounds:", e);
  }

  const difficultyColors: Record<string, string> = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center">
          ← Back to experiences
        </Link>

        <Card className="mt-4">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{experience.companyName}</CardTitle>
                <p className="text-lg text-muted-foreground mt-1">{experience.roleTitle}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {experience.opportunityType && (
                  <Badge variant="secondary">{experience.opportunityType}</Badge>
                )}
                {experience.difficulty && (
                  <Badge className={difficultyColors[experience.difficulty.toLowerCase()] || ""}>
                  {experience.difficulty}
                </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                <span>{experience.totalRounds} rounds</span>
              )}
              {experience.isVerified && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </span>
              )}
            </div>

            {experience.keyTips && experience.keyTips.length > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Key Tips</h3>
                <ul className="list-disc list-inside space-y-1">
                  {experience.keyTips.map((tip: string, i: number) => (
                    <li key={i} className="text-sm text-blue-800">{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {rounds.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Interview Rounds</h2>
                {rounds.map((round: any, index: number) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardHeader className="py-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            Round {round.round_number}: {round.type}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {round.duration_minutes} mins • {round.platform || "N/A"} • {round.result}
                          </p>
                        </div>
                        <Badge variant="outline">{round.experience_rating || "N/A"}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="py-4 space-y-4">
                      {round.tips && (
                        <div className="bg-yellow-50 border border-yellow-100 rounded p-3">
                          <p className="text-sm text-yellow-800">{round.tips}</p>
                        </div>
                      )}

                      {round.technical_questions && round.technical_questions.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Code2 className="w-4 h-4" />
                            Technical Questions
                          </h4>
                          <div className="space-y-3">
                            {round.technical_questions.map((q: any, i: number) => (
                              <div key={i} className="bg-gray-50 rounded p-3">
                                <p className="text-sm font-medium">{q.question}</p>
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
                                      className="flex items-center gap-1 text-xs text-orange-600 hover:underline"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      LeetCode
                                    </a>
                                  )}
                                </div>
                                {q.solution && (
                                  <p className="text-xs text-muted-foreground mt-2">
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
                          <h4 className="font-medium mb-2">Behavioral Questions</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {round.behavioral_questions.map((bq: string, i: number) => (
                              <li key={i} className="text-sm text-muted-foreground">{bq}</li>
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
                    <h3 className="font-semibold mb-2">OA Details</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{experience.oaDetails}</p>
                  </div>
                )}

                {experience.round1 && (
                  <div>
                    <h3 className="font-semibold mb-2">Round 1</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{experience.round1}</p>
                  </div>
                )}

                {experience.round2 && (
                  <div>
                    <h3 className="font-semibold mb-2">Round 2</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{experience.round2}</p>
                  </div>
                )}

                {experience.round3 && (
                  <div>
                    <h3 className="font-semibold mb-2">Round 3</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{experience.round3}</p>
                  </div>
                )}

                {experience.hrRound && (
                  <div>
                    <h3 className="font-semibold mb-2">HR Round</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{experience.hrRound}</p>
                  </div>
                )}

                {experience.questionsAsked && experience.questionsAsked.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Questions Asked</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {experience.questionsAsked.map((q: string, i: number) => (
                        <li key={i} className="text-muted-foreground">{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {experience.tips && (
              <div>
                <h3 className="font-semibold mb-2">Tips</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{experience.tips}</p>
              </div>
            )}

            {experience.mistakesToAvoid && experience.mistakesToAvoid.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Mistakes to Avoid</h3>
                <ul className="list-disc list-inside space-y-1">
                  {experience.mistakesToAvoid.map((mistake: string, i: number) => (
                    <li key={i} className="text-sm text-red-800">{mistake}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button onClick={() => upvote({ experienceId: experience._id })}>
                <ThumbsUp className="w-4 h-4 mr-2" />
                Upvote ({experience.upvotes || 0})
              </Button>
              <Button variant="outline" onClick={() => toggleSave({ experienceId: experience._id })}>
                <Bookmark className={`w-4 h-4 mr-2 ${saved ? "fill-current" : ""}`} />
                {saved ? "Saved" : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}