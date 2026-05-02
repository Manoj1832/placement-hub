"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Github, ArrowLeft } from "lucide-react";

export default function GitHubAuditPage() {
  const [githubUrl, setGithubUrl] = useState("");
  const { userId } = useAuth();
  const createBooking = useMutation(api.bookings.create);

  const handleSubmit = async () => {
    if (!githubUrl) return;
    try {
      await createBooking({
        serviceType: "github_audit",
        githubUrl,
        amount: 599,
      });
      alert("Booking created! Complete payment to proceed.");
    } catch (e) {
      alert("Error creating booking: " + e);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/browse" className="text-sm text-zinc-400 hover:text-white inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Github className="w-6 h-6 text-white" />
              <CardTitle className="text-white">GitHub Profile Audit</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">
              Get expert feedback on your GitHub profile and projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8 bg-zinc-800 rounded-lg">
              <p className="text-3xl font-bold text-white">₹599</p>
              <p className="text-sm text-zinc-500">One-time payment</p>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">GitHub Profile URL</Label>
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/yourusername"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            {!userId ? (
              <SignInButton mode="modal">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Sign In to Book - ₹599
                </Button>
              </SignInButton>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!githubUrl}
              >
                Book Audit - ₹599
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}