"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function GitHubAuditPage() {
  const [githubUrl, setGithubUrl] = useState("");
  const createBooking = useMutation(api.bookings.create);

  const handleSubmit = async () => {
    if (!githubUrl) return;
    await createBooking({
      serviceType: "github_audit",
      githubUrl,
      amount: 599,
    });
    alert("Booking created! Complete payment to proceed.");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>GitHub Profile Audit</CardTitle>
          <CardDescription>
            Get expert feedback on your GitHub profile and projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8 bg-muted rounded-lg">
            <p className="text-3xl font-bold">₹599</p>
            <p className="text-sm text-muted-foreground">One-time payment</p>
          </div>

          <div className="space-y-2">
            <Label>GitHub Profile URL</Label>
            <Input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/yourusername"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={!githubUrl}>
            Book Audit - ₹599
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}