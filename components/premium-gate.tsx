"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Lock } from "lucide-react";

interface PremiumGateProps {
  children: React.ReactNode;
}

export default function PremiumGate({ children }: PremiumGateProps) {
  const isPremium = useQuery(api.users.isPremium);

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-primary" />
        <CardTitle>Premium Content</CardTitle>
        <CardDescription>
          Upgrade to access this content and unlock all premium features
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Get exclusive access to company-specific resources, premium templates, and more.
        </p>
        <Button className="w-full">Upgrade to Premium - ₹99/mo</Button>
      </CardContent>
    </Card>
  );
}