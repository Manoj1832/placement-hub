"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";

export default function ResumeReviewPage() {
  const [notes, setNotes] = useState("");

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Resume Review</CardTitle>
          <CardDescription>
            Get professional feedback on your resume from industry experts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8 bg-muted rounded-lg">
            <p className="text-3xl font-bold">₹299</p>
            <p className="text-sm text-muted-foreground">One-time payment</p>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">File upload coming soon</p>
              <p className="text-yellow-700">Configure Cloudflare R2 to enable resume upload. For now, you'll share your resume via email after booking.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific areas you want feedback on..."
            />
          </div>

          <Button className="w-full" disabled>
            Coming Soon - ₹299
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}