"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/toast-modal";

export default function PortfolioAuditPage() {
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.email;
  const createBooking = useMutation(api.bookings.create);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!portfolioUrl) return;
    try {
      await createBooking({
        serviceType: "portfolio_audit",
        portfolioUrl,
        amount: 799,
      });
      showToast("success", "Booking Created!", "Complete payment to proceed.");
    } catch (e) {
      showToast("error", "Booking Error", "Error creating booking: " + e);
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
              <Globe className="w-6 h-6 text-white" />
              <CardTitle className="text-white">Portfolio Audit</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">
              Get expert feedback on your portfolio website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8 bg-zinc-800 rounded-lg">
              <p className="text-3xl font-bold text-white">₹799</p>
              <p className="text-sm text-zinc-500">One-time payment</p>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Portfolio URL</Label>
              <Input
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://yourportfolio.com"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            {!userId ? (
              <Button 
                onClick={() => router.push("/sign-in")} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Sign In to Book - ₹799
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!portfolioUrl}
              >
                Book Audit - ₹799
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}