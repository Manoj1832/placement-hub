"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, FileText, CheckCircle } from "lucide-react";

export default function ResumeReviewPage() {
  const [notes, setNotes] = useState("");

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Resume Review</CardTitle>
            <CardDescription className="text-zinc-400">
              Get professional feedback on your resume from industry experts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8 bg-zinc-800 rounded-lg">
              <p className="text-3xl font-bold text-white">₹299</p>
              <p className="text-sm text-zinc-500">One-time payment</p>
            </div>

            <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-400">
                <p className="font-medium">File upload coming soon</p>
                <p className="text-yellow-300">Configure Cloudflare R2 to enable resume upload. For now, you'll share your resume via email after booking.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Additional Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific areas you want feedback on..."
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
              Coming Soon - ₹299
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}