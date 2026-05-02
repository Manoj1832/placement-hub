"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function PortfolioAuditPage() {
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const createBooking = useMutation(api.bookings.create);

  const handleSubmit = async () => {
    if (!portfolioUrl) return;
    await createBooking({
      serviceType: "portfolio_audit",
      portfolioUrl,
      amount: 799,
    });
    alert("Booking created! Complete payment to proceed.");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Audit</CardTitle>
          <CardDescription>
            Get expert feedback on your portfolio website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8 bg-muted rounded-lg">
            <p className="text-3xl font-bold">₹799</p>
            <p className="text-sm text-muted-foreground">One-time payment</p>
          </div>

          <div className="space-y-2">
            <Label>Portfolio URL</Label>
            <Input
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://yourportfolio.com"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={!portfolioUrl}>
            Book Audit - ₹799
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}