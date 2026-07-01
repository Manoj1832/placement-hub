"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { use, useState, useEffect } from "react";
import { ThumbsUp, Bookmark, CheckCircle, CheckCircle2, MapPin, Briefcase, Clock, Lock, Crown, ExternalLink, Code2, Users, ArrowLeft, Lightbulb, AlertTriangle, XCircle, Circle, Check } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { useToast } from "@/components/toast-modal";
import CompanyLogo from "@/components/company-logo";

export default function ExperienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const experienceId = id as Id<"experiences">;
  const { isLoaded, user: sessionUser } = useUser();
  const router = useRouter();
  const userId = sessionUser?.primaryEmailAddress?.emailAddress as string | undefined;
  const experience = useQuery(api.experiences.getById, { 
    id: experienceId,
    userEmail: userId || undefined,
  });
  const upvote = useMutation(api.experiences.upvote);
  const toggleSave = useMutation(api.experiences.save);
  const saved = useQuery(api.experiences.isSaved, { 
    experienceId, 
    userEmail: userId || ""
  });
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isFreeLimitExceeded, setIsFreeLimitExceeded] = useState(false);
  const { showToast } = useToast();

  // Sync user to Convex and check premium status when session is available
  useEffect(() => {
    if (isLoaded && userId) {
      // Ensure user exists in Convex
      fetch("/api/user/sync", { method: "POST" }).catch(console.error);

      // Check premium status
      fetch("/api/user/sync")
        .then((res) => res.json())
        .then((data) => setIsPremiumUser(data.isPremium))
        .catch(console.error);
    }
  }, [isLoaded, userId]);

  // Track unique viewed experiences to enforce free limit
  useEffect(() => {
    if (isLoaded && experience) {
      if (isPremiumUser) {
        setIsFreeLimitExceeded(false);
        return;
      }

      try {
        const viewed = JSON.parse(localStorage.getItem("viewed_experiences") || "[]");
        if (viewed.includes(experienceId)) {
          setIsFreeLimitExceeded(false);
        } else if (viewed.length >= 3) {
          setIsFreeLimitExceeded(true);
        } else {
          const newViewed = [...viewed, experienceId];
          localStorage.setItem("viewed_experiences", JSON.stringify(newViewed));
          setIsFreeLimitExceeded(false);
        }
      } catch (e) {
        console.error("Failed to check free limit:", e);
      }
    }
  }, [isLoaded, experience, experienceId, isPremiumUser]);

  const handleUpgrade = async () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (isPremiumUser) {
      showToast("info", "Already Premium", "You are already a Premium member!");
      return;
    }

    try {
      setUpgradeLoading(true);

      // 1. Create Razorpay order via our API
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "premium_3months" }),
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
        key: data.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "PSG Placement Hub",
        description: data.description || "Premium Access — 3 Months",
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
                productId: "premium_3months",
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setIsPremiumUser(true);
              showToast("success", "Payment Successful!", "You now have Premium access for 3 months.");
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
          name: sessionUser?.fullName || "",
        },
        theme: { color: "#F97316" },
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
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
      <div className="text-zinc-500 text-sm">Loading...</div>
    </div>
  );

  if (experience === null) return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
      <div className="text-center">
        <p className="text-zinc-400 text-base font-semibold">Experience not found</p>
        <Link href="/browse" className="text-zinc-500 hover:text-white mt-2 inline-block text-sm transition-colors">
          Back to browse
        </Link>
      </div>
    </div>
  );

  const isLocked = (experience.accessLevel === "limited" && !isPremiumUser) || isFreeLimitExceeded;

  let rounds: any[] = [];
  try {
    if (experience.roundsJson) {
      rounds = JSON.parse(experience.roundsJson);
    }
  } catch (e) {
    console.error("Failed to parse rounds:", e);
  }

  const difficultyColors: Record<string, string> = {
    easy: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    medium: "bg-amber-950/40 text-amber-400 border-amber-900/50",
    hard: "bg-rose-950/40 text-rose-400 border-rose-900/50",
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="min-h-screen bg-[#09090B]">
      <Header />

      <div className="container mx-auto px-6 py-4 border-b border-zinc-900">
        <button
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/browse");
            }
          }}
          className="text-xs text-zinc-550 hover:text-white inline-flex items-center bg-transparent border-0 cursor-pointer p-0 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to experiences
        </button>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="relative">
          <Card className="relative bg-[#0F0F11]/60 border border-zinc-900 rounded-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#F97316]/0 via-[#F97316]/40 to-[#F97316]/0" />
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <CompanyLogo companyName={experience.companyName} size="lg" />
                  <div>
                    <CardTitle className="text-3xl font-extrabold text-white">{experience.companyName}</CardTitle>
                    <p className="text-xl text-zinc-400 mt-1 font-semibold">{experience.roleTitle}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {experience.opportunityType && (
                    <Badge className="bg-zinc-900 text-zinc-300 border border-zinc-800">{experience.opportunityType}</Badge>
                  )}
                  {experience.difficulty && (
                    <Badge variant="outline" className={difficultyColors[experience.difficulty.toLowerCase()] || ""}>
                      {experience.difficulty}
                    </Badge>
                  )}
                  {experience.isPremium && !experience.isFreePreview && (
                    <Badge className="bg-amber-950/60 text-amber-400 border border-amber-900/50">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {experience.isFreePreview && (
                    <Badge className="bg-[#1C0F02] text-[#F97316] border border-orange-950/40">FREE</Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4 text-sm">
                {experience.year && (
                  <div className="flex items-center gap-2 bg-zinc-900/60 px-3 py-2 rounded-lg text-zinc-300 border border-zinc-900">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span>{experience.month ? `${monthNames[experience.month - 1]} ${experience.year}` : experience.year}</span>
                  </div>
                )}
                {experience.location && (
                  <div className="flex items-center gap-2 bg-zinc-900/60 px-3 py-2 rounded-lg text-zinc-300 border border-zinc-900">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                    <span>{experience.location}</span>
                  </div>
                )}
                {experience.compensation && experience.compensation > 0 && (
                  <div className="flex items-center gap-2 bg-zinc-900/60 px-3 py-2 rounded-lg text-white border border-zinc-900 font-semibold">
                    <Briefcase className="w-4 h-4 text-zinc-500" />
                    <span>₹{experience.compensation.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {experience.totalRounds && (
                  <div className="flex items-center gap-2 bg-zinc-900/60 px-3 py-2 rounded-lg text-zinc-300 border border-zinc-900">
                    <Users className="w-4 h-4 text-zinc-500" />
                    <span>{experience.totalRounds} rounds</span>
                  </div>
                )}
                {experience.isVerified && (
                  <div className="flex items-center gap-2 bg-emerald-950/40 px-3 py-2 rounded-lg text-emerald-400 border border-emerald-900/40">
                    <CheckCircle className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {experience.keyTips && experience.keyTips.length > 0 && (
                <div className="relative bg-[#1C0F02]/40 border border-orange-950/40 rounded-xl p-5">
                  <div className="absolute -left-2 -top-2 w-8 h-8 bg-[#1C0F02] border border-orange-950/60 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-[#F97316]" />
                  </div>
                  <h3 className="font-bold text-[#F97316] text-lg mb-3 pl-2">Key Tips</h3>
                  <ul className="space-y-2 pl-2">
                    {experience.keyTips.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-[#F97316]/80 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isLocked ? (
                <Card className="relative overflow-hidden border-zinc-800 bg-zinc-900/30 backdrop-blur rounded-xl">
                  <CardContent className="relative flex flex-col items-center justify-center p-6 sm:p-10 md:p-12 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1C0F02] border border-orange-950/60 flex items-center justify-center mb-6 shadow-md shadow-orange-950/10">
                      <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-[#F97316]" />
                    </div>
                    
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
                      {isFreeLimitExceeded ? "Free Experience Limit Reached" : "Unlock Premium Experience"}
                    </h3>
                    
                    <p className="text-sm sm:text-base text-zinc-400 mb-6 max-w-md leading-relaxed">
                      {isFreeLimitExceeded 
                        ? "You've successfully viewed 3 interview experiences today! Join 2,000+ PSG students who upgraded to Premium to unlock unlimited access to all 450+ experiences, company guides, and skill trees." 
                        : "This is a premium-tier interview experience containing detailed OA questions, exact coding patterns, and interview round tips. Upgrade now to unlock."}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left w-full max-w-lg mb-8 bg-zinc-950/40 p-5 rounded-xl border border-zinc-900">
                      <div className="flex items-center gap-2.5 text-sm text-zinc-300">
                        <div className="w-5 h-5 rounded-full bg-[#1C0F02] flex items-center justify-center shrink-0 border border-orange-950/30">
                          <Check className="w-3 h-3 text-[#F97316] font-bold" />
                        </div>
                        <span>450+ Interview Experiences</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-zinc-300">
                        <div className="w-5 h-5 rounded-full bg-[#1C0F02] flex items-center justify-center shrink-0 border border-orange-950/30">
                          <Check className="w-3 h-3 text-[#F97316] font-bold" />
                        </div>
                        <span>8+ Premium Company Guides</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-zinc-300">
                        <div className="w-5 h-5 rounded-full bg-[#1C0F02] flex items-center justify-center shrink-0 border border-orange-950/30">
                          <Check className="w-3 h-3 text-[#F97316] font-bold" />
                        </div>
                        <span>Advanced DSA Roadmaps</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-zinc-300">
                        <div className="w-5 h-5 rounded-full bg-[#1C0F02] flex items-center justify-center shrink-0 border border-orange-950/30">
                          <Check className="w-3 h-3 text-[#F97316] font-bold" />
                        </div>
                        <span>Specialized Role Skill Trees</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto">
                      {!userId ? (
                        <Button 
                          onClick={() => router.push("/sign-in?redirect_url=" + encodeURIComponent(window.location.pathname))} 
                          className="bg-[#F97316] hover:bg-[#EA580C] text-black font-extrabold text-sm sm:text-base px-8 py-3 rounded-lg w-full sm:w-auto"
                        >
                          <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-black" />
                          Sign In to Unlock — ₹149 / month
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleUpgrade}
                          disabled={upgradeLoading}
                          className="bg-[#F97316] hover:bg-[#EA580C] text-black font-extrabold text-sm sm:text-base px-8 py-3 rounded-lg w-full sm:w-auto"
                        >
                          <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-black" />
                          {upgradeLoading ? "Processing Securing Checkout..." : "Unlock Full Platform — ₹149 / month"}
                        </Button>
                      )}
                      <p className="text-center text-xs text-zinc-500 mt-4 flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-zinc-650" /> Powered by Razorpay Secure Checkout
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {rounds.length > 0 ? (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                        <span className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </span>
                        Interview Rounds
                      </h2>
                      {rounds.map((round: any, index: number) => (
                        <Card key={index} className="border-zinc-900 bg-zinc-900/20 overflow-hidden relative">
                          <div className="absolute top-0 left-0 w-[3px] h-full bg-[#F97316]" />
                          <CardHeader className="py-4 bg-[#0F0F11]/45 border-b border-zinc-900">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 text-[#F97316] flex items-center justify-center text-sm font-semibold">
                                    {round.round_number}
                                  </span>
                                  {round.type}
                                </h3>
                                <p className="text-sm text-zinc-500 mt-1">
                                  <span className="text-zinc-400">{round.duration_minutes} mins</span>
                                  <span className="mx-2">•</span>
                                  <span className="text-zinc-400">{round.platform || "N/A"}</span>
                                  <span className="mx-2">•</span>
                                  <span className={`${round.result === "Selected" ? "text-emerald-400" : "text-rose-400"}`}>{round.result}</span>
                                </p>
                              </div>
                              <Badge variant="outline" className="text-zinc-400 border-zinc-800">{round.experience_rating || "N/A"}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="py-5 space-y-5">
                            {round.tips && (
                              <div className="bg-[#1C0F02]/30 border border-orange-950/40 rounded-lg p-4">
                                <p className="text-[#F97316] font-semibold text-sm">{round.tips}</p>
                              </div>
                            )}

                            {round.technical_questions && round.technical_questions.length > 0 && (
                              <div>
                                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                  <Code2 className="w-4 h-4 text-[#F97316]" />
                                  Technical Questions
                                </h4>
                                <div className="space-y-3">
                                  {round.technical_questions.map((q: any, i: number) => (
                                    <div key={i} className="bg-[#0F0F11]/40 rounded-lg p-4 border border-zinc-900 hover:border-orange-500/20 transition-colors">
                                      <p className="text-sm font-medium text-white">{q.question}</p>
                                      <div className="flex flex-wrap gap-2 mt-3">
                                        {q.difficulty && (
                                          <Badge variant="secondary" className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300">{q.difficulty}</Badge>
                                        )}
                                        {q.topics && q.topics.map((topic: string, j: number) => (
                                          <Badge key={j} variant="outline" className="text-xs text-zinc-400 border-zinc-800">{topic}</Badge>
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
                                        <p className="text-sm text-zinc-400 mt-3 pt-3 border-t border-zinc-900">
                                          <span className="font-semibold text-emerald-400">Solution:</span> {q.solution}
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
                                  <Users className="w-4 h-4 text-[#F97316]" />
                                  Behavioral Questions
                                </h4>
                                <ul className="space-y-2">
                                  {round.behavioral_questions.map((bq: any, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-zinc-400">
                                      <Circle className="w-3 h-3 text-[#F97316] mt-1.5 flex-shrink-0" />
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
                        <div className="bg-[#0F0F11]/40 border border-zinc-900 rounded-xl p-5">
                          <h3 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                              <Code2 className="w-4 h-4 text-[#F97316]" />
                            </span>
                            OA Details
                          </h3>
                          <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{experience.oaDetails}</p>
                        </div>
                      )}

                      {experience.round1 && (
                        <div className="bg-[#0F0F11]/40 border border-zinc-900 rounded-xl p-5">
                          <h3 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-[#F97316] flex items-center justify-center text-sm font-semibold">
                              1
                            </span>
                            Round 1
                          </h3>
                          <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{experience.round1}</p>
                        </div>
                      )}

                      {experience.round2 && (
                        <div className="bg-[#0F0F11]/40 border border-zinc-900 rounded-xl p-5">
                          <h3 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-[#F97316] flex items-center justify-center text-sm font-semibold">
                              2
                            </span>
                            Round 2
                          </h3>
                          <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{experience.round2}</p>
                        </div>
                      )}

                      {experience.round3 && (
                        <div className="bg-[#0F0F11]/40 border border-zinc-900 rounded-xl p-5">
                          <h3 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-[#F97316] flex items-center justify-center text-sm font-semibold">
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
                    <div className="bg-emerald-950/15 border border-emerald-900/40 rounded-xl p-5">
                      <h3 className="font-bold text-emerald-400 text-lg mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-emerald-950/40 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </span>
                        Tips
                      </h3>
                      <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{experience.tips}</p>
                    </div>
                  )}
                </>
              )}

              {experience.mistakesToAvoid && experience.mistakesToAvoid.length > 0 && (
                <div className="bg-rose-950/15 border border-rose-900/40 rounded-xl p-5">
                  <h3 className="font-bold text-rose-400 text-lg mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-rose-950/40 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    </span>
                    Mistakes to Avoid
                  </h3>
                  <ul className="space-y-2">
                    {experience.mistakesToAvoid.map((mistake: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-zinc-300">
                        <XCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-8 border-t border-zinc-900">
                <Button 
                  onClick={() => {
                    if (!userId) {
                      router.push("/sign-in");
                      return;
                    }
                    upvote({ experienceId: experience._id });
                  }} 
                  className="bg-[#F97316] hover:bg-[#EA580C] text-black font-extrabold px-5 py-2.5 rounded-lg"
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
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-850 px-5 py-2.5 rounded-lg"
                >
                  <Bookmark className={`w-4 h-4 mr-2 ${saved ? "fill-current text-[#F97316]" : ""}`} />
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