"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { use, useState, useEffect } from "react";
import { ThumbsUp, Bookmark, CheckCircle, MapPin, Briefcase, Clock, Lock, Crown, ExternalLink, Code2, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { useToast } from "@/components/toast-modal";

export default function ExperienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const experienceId = id as Id<"experiences">;
  const { user: sessionUser, loading: sessionLoading } = useAuth();
  const router = useRouter();
  const userId = sessionUser?.email as string | undefined;
  const experience = useQuery(api.experiences.getById, { 
    id: experienceId,
    userEmail: userId
  });
  const upvote = useMutation(api.experiences.upvote);
  const toggleSave = useMutation(api.experiences.save);
  const saved = useQuery(api.experiences.isSaved, { experienceId, userEmail: userId });
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const { showToast } = useToast();

  // Sync user to Convex and check premium status when session is available
  useEffect(() => {
    if (!sessionLoading && userId) {
      // Ensure user exists in Convex
      fetch("/api/user/sync", { method: "POST" }).catch(console.error);

      // Check premium status
      fetch("/api/user/sync")
        .then((res) => res.json())
        .then((data) => setIsPremiumUser(data.isPremium))
        .catch(console.error);
    }
  }, [sessionLoading, userId]);

  const handleUpgrade = async () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    try {
      setUpgradeLoading(true);

      // 1. Create Razorpay order via our API
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 9900 }),
      });
      const data = await res.json();

      if (!res.ok || !data.orderId) {
        throw new Error(data.error || "Order creation failed");
      }

      // 2. Load Razorpay checkout script if not already loaded
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
          document.body.appendChild(script);
        });
      }

      // 3. Open Razorpay checkout popup
      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "PSG Placement Hub",
        description: "Premium Access - ₹99/yr",
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // 4. Verify payment server-side & grant premium
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setIsPremiumUser(true);
              showToast("success", "Payment Successful!", "You now have Premium access for 1 year. 🎉");
              window.location.reload();
            } else {
              showToast("error", "Verification Failed", "Payment was received but verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            showToast("info", "Payment Status", "Payment may have succeeded. Please refresh the page.");
            window.location.reload();
          }
        },
        prefill: {
          email: userId,
          name: sessionUser?.name || "",
        },
        theme: { color: "#eab308" },
        modal: {
          ondismiss: function () {
            setUpgradeLoading(false);
          },
        },
      });
      rzp.open();
    } catch (err: any) {
      console.error("Payment init error:", err);
      showToast("error", "Payment Error", err.message || "Payment failed to initialize. Please try again.");
      setUpgradeLoading(false);
    }
  };

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

  const isLocked = experience.accessLevel === "limited" && !isPremiumUser;

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
      <Header />

      <div className="container mx-auto px-4 py-4 border-b border-zinc-800/50">
        <Link href="/browse" className="text-sm text-zinc-400 hover:text-white inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to experiences
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-blue-500/10 rounded-2xl blur-xl" />
          <Card className="relative bg-zinc-900/80 backdrop-blur border-zinc-800/60">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl font-bold text-white">{experience.companyName}</CardTitle>
                  <p className="text-xl text-zinc-400 mt-1">{experience.roleTitle}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {experience.opportunityType && (
                    <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">{experience.opportunityType}</Badge>
                  )}
                  {experience.difficulty && (
                    <Badge variant="outline" className={difficultyColors[experience.difficulty.toLowerCase()] || ""}>
                      {experience.difficulty}
                    </Badge>
                  )}
                  {experience.isPremium && !experience.isFreePreview && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {experience.isFreePreview && (
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">FREE</Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4 text-sm">
                {experience.year && (
                  <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 rounded-lg text-zinc-300">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>{experience.month ? `${monthNames[experience.month - 1]} ${experience.year}` : experience.year}</span>
                  </div>
                )}
                {experience.location && (
                  <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 rounded-lg text-zinc-300">
                    <MapPin className="w-4 h-4 text-pink-400" />
                    <span>{experience.location}</span>
                  </div>
                )}
                {experience.compensation && experience.compensation > 0 && (
                  <div className="flex items-center gap-2 bg-green-900/20 px-3 py-2 rounded-lg text-green-400">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-semibold">₹{experience.compensation.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {experience.totalRounds && (
                  <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 rounded-lg text-zinc-300">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>{experience.totalRounds} rounds</span>
                  </div>
                )}
                {experience.isVerified && (
                  <div className="flex items-center gap-2 bg-green-900/20 px-3 py-2 rounded-lg text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

            {experience.keyTips && experience.keyTips.length > 0 && (
              <div className="relative bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl p-5">
                <div className="absolute -left-2 -top-2 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-purple-400 text-lg">💡</span>
                </div>
                <h3 className="font-bold text-purple-400 text-lg mb-3">Key Tips</h3>
                <ul className="space-y-2">
                  {experience.keyTips.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-zinc-300">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isLocked ? (
              <Card className="relative overflow-hidden border-zinc-700/50 bg-zinc-800/30">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 to-purple-900/10" />
                  <CardContent className="relative flex flex-col items-center justify-center p-6 sm:p-10 md:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-900/30 flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Unlock the Full Experience</h3>
                  <p className="text-sm sm:text-base text-zinc-400 mb-6 max-w-md">
                    This is a premium experience. Upgrade to access round-by-round details, technical questions, and tips.
                  </p>
                  {!userId ? (
                    <Button 
                      onClick={() => router.push("/sign-in")} 
                      className="bg-purple-600 hover:bg-purple-700 text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 w-full sm:w-auto"
                    >
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Sign In to Unlock - ₹99/yr
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleUpgrade}
                      disabled={upgradeLoading}
                      className="bg-yellow-600 hover:bg-yellow-700 text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 w-full sm:w-auto"
                    >
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {upgradeLoading ? "Processing..." : "Upgrade to Premium - ₹99/yr"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {rounds.length > 0 ? (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </span>
                      Interview Rounds
                    </h2>
                    {rounds.map((round: any, index: number) => (
                      <Card key={index} className="border-zinc-700/50 bg-zinc-800/30 overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500" />
                        <CardHeader className="py-4 bg-zinc-800/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">
                                  {round.round_number}
                                </span>
                                {round.type}
                              </h3>
                              <p className="text-sm text-zinc-500 mt-1">
                                <span className="text-zinc-400">{round.duration_minutes} mins</span>
                                <span className="mx-2">•</span>
                                <span className="text-zinc-400">{round.platform || "N/A"}</span>
                                <span className="mx-2">•</span>
                                <span className={`${round.result === "Selected" ? "text-green-400" : "text-red-400"}`}>{round.result}</span>
                              </p>
                            </div>
                            <Badge variant="outline" className="text-zinc-400 border-zinc-600">{round.experience_rating || "N/A"}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="py-5 space-y-5">
                          {round.tips && (
                            <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4">
                              <p className="text-yellow-400 font-medium">{round.tips}</p>
                            </div>
                          )}

                          {round.technical_questions && round.technical_questions.length > 0 && (
                            <div>
                              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                <Code2 className="w-4 h-4 text-blue-400" />
                                Technical Questions
                              </h4>
                              <div className="space-y-3">
                                {round.technical_questions.map((q: any, i: number) => (
                                  <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 hover:border-purple-500/30 transition-colors">
                                    <p className="text-sm font-medium text-white">{q.question}</p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {q.difficulty && (
                                        <Badge variant="secondary" className="text-xs bg-zinc-700 text-zinc-300">{q.difficulty}</Badge>
                                      )}
                                      {q.topics && q.topics.map((topic: string, j: number) => (
                                        <Badge key={j} variant="outline" className="text-xs text-zinc-400 border-zinc-600">{topic}</Badge>
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
                                      <p className="text-sm text-zinc-400 mt-3 pt-3 border-t border-zinc-700">
                                        <span className="font-medium text-green-400">Solution:</span> {q.solution}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {round.behavioral_questions && round.behavioral_questions.length > 0 && (
                            <div>
                              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-pink-400" />
                                Behavioral Questions
                              </h4>
                              <ul className="space-y-2">
                                {round.behavioral_questions.map((bq: any, i: number) => (
                                  <li key={i} className="flex items-start gap-2 text-zinc-400">
                                    <span className="text-pink-400 mt-1">•</span>
                                    <span className="text-sm">{typeof bq === 'string' ? bq : bq.question}</span>
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
                  <div className="space-y-6">
                    {experience.oaDetails && (
                      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-5">
                        <h3 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Code2 className="w-4 h-4 text-blue-400" />
                          </span>
                          OA Details
                        </h3>
                        <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{experience.oaDetails}</p>
                      </div>
                    )}

                    {experience.round1 && (
                      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-5">
                        <h3 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                            1
                          </span>
                          Round 1
                        </h3>
                        <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{experience.round1}</p>
                      </div>
                    )}

                    {experience.round2 && (
                      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-5">
                        <h3 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                            2
                          </span>
                          Round 2
                        </h3>
                        <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{experience.round2}</p>
                      </div>
                    )}

                    {experience.round3 && (
                      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-5">
                        <h3 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                            3
                          </span>
                          Round 3
                        </h3>
                        <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{experience.round3}</p>
                      </div>
                    )}
                  </div>
                )}

                {experience.tips && (
                  <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-xl p-5">
                    <h3 className="font-bold text-green-400 text-lg mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </span>
                      Tips
                    </h3>
                    <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{experience.tips}</p>
                  </div>
                )}
              </>
            )}

            {experience.mistakesToAvoid && experience.mistakesToAvoid.length > 0 && (
              <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-500/20 rounded-xl p-5">
                <h3 className="font-bold text-red-400 text-lg mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    ⚠️
                  </span>
                  Mistakes to Avoid
                </h3>
                <ul className="space-y-2">
                  {experience.mistakesToAvoid.map((mistake: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-zinc-300">
                      <span className="text-red-400 mt-1">✕</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-8 border-t border-zinc-800/50">
              <Button 
                onClick={() => {
                  if (!userId) {
                    router.push("/sign-in");
                    return;
                  }
                  upvote({ experienceId: experience._id, userEmail: userId });
                }} 
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Upvote ({experience.upvotes || 0})
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (!userId) {
                    router.push("/sign-in");
                    return;
                  }
                  toggleSave({ experienceId: experience._id, userEmail: userId });
                }} 
                className="border-zinc-600 text-white hover:bg-zinc-800 px-5 py-2.5"
              >
                <Bookmark className={`w-4 h-4 mr-2 ${saved ? "fill-current text-blue-400" : ""}`} />
                {saved ? "Saved" : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}