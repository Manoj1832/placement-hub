"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { BRANCHES, DIFFICULTIES } from "@/lib/utils";
import { Plus, X } from "lucide-react";

interface SubmitFormProps {
  onSuccess?: () => void;
}

export default function SubmitForm({ onSuccess }: SubmitFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    roleTitle: "",
    opportunityType: "internship" as "internship" | "fulltime",
    branch: "CSE",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    oaDetails: "",
    round1: "",
    round2: "",
    round3: "",
    hrRound: "",
    questionsAsked: [] as string[],
    tips: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    isAnonymous: false,
  });
  const [newQuestion, setNewQuestion] = useState("");
  const submit = useMutation(api.experiences.submit);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      updateField("questionsAsked", [...formData.questionsAsked, newQuestion.trim()]);
      setNewQuestion("");
    }
  };

  const removeQuestion = (index: number) => {
    updateField(
      "questionsAsked",
      formData.questionsAsked.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async () => {
    try {
      await submit({
        ...formData,
        questionsAsked: formData.questionsAsked,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to submit:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Submit Interview Experience</CardTitle>
          <CardDescription>
            Share your placement experience to help junior students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    placeholder="e.g., Google, Amazon"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role Title *</Label>
                  <Input
                    value={formData.roleTitle}
                    onChange={(e) => updateField("roleTitle", e.target.value)}
                    placeholder="e.g., SDE Intern"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select
                    value={formData.opportunityType}
                    onValueChange={(v) => updateField("opportunityType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="fulltime">Full Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Branch *</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(v) => updateField("branch", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Year *</Label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => updateField("year", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Month *</Label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={formData.month}
                    onChange={(e) => updateField("month", parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full">
                Next: Round Details
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>OA Details</Label>
                <Textarea
                  value={formData.oaDetails}
                  onChange={(e) => updateField("oaDetails", e.target.value)}
                  placeholder="Describe the online assessment..."
                />
              </div>

              <div className="space-y-2">
                <Label>Round 1</Label>
                <Textarea
                  value={formData.round1}
                  onChange={(e) => updateField("round1", e.target.value)}
                  placeholder="Round 1 details..."
                />
              </div>

              <div className="space-y-2">
                <Label>Round 2</Label>
                <Textarea
                  value={formData.round2}
                  onChange={(e) => updateField("round2", e.target.value)}
                  placeholder="Round 2 details..."
                />
              </div>

              <div className="space-y-2">
                <Label>Round 3</Label>
                <Textarea
                  value={formData.round3}
                  onChange={(e) => updateField("round3", e.target.value)}
                  placeholder="Round 3 details..."
                />
              </div>

              <div className="space-y-2">
                <Label>HR Round</Label>
                <Textarea
                  value={formData.hrRound}
                  onChange={(e) => updateField("hrRound", e.target.value)}
                  placeholder="HR round details..."
                />
              </div>

              <div className="space-y-2">
                <Label>Questions Asked</Label>
                <div className="flex gap-2">
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Add a question..."
                    onKeyPress={(e) => e.key === "Enter" && addQuestion()}
                  />
                  <Button type="button" onClick={addQuestion} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.questionsAsked.map((q, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-full text-sm"
                    >
                      {q}
                      <button onClick={() => removeQuestion(i)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Next: Tips
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tips for Students *</Label>
                <Textarea
                  value={formData.tips}
                  onChange={(e) => updateField("tips", e.target.value)}
                  placeholder="Share your advice..."
                />
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(v) => updateField("difficulty", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => updateField("isAnonymous", e.target.checked)}
                />
                <Label htmlFor="anonymous">Submit anonymously</Label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  Submit
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}