"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { BRANCHES, DIFFICULTIES } from "@/lib/utils";
import { Plus, X, ArrowLeft, ArrowRight, Save, HelpCircle, Code, MessageSquare, Trash, Star, MapPin, Building, Calendar, Wallet } from "lucide-react";
import { useToast } from "./toast-modal";
import { useRouter } from "next/navigation";

interface SubmitFormProps {
  onSuccess?: () => void;
}

interface TechQuestion {
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  leetcode_url: string;
  solution: string;
}

interface RoundDetail {
  round_number: number;
  type: string;
  duration_minutes: number;
  platform: string;
  result: "Selected" | "Rejected" | "N/A";
  experience_rating: "Easy" | "Medium" | "Hard";
  tips: string;
  technical_questions: TechQuestion[];
  behavioral_questions: { question: string }[];
}

export default function SubmitForm({ onSuccess }: SubmitFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    roleTitle: "",
    opportunityType: "internship" as "internship" | "fulltime",
    branch: "CSE",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    difficulty: "medium" as "easy" | "medium" | "hard",
    isAnonymous: false,
    compensation: 0,
    location: "",
    workMode: "office" as "office" | "remote" | "hybrid",
    duration: "",
    finalResult: "Selected" as "Selected" | "Rejected" | "N/A",
    tips: "",
    experienceNarrative: "",
    keyTips: [] as string[],
    mistakesToAvoid: [] as string[],
    tags: [] as string[],
    rounds: [] as RoundDetail[],
  });

  const [newKeyTip, setNewKeyTip] = useState("");
  const [newMistake, setNewMistake] = useState("");
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for adding a round
  const [showAddRoundModal, setShowAddRoundModal] = useState(false);
  const [currentRoundData, setCurrentRoundData] = useState<RoundDetail>({
    round_number: 1,
    type: "Coding Round",
    duration_minutes: 60,
    platform: "",
    result: "Selected",
    experience_rating: "Medium",
    tips: "",
    technical_questions: [],
    behavioral_questions: [],
  });

  // Technical Question Input State (within Round Builder)
  const [currentTechQuestion, setCurrentTechQuestion] = useState<TechQuestion>({
    question: "",
    difficulty: "Medium",
    topics: [],
    leetcode_url: "",
    solution: "",
  });
  const [newTopic, setNewTopic] = useState("");

  // Behavioral Question Input State (within Round Builder)
  const [newBehavioralQuestion, setNewBehavioralQuestion] = useState("");

  const submit = useMutation(api.experiences.submit);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addKeyTip = () => {
    if (newKeyTip.trim() && !formData.keyTips.includes(newKeyTip.trim())) {
      updateField("keyTips", [...formData.keyTips, newKeyTip.trim()]);
      setNewKeyTip("");
    }
  };

  const removeKeyTip = (index: number) => {
    updateField("keyTips", formData.keyTips.filter((_, i) => i !== index));
  };

  const addMistake = () => {
    if (newMistake.trim() && !formData.mistakesToAvoid.includes(newMistake.trim())) {
      updateField("mistakesToAvoid", [...formData.mistakesToAvoid, newMistake.trim()]);
      setNewMistake("");
    }
  };

  const removeMistake = (index: number) => {
    updateField("mistakesToAvoid", formData.mistakesToAvoid.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateField("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    updateField("tags", formData.tags.filter((_, i) => i !== index));
  };

  // Add round to formData
  const saveRound = () => {
    if (!currentRoundData.type.trim()) {
      showToast("error", "Validation Error", "Round name/type is required");
      return;
    }
    const nextRounds = [...formData.rounds];
    const newRoundNumber = nextRounds.length + 1;
    nextRounds.push({
      ...currentRoundData,
      round_number: newRoundNumber,
    });
    updateField("rounds", nextRounds);
    // Reset round modal data
    setCurrentRoundData({
      round_number: newRoundNumber + 1,
      type: "Coding Round",
      duration_minutes: 60,
      platform: "",
      result: "Selected",
      experience_rating: "Medium",
      tips: "",
      technical_questions: [],
      behavioral_questions: [],
    });
    setShowAddRoundModal(false);
    showToast("success", "Round Added", `Interview Round added successfully!`);
  };

  const removeRound = (index: number) => {
    const updated = formData.rounds.filter((_, i) => i !== index).map((r, i) => ({
      ...r,
      round_number: i + 1,
    }));
    updateField("rounds", updated);
  };

  // Add Technical Question to the Round currently being built
  const addTechQuestionToRound = () => {
    if (!currentTechQuestion.question.trim()) {
      showToast("error", "Validation Error", "Question text is required");
      return;
    }
    setCurrentRoundData(prev => ({
      ...prev,
      technical_questions: [...prev.technical_questions, currentTechQuestion],
    }));
    setCurrentTechQuestion({
      question: "",
      difficulty: "Medium",
      topics: [],
      leetcode_url: "",
      solution: "",
    });
    setNewTopic("");
  };

  const removeTechQuestionFromRound = (qIndex: number) => {
    setCurrentRoundData(prev => ({
      ...prev,
      technical_questions: prev.technical_questions.filter((_, i) => i !== qIndex),
    }));
  };

  const addTopicToTechQuestion = () => {
    if (newTopic.trim() && !currentTechQuestion.topics.includes(newTopic.trim())) {
      setCurrentTechQuestion(prev => ({
        ...prev,
        topics: [...prev.topics, newTopic.trim()],
      }));
      setNewTopic("");
    }
  };

  const removeTopicFromTechQuestion = (topic: string) => {
    setCurrentTechQuestion(prev => ({
      ...prev,
      topics: prev.topics.filter((t) => t !== topic),
    }));
  };

  // Add Behavioral Question to the Round currently being built
  const addBehavioralQuestionToRound = () => {
    if (!newBehavioralQuestion.trim()) return;
    setCurrentRoundData(prev => ({
      ...prev,
      behavioral_questions: [...prev.behavioral_questions, { question: newBehavioralQuestion.trim() }],
    }));
    setNewBehavioralQuestion("");
  };

  const removeBehavioralQuestionFromRound = (qIndex: number) => {
    setCurrentRoundData(prev => ({
      ...prev,
      behavioral_questions: prev.behavioral_questions.filter((_, i) => i !== qIndex),
    }));
  };

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      showToast("error", "Missing Information", "Company Name is required");
      return false;
    }
    if (!formData.roleTitle.trim()) {
      showToast("error", "Missing Information", "Role Title is required");
      return false;
    }
    if (!formData.tips.trim()) {
      showToast("error", "Missing Information", "General tips / advice is required");
      return false;
    }
    if (formData.rounds.length === 0) {
      showToast("error", "Missing Details", "Please add at least one interview round details.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const totalRounds = formData.rounds.length;
      const roundsJson = JSON.stringify(formData.rounds);
      
      const questionsAsked: string[] = [];
      formData.rounds.forEach((r) => {
        r.technical_questions.forEach((q) => {
          if (q.question) questionsAsked.push(q.question);
        });
        r.behavioral_questions.forEach((q) => {
          if (q.question) questionsAsked.push(q.question);
        });
      });

      // legacy flat-fields for compatibility
      let round1 = "";
      let round2 = "";
      let round3 = "";
      let hrRound = "";
      let oaDetails = "";

      formData.rounds.forEach((r) => {
        const typeLower = r.type.toLowerCase();
        const desc = `${r.type} (${r.duration_minutes} mins on ${r.platform || "N/A"}): ${r.tips || ""}`;
        if (typeLower.includes("online assessment") || typeLower.includes("oa") || typeLower.includes("written")) {
          oaDetails = desc;
        } else if (typeLower.includes("hr")) {
          hrRound = desc;
        } else if (r.round_number === 1) {
          round1 = desc;
        } else if (r.round_number === 2) {
          round2 = desc;
        } else if (r.round_number === 3) {
          round3 = desc;
        }
      });

      await submit({
        companyName: formData.companyName,
        roleTitle: formData.roleTitle,
        opportunityType: formData.opportunityType,
        branch: formData.branch,
        year: formData.year,
        month: formData.month,
        difficulty: formData.difficulty,
        isAnonymous: formData.isAnonymous,
        compensation: formData.compensation || undefined,
        location: formData.location || undefined,
        workMode: formData.workMode || undefined,
        duration: formData.duration || undefined,
        totalRounds: totalRounds,
        roundsJson: roundsJson,
        keyTips: formData.keyTips,
        mistakesToAvoid: formData.mistakesToAvoid,
        tags: formData.tags,
        finalResult: formData.finalResult,
        experienceNarrative: formData.experienceNarrative || undefined,
        questionsAsked: questionsAsked,
        tips: formData.tips,
        oaDetails: oaDetails || undefined,
        round1: round1 || undefined,
        round2: round2 || undefined,
        round3: round3 || undefined,
        hrRound: hrRound || undefined,
      });

      showToast("success", "Success!", "Interview experience submitted successfully for moderation.");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/browse");
      }
    } catch (error: any) {
      console.error("Failed to submit:", error);
      showToast("error", "Submission Failed", error.message || "An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between max-w-md mx-auto mb-10">
        {[
          { num: 1, label: "Details" },
          { num: 2, label: "Rounds" },
          { num: 3, label: "Advice" },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center relative flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all duration-300 ${
                step === s.num
                  ? "border-[#F97316] bg-[#1C0F02] text-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                  : step > s.num
                  ? "border-emerald-500 bg-emerald-950/20 text-emerald-500"
                  : "border-zinc-800 bg-zinc-950 text-zinc-500"
              }`}
            >
              {s.num}
            </div>
            <span
              className={`text-xs mt-2 font-semibold ${
                step === s.num ? "text-white" : "text-zinc-550"
              }`}
            >
              {s.label}
            </span>
            {s.num < 3 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 ${
                  step > s.num ? "bg-emerald-500/40" : "bg-zinc-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="bg-[#0F0F11]/60 backdrop-blur border border-zinc-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500/0 via-orange-500/40 to-orange-500/0" />
        
        <CardHeader className="border-b border-zinc-900 pb-6">
          <CardTitle className="text-2xl font-extrabold text-white flex items-center gap-2">
            Share Interview Experience
          </CardTitle>
          <CardDescription className="text-zinc-500 text-sm">
            Provide detailed, round-wise placement insights to empower junior PSG college students.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* STEP 1: General Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-zinc-500" /> Company Name *
                  </Label>
                  <Input
                    className="bg-zinc-950/80 border-zinc-900 text-white placeholder-zinc-650 focus:border-[#F97316] transition-colors"
                    value={formData.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    placeholder="e.g., Google, Amazon, Microsoft"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-zinc-500" /> Role Title *
                  </Label>
                  <Input
                    className="bg-zinc-950/80 border-zinc-900 text-white placeholder-zinc-650 focus:border-[#F97316] transition-colors"
                    value={formData.roleTitle}
                    onChange={(e) => updateField("roleTitle", e.target.value)}
                    placeholder="e.g., SDE Intern, Frontend Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">Opportunity Type *</Label>
                  <Select
                    value={formData.opportunityType}
                    onValueChange={(v) => updateField("opportunityType", v)}
                  >
                    <SelectTrigger className="bg-zinc-950/80 border-zinc-900 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-900 text-white">
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="fulltime">Full Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">Branch *</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(v) => updateField("branch", v)}
                  >
                    <SelectTrigger className="bg-zinc-950/80 border-zinc-900 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-900 text-white">
                      {BRANCHES.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">Final Outcome *</Label>
                  <Select
                    value={formData.finalResult}
                    onValueChange={(v) => updateField("finalResult", v)}
                  >
                    <SelectTrigger className="bg-zinc-950/80 border-zinc-900 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-900 text-white">
                      <SelectItem value="Selected">Selected / Offer</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-zinc-500" /> Year *
                  </Label>
                  <Input
                    type="number"
                    className="bg-zinc-950/80 border-zinc-900 text-white"
                    value={formData.year}
                    onChange={(e) => updateField("year", parseInt(e.target.value) || new Date().getFullYear())}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">Month *</Label>
                  <Select
                    value={String(formData.month)}
                    onValueChange={(v) => updateField("month", parseInt(v))}
                  >
                    <SelectTrigger className="bg-zinc-950/80 border-zinc-900 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-900 text-white">
                      {[
                        "January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"
                      ].map((m, idx) => (
                        <SelectItem key={idx} value={String(idx + 1)}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-zinc-500" /> Compensation (LPA)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 14.5"
                    className="bg-zinc-950/80 border-zinc-900 text-white"
                    onChange={(e) => updateField("compensation", Math.round(parseFloat(e.target.value) * 100000) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-zinc-500" /> Location
                  </Label>
                  <Input
                    className="bg-zinc-950/80 border-zinc-900 text-white placeholder-zinc-650"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="e.g. Bangalore, Remote"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">Work Mode</Label>
                  <Select
                    value={formData.workMode}
                    onValueChange={(v) => updateField("workMode", v)}
                  >
                    <SelectTrigger className="bg-zinc-950/80 border-zinc-900 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-900 text-white">
                      <SelectItem value="office">In Office</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">Duration</Label>
                  <Input
                    className="bg-zinc-950/80 border-zinc-900 text-white placeholder-zinc-650"
                    value={formData.duration}
                    onChange={(e) => updateField("duration", e.target.value)}
                    placeholder="e.g. 6 Months, Permanent"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => setStep(2)}
                  className="w-full bg-[#F97316] hover:bg-[#EA580C] text-black font-extrabold flex items-center justify-center gap-2"
                >
                  Next: Interview Rounds <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Interview Rounds */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Rounds & Phases</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">Define each interview stage, from OAs to HR rounds.</p>
                </div>
                <Button
                  onClick={() => setShowAddRoundModal(true)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1.5 text-xs py-1 h-8"
                >
                  <Plus className="w-3.5 h-3.5 text-[#F97316]" /> Add Round
                </Button>
              </div>

              {formData.rounds.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-zinc-900 rounded-xl">
                  <HelpCircle className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-400 text-sm font-semibold">No rounds added yet</p>
                  <p className="text-zinc-600 text-xs mt-1">Please add at least one round (e.g. Online Assessment or Technical Round).</p>
                  <Button
                    onClick={() => setShowAddRoundModal(true)}
                    className="mt-4 bg-[#F97316] hover:bg-[#EA580C] text-black font-bold text-xs"
                  >
                    Add Your First Round
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.rounds.map((round, idx) => (
                    <div
                      key={idx}
                      className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-5 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 h-full w-[3px] bg-[#F97316]" />
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-xs font-black text-[#F97316]">
                              {round.round_number}
                            </span>
                            <h4 className="font-extrabold text-white">{round.type}</h4>
                            <span className="text-xs text-zinc-500">({round.duration_minutes} mins)</span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1 pl-8">
                            Platform: <span className="text-zinc-400 font-medium">{round.platform || "N/A"}</span> • Difficulty: <span className="text-zinc-400 font-medium">{round.experience_rating}</span> • Outcome: <span className="text-emerald-500 font-semibold">{round.result}</span>
                          </p>
                          {round.tips && (
                            <p className="text-sm text-zinc-400 mt-3 pl-8 italic">"{round.tips}"</p>
                          )}
                          
                          {/* Questions count */}
                          <div className="flex gap-4 mt-3 pl-8 text-xs text-zinc-500 font-semibold">
                            <span>💻 {round.technical_questions.length} Tech Question{round.technical_questions.length !== 1 && 's'}</span>
                            <span>💬 {round.behavioral_questions.length} Behavioral Question{round.behavioral_questions.length !== 1 && 's'}</span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          onClick={() => removeRound(idx)}
                          className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Round Dialog / Builder */}
              {showAddRoundModal && (
                <div className="border border-zinc-800 bg-[#0F0F11] rounded-xl p-6 space-y-5 shadow-lg shadow-black/40">
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                    <h4 className="font-bold text-white text-lg">Interview Round Builder</h4>
                    <Button
                      variant="ghost"
                      onClick={() => setShowAddRoundModal(false)}
                      className="h-7 w-7 p-0 text-zinc-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-semibold">Round Type / Name *</Label>
                      <Input
                        value={currentRoundData.type}
                        onChange={(e) => setCurrentRoundData({ ...currentRoundData, type: e.target.value })}
                        placeholder="e.g. Online Assessment, Coding Round 1, System Design, HR"
                        className="bg-zinc-950/80 border-zinc-900 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-semibold">Duration (Minutes)</Label>
                      <Input
                        type="number"
                        value={currentRoundData.duration_minutes}
                        onChange={(e) => setCurrentRoundData({ ...currentRoundData, duration_minutes: parseInt(e.target.value) || 0 })}
                        className="bg-zinc-950/80 border-zinc-900 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-semibold">Platform / Mode</Label>
                      <Input
                        value={currentRoundData.platform}
                        onChange={(e) => setCurrentRoundData({ ...currentRoundData, platform: e.target.value })}
                        placeholder="e.g. HackerRank, CodeSandbox, Zoom"
                        className="bg-zinc-950/80 border-zinc-900 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-semibold">Round Difficulty</Label>
                      <Select
                        value={currentRoundData.experience_rating}
                        onValueChange={(v: any) => setCurrentRoundData({ ...currentRoundData, experience_rating: v })}
                      >
                        <SelectTrigger className="bg-zinc-950/80 border-zinc-900 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-900 text-white">
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-300 font-semibold">Round Outcome</Label>
                      <Select
                        value={currentRoundData.result}
                        onValueChange={(v: any) => setCurrentRoundData({ ...currentRoundData, result: v })}
                      >
                        <SelectTrigger className="bg-zinc-950/80 border-zinc-900 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-900 text-white">
                          <SelectItem value="Selected">Passed / Selected</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                          <SelectItem value="N/A">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300 font-semibold">Round Tips</Label>
                    <Textarea
                      value={currentRoundData.tips}
                      onChange={(e) => setCurrentRoundData({ ...currentRoundData, tips: e.target.value })}
                      placeholder="e.g. Focus on sliding window problems; review time complexities of your solutions"
                      className="bg-zinc-950/80 border-zinc-900 text-white min-h-[70px]"
                    />
                  </div>

                  {/* Dynamic Technical Questions Section within Round */}
                  <div className="border border-zinc-900 bg-zinc-950/50 p-4 rounded-lg space-y-4">
                    <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-[#F97316]" /> Add Technical Questions Asked
                    </h5>
                    
                    {currentRoundData.technical_questions.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {currentRoundData.technical_questions.map((tq, qIdx) => (
                          <div key={qIdx} className="bg-zinc-900/60 p-3 rounded border border-zinc-850 flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white font-medium">{tq.question}</p>
                              <div className="flex gap-2 mt-1.5 flex-wrap">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-350">{tq.difficulty}</span>
                                {tq.topics.map((tp, tpIdx) => (
                                  <span key={tpIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-orange-950/30 text-[#F97316]/80">{tp}</span>
                                ))}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              onClick={() => removeTechQuestionFromRound(qIdx)}
                              className="h-6 w-6 p-0 text-zinc-500 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-400">Question Text</Label>
                        <Input
                          value={currentTechQuestion.question}
                          onChange={(e) => setCurrentTechQuestion({ ...currentTechQuestion, question: e.target.value })}
                          placeholder="e.g. Find the longest palindromic substring"
                          className="bg-zinc-900 border-zinc-800 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-zinc-400">Difficulty</Label>
                          <Select
                            value={currentTechQuestion.difficulty}
                            onValueChange={(v: any) => setCurrentTechQuestion({ ...currentTechQuestion, difficulty: v })}
                          >
                            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-900 text-white">
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-zinc-400">LeetCode URL (Optional)</Label>
                          <Input
                            value={currentTechQuestion.leetcode_url}
                            onChange={(e) => setCurrentTechQuestion({ ...currentTechQuestion, leetcode_url: e.target.value })}
                            placeholder="https://leetcode.com/problems/..."
                            className="bg-zinc-900 border-zinc-800 text-white h-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-400">Topics / Tags</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder="e.g. Dynamic Programming, DFS"
                            className="bg-zinc-900 border-zinc-800 text-white h-9"
                          />
                          <Button type="button" onClick={addTopicToTechQuestion} className="bg-zinc-800 hover:bg-zinc-700 h-9">Add Topic</Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {currentTechQuestion.topics.map((t, idx) => (
                            <span key={idx} className="flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded text-xs text-zinc-350">
                              {t}
                              <button type="button" onClick={() => removeTopicFromTechQuestion(t)}>
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-400">Short Solution Description (Optional)</Label>
                        <Textarea
                          value={currentTechQuestion.solution}
                          onChange={(e) => setCurrentTechQuestion({ ...currentTechQuestion, solution: e.target.value })}
                          placeholder="Briefly describe the approach used (e.g. Two pointer method expansion from center)"
                          className="bg-zinc-900 border-zinc-800 text-white min-h-[60px]"
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={addTechQuestionToRound}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs py-1"
                      >
                        Add Tech Question to Round
                      </Button>
                    </div>
                  </div>

                  {/* Behavioral Questions Section within Round */}
                  <div className="border border-zinc-900 bg-zinc-950/50 p-4 rounded-lg space-y-3">
                    <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#F97316]" /> Add Behavioral Questions Asked
                    </h5>

                    {currentRoundData.behavioral_questions.length > 0 && (
                      <ul className="space-y-1.5 mb-2 pl-4 list-disc text-sm text-zinc-350">
                        {currentRoundData.behavioral_questions.map((bq, bqIdx) => (
                          <li key={bqIdx} className="flex items-center justify-between">
                            <span>{bq.question}</span>
                            <button
                              type="button"
                              onClick={() => removeBehavioralQuestionFromRound(bqIdx)}
                              className="text-zinc-550 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex gap-2">
                      <Input
                        value={newBehavioralQuestion}
                        onChange={(e) => setNewBehavioralQuestion(e.target.value)}
                        placeholder="e.g. Tell me about a time you resolved conflict in a team"
                        className="bg-zinc-900 border-zinc-800 text-white"
                      />
                      <Button type="button" onClick={addBehavioralQuestionToRound} className="bg-zinc-800 hover:bg-zinc-700">Add</Button>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddRoundModal(false)}
                      className="flex-1 border-zinc-800 hover:bg-zinc-900 text-zinc-400"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveRound}
                      className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-black font-bold"
                    >
                      Save Round Detail
                    </Button>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-zinc-900 hover:bg-zinc-950 text-zinc-400"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={formData.rounds.length === 0}
                  className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-black font-extrabold flex items-center justify-center gap-2"
                >
                  Next: Advice & Tips <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Advice & Tips */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-zinc-300 font-semibold">General Interview Advice *</Label>
                <Textarea
                  value={formData.tips}
                  onChange={(e) => updateField("tips", e.target.value)}
                  placeholder="Share a general overview of your placement process, strategies, and key learnings..."
                  className="bg-zinc-950/80 border-zinc-900 text-white min-h-[120px] focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300 font-semibold">Overall Narrative / Experience Summary</Label>
                <Textarea
                  value={formData.experienceNarrative}
                  onChange={(e) => updateField("experienceNarrative", e.target.value)}
                  placeholder="Describe your emotional journey, standard schedule, or company specific tips..."
                  className="bg-zinc-950/80 border-zinc-900 text-white min-h-[100px] focus:border-[#F97316]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">Key Preparation Tips</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newKeyTip}
                      onChange={(e) => setNewKeyTip(e.target.value)}
                      placeholder="e.g. Solve at least 300 Leetcode questions"
                      className="bg-zinc-950/80 border-zinc-900 text-white"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyTip())}
                    />
                    <Button type="button" onClick={addKeyTip} size="icon" className="bg-zinc-900 border border-zinc-800 text-[#F97316]">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {formData.keyTips.map((t, i) => (
                      <div key={i} className="flex items-center justify-between bg-zinc-900/40 border border-zinc-950 px-3 py-1.5 rounded text-sm text-zinc-300">
                        <span>{t}</span>
                        <button type="button" onClick={() => removeKeyTip(i)} className="text-zinc-550 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">Mistakes to Avoid</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newMistake}
                      onChange={(e) => setNewMistake(e.target.value)}
                      placeholder="e.g. Neglecting OS/DBMS fundamentals"
                      className="bg-zinc-950/80 border-zinc-900 text-white"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMistake())}
                    />
                    <Button type="button" onClick={addMistake} size="icon" className="bg-zinc-900 border border-zinc-800 text-[#F97316]">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {formData.mistakesToAvoid.map((m, i) => (
                      <div key={i} className="flex items-center justify-between bg-zinc-900/40 border border-zinc-950 px-3 py-1.5 rounded text-sm text-zinc-300">
                        <span>{m}</span>
                        <button type="button" onClick={() => removeMistake(i)} className="text-zinc-550 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">Search Tags / Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="e.g. React, Docker, System Design"
                      className="bg-zinc-950/80 border-zinc-900 text-white"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="icon" className="bg-zinc-900 border border-zinc-800 text-[#F97316]">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.tags.map((tag, i) => (
                      <span key={i} className="flex items-center gap-1 bg-zinc-900 px-2.5 py-1 rounded-full text-xs text-zinc-350 border border-zinc-850">
                        {tag}
                        <button type="button" onClick={() => removeTag(i)} className="text-zinc-550 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 font-semibold">Interview Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(v: any) => updateField("difficulty", v)}
                  >
                    <SelectTrigger className="bg-zinc-950/80 border-zinc-900 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-900 text-white">
                      {DIFFICULTIES.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d.charAt(0).toUpperCase() + d.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => updateField("isAnonymous", e.target.checked)}
                  className="w-4 h-4 border-zinc-800 bg-zinc-950 accent-[#F97316] rounded"
                />
                <Label htmlFor="anonymous" className="text-sm text-zinc-300 cursor-pointer">
                  Submit this experience anonymously
                </Label>
              </div>

              <div className="pt-4 flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 border-zinc-900 hover:bg-zinc-950 text-zinc-400"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-black font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-orange-600/10"
                >
                  <Save className="w-4 h-4 text-black stroke-[3]" />
                  {isSubmitting ? "Submitting..." : "Submit Experience"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}