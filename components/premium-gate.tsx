"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface PremiumGateProps {
  children: React.ReactNode;
}

export default function PremiumGate({ children }: PremiumGateProps) {
  const isPremium = useQuery(api.users.isPremium);
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!userId) {
      alert("Please sign in first to upgrade to Premium!");
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 9900, productType: "premium", productId: "all-access" })
      });
      const data = await res.json();
      
      if (!data.orderId) throw new Error("Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "PSG Placement Hub",
        description: "Premium Access Unlock",
        order_id: data.orderId,
        handler: function (response: any) {
          // After successful payment, the webhook handles the rest, but we can alert the user
          alert("Payment Successful! Premium access is being granted. Please refresh the page in a few seconds.");
          window.location.reload();
        },
        theme: { color: "#2D1A5C" }
      };

      const loadRazorpay = () => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error("Failed to load Razorpay SDK");

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed to initialize.");
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <Card className="border-2 border-[#00FF7F]/20 bg-[#241350] text-white overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#392070] opacity-50 blur-[80px] -z-10" />
      
      <CardHeader className="text-center relative z-10 pb-2">
        <div className="w-16 h-16 rounded-full bg-[#00FF7F]/10 flex items-center justify-center mx-auto mb-4 border border-[#00FF7F]/20">
          <Lock className="w-8 h-8 text-[#00FF7F]" />
        </div>
        <CardTitle className="text-2xl font-bold text-white tracking-tight">Premium Content</CardTitle>
        <CardDescription className="text-white/60 text-base mt-2">
          Unlock the full experience and discover exclusive insights
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-6 relative z-10 pt-4">
        <p className="text-sm text-white/70">
          Get unlimited access to detailed interview rounds, technical questions, hidden behavioral strategies, and exclusive company resources.
        </p>
        <Button 
          onClick={handleUpgrade} 
          disabled={loading}
          className="w-full bg-[#00FF7F] text-black hover:bg-[#00cc66] font-semibold text-base py-6 rounded-xl shadow-[0_0_20px_rgba(0,255,127,0.3)] transition"
        >
          {loading ? "Initializing..." : "Unlock Premium - ₹99"}
        </Button>
      </CardContent>
    </Card>
  );
}